'use client'
import { useEffect, useRef } from 'react'

/*
 * Photoreal night sky for the status pill, rendered live on the GPU:
 * a lit full moon with a textured surface, two layers of domain-warped
 * volumetric clouds lit from the moon (silver edges, light bleeding
 * through thin cloud), atmospheric glow, twinkling stars and fine film grain.
 * If WebGL isn't available the CSS/SVG sky underneath stays visible.
 */

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

const FRAG = `
precision highp float;
uniform vec2 R;      // canvas size in device pixels
uniform float T;     // seconds
uniform float H;     // hover 0..1

float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*n2(p);p=m*p;a*=.5;}return v;}

// moon centre in pixels: glides slowly across and back, with a gentle arc
vec2 moonPos(){
  float r=R.y*.25;
  float k=.5-.5*cos(T*3.14159/44.);
  float x=mix(r*1.35,R.x-r*1.35,k);
  float y=R.y*.5+R.y*.06*sin(k*3.14159);
  return vec2(x,y);
}

float clouds(vec2 q,float t,float seed){
  vec2 w=vec2(fbm(q*.9+vec2(t*.05,seed)),fbm(q*.9+vec2(seed,-t*.04)+3.1));
  float d=fbm(q+1.7*w+vec2(t,0.));
  return d;
}

void main(){
  vec2 p=gl_FragCoord.xy;
  float h=R.y;
  vec2 m=moonPos();
  float r=h*.25;
  float dm=length(p-m);

  // sky: deep blue night, lighter near the horizon, scattered moonlight
  vec2 uv=p/R;
  vec3 col=mix(vec3(.035,.06,.13),vec3(.02,.035,.085),uv.y);
  col+=vec3(.08,.10,.16)*(1.-uv.y)*.6;
  float glow=exp(-dm/(h*1.1))*.22+exp(-dm/(h*.38))*.34+exp(-dm/(h*.16))*.55;
  col+=vec3(.80,.84,.92)*glow*(1.+.35*H);

  // stars
  vec2 g=p/(h*.11);vec2 id=floor(g);float s=h21(id);
  if(s>.93){vec2 c=fract(g)-.5+.3*(vec2(h21(id+7.),h21(id+13.))-.5);
    float tw=.55+.45*sin(T*(1.5+s*3.)+s*40.);
    col+=vec3(.9,.93,1.)*smoothstep(.07,0.,length(c))*tw*.8*max(0.,1.-glow*2.);}

  // moon disc with surface detail and soft limb
  if(dm<r*1.05){
    vec2 q=(p-m)/r;float l2=dot(q,q);
    float z=sqrt(max(0.,1.-l2));
    vec3 nrm=vec3(q,z);
    vec2 sph=vec2(atan(q.x,z),asin(clamp(q.y,-1.,1.)));
    float maria=smoothstep(.5,.72,fbm(sph*2.6+vec2(4.,1.)))*.85+smoothstep(.55,.7,fbm(sph*5.+9.))*.25;
    float fine=fbm(sph*9.)*.5+fbm(sph*22.)*.5;
    float alb=.97-.30*maria-.14*(fine-.5);
    float lam=max(0.,dot(nrm,normalize(vec3(.28,.18,.94))));
    vec3 mc=vec3(1.,.985,.955)*alb*(.55+.6*lam)*(.86+.14*z)*1.28;
    float edge=smoothstep(1.,.965,sqrt(l2));
    col=mix(col,mc,edge);
  }

  // two cloud decks drifting at different speeds, lit by the moon
  vec2 cq=vec2(p.x/h*.42,p.y/h*1.3);
  float far=clouds(cq*1.1+vec2(0.,.4),T*.018,1.3);
  float near=clouds(cq*.8+vec2(5.,-.2),T*.035,7.7);
  float dFar=smoothstep(.28,.62,far)*.92;
  float dNear=smoothstep(.33,.64,near)*(.5+.5*smoothstep(1.,.1,uv.y));

  float lit=exp(-dm/(h*.75));
  float rim=exp(-dm/(h*.38));
  vec3 cDark=vec3(.12,.15,.24);
  vec3 cLit=vec3(.86,.88,.94);
  vec3 farCol=mix(cDark*.8,cLit*.8,.18+.75*lit);
  farCol+=vec3(1.,.97,.9)*rim*(1.-dFar)*.9*(1.+.4*H);
  col=mix(col,farCol,dFar*.78);
  vec3 nearCol=mix(cDark,cLit,.22+.78*lit);
  nearCol+=vec3(1.,.96,.88)*rim*smoothstep(.0,.6,dNear)*(1.-dNear)*1.4*(1.+.4*H);
  col=mix(col,nearCol,dNear*.9);
  // light leaking through thin cloud in front of the moon
  col+=vec3(.95,.93,.88)*exp(-dm/(h*.25))*(dFar+dNear)*.2*smoothstep(r*.85,r*1.25,dm);

  // filmic finish: gentle tonemap, vignette, grain
  col=col/(1.+col*.32);
  col*=1.-.35*pow(abs(uv.x-.5)*1.6,3.);
  col+=(h21(p+fract(T)*97.)-.5)*.035;
  col=pow(col,vec3(.95));
  gl_FragColor=vec4(col,1.);
}`

export default function SkyShader({ hover = false }: { hover?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const hoverRef = useRef(0)
  const targetHover = useRef(0)
  targetHover.current = hover ? 1 : 0

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' })
    if (!gl) return

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(prog, 'R'), uT = gl.getUniformLocation(prog, 'T'), uH = gl.getUniformLocation(prog, 'H')

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
      gl.viewport(0, 0, w, h)
    }
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize()

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now() - 9000 // begin with the moon already partway along its path
    let raf = 0, visible = true, last = 0
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (!visible || document.hidden || now - last < 33) return // ~30fps is plenty for slow clouds
      last = now
      hoverRef.current += (targetHover.current - hoverRef.current) * 0.08
      gl.uniform2f(uR, canvas.width, canvas.height)
      gl.uniform1f(uT, (now - start) / 1000)
      gl.uniform1f(uH, hoverRef.current)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    canvas.parentElement?.classList.add('sky-live')
    if (reduced) {
      gl.uniform2f(uR, canvas.width, canvas.height); gl.uniform1f(uT, 18); gl.uniform1f(uH, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    } else {
      raf = requestAnimationFrame(draw)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      canvas.parentElement?.classList.remove('sky-live')
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="sky-canvas" />
}
