'use client'
import { useEffect, useRef } from 'react'

/*
 * Live, footage-like imagery inside project title lettering.
 * The title's own glyphs (read from the DOM so wrapping and spacing match exactly)
 * are drawn into a mask; a WebGL scene picked by the project's theme plays inside them:
 *   soc        – security operations wall: monitors with scrolling logs, charts, alert flashes
 *   network    – fibre-optic strands with light packets racing through them
 *   enterprise – data-centre racks with blinking status LEDs
 *   cloud      – time-lapse clouds rolling across a bright sky
 *   threat     – violet storm with red lightning-like veins
 *   voice      – live audio spectrum with soft reflections
 *   engineering– circuit board traces with travelling current
 *   community  – golden-hour light with drifting bokeh
 * If WebGL isn't available nothing is drawn and the original title effect stays.
 */

export const SCENES = ['soc', 'network', 'enterprise', 'cloud', 'threat', 'voice', 'engineering', 'community'] as const

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

const FRAG = `
precision highp float;
uniform vec2 R; uniform float T; uniform float M; uniform float L; uniform sampler2D K;

float h1(float n){return fract(sin(n)*43758.5453);}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*n2(p);p=m*p;a*=.5;}return v;}
vec3 bokeh(vec2 p,float sc,vec3 tint,float t){
  vec2 g=p*sc+vec2(t*.15,0.);vec2 id=floor(g);vec2 f=fract(g)-.5;float r=h21(id);
  vec2 o=(vec2(h21(id+3.),h21(id+9.))-.5)*.5;float d=length(f-o);
  return tint*smoothstep(.32,.22,d)*step(.55,r)*(.35+.65*h21(id+5.))*.5;
}

// ---------- SOC: wall of monitors ----------
vec3 soc(vec2 p,float t){
  vec3 col=vec3(.07,.11,.19);
  vec2 g=p*vec2(1.25,1.6)+vec2(0.,.15);vec2 id=floor(g);vec2 f=fract(g);
  float r=h21(id);
  float screen=step(.05,f.x)*step(f.x,.95)*step(.07,f.y)*step(f.y,.93);
  vec2 s=(f-vec2(.05,.07))/vec2(.9,.86);
  vec3 base=vec3(.05,.14,.27);vec3 ink=vec3(.40,.85,1.);
  float alert=step(.86,r);
  if(alert>.5){base=vec3(.16,.02,.03);ink=vec3(1.,.32,.28);}
  else if(r>.62){ink=vec3(.35,.95,.80);}
  vec3 sc=base;
  float kind=fract(r*7.3);
  if(kind<.55){ // scrolling log lines
    float rows=9.;float y=s.y*rows+t*(1.2+r*2.);float row=floor(y);
    float len=.25+.7*h21(vec2(row,id.x*7.+id.y));
    float line=step(.35,fract(y))*step(s.x,len)*step(.04,s.x);
    float hi=step(.93,h21(vec2(row*3.,id.y)));
    sc+=mix(ink*.75,vec3(1.,.45,.35),hi)*line;
  } else if(kind<.8){ // live bar chart
    float bars=12.;float bx=floor(s.x*bars);
    float hgt=.15+.75*n2(vec2(bx*.7,t*.9+r*20.));
    float bar=step(s.y,hgt)*step(.18,fract(s.x*bars));
    sc+=ink*bar*(.55+.45*s.y/hgt);
    sc+=ink*.25*step(abs(s.y-.85),.006);
  } else { // world map dots + sweep
    float m=step(.55,fbm(s*vec2(4.,2.5)+r*10.));
    vec2 dg=fract(s*vec2(36.,20.))-.5;float dot_=smoothstep(.3,.15,length(dg));
    sc+=ink*.45*m*dot_;
    float sweep=smoothstep(.05,0.,abs(fract(s.x-t*.25)-.5)-.45);
    sc+=ink*.35*sweep;
  }
  if(alert>.5) sc*=.6+.6*step(.5,fract(t*1.2+r*3.));
  sc+=ink*.08;                         // screen glow
  sc*=.88+.12*sin(gl_FragCoord.y*1.3);        // faint scanlines
  col=mix(col,sc,screen);
  col+=ink*.10*(1.-screen);            // light spill on bezels
  return col;
}

// ---------- NETWORK: fibre-optic strands ----------
vec3 network(vec2 p,float t){
  vec3 col=vec3(.02,.07,.09)+bokeh(p,2.2,vec3(.15,.75,.7),t)*1.4;
  for(int i=0;i<12;i++){
    float fi=float(i);
    float y=.06+.075*fi+.07*sin(p.x*(1.1+.5*h1(fi))+fi*1.7+t*.3);
    float d=abs(p.y-y);
    float core=exp(-d*70.);float halo=exp(-d*9.);
    vec3 c=mix(vec3(.15,1.,.8),vec3(.25,.65,1.),h1(fi+2.));
    col+=c*(core*.55+halo*.10);
    float sp=.35+.5*h1(fi+5.);
    float ph=fract(p.x*.45-t*sp+h1(fi+9.));
    float pulse=pow(ph,14.)*2.4+pow(ph,60.)*3.;
    col+=c*core*pulse+vec3(1.)*core*pow(ph,80.)*2.;
  }
  return col;
}

// ---------- ENTERPRISE: data-centre racks ----------
vec3 enterprise(vec2 p,float t){
  vec3 col=vec3(.10,.13,.18);
  float rx=fract(p.x*.9);float rid=floor(p.x*.9);
  float frame=step(.06,rx)*step(rx,.94);
  float u=p.y*7.;float uid=floor(u);float uf=fract(u);
  float unit=step(.12,uf)*step(uf,.9);
  col=mix(col,vec3(.13,.15,.19)+.05*h21(vec2(rid,uid))+.04*step(.5,fract(uf*6.)),frame*unit);
  for(int k=0;k<4;k++){
    float fk=float(k);
    float lx=.12+fk*.06;
    vec2 ld=vec2((rx-lx)*9.,(uf-.5)*1.3);
    float led=smoothstep(.22,.05,length(ld));
    float r=h21(vec2(rid*17.+fk,uid));
    float blink=step(.35,fract(t*(1.+r*5.)+r*9.));
    vec3 lc=r<.55?vec3(.2,1.,.45):r<.85?vec3(.25,.6,1.):vec3(1.,.65,.15);
    col+=lc*led*blink*frame*unit*1.6;
    col+=lc*smoothstep(.9,.0,length(ld)*.4)*blink*frame*unit*.08;
  }
  col+=vec3(.25,.5,.85)*.22*exp(-abs(rx-.5)*2.5)*frame;   // aisle light
  return col;
}

// ---------- CLOUD: time-lapse sky ----------
vec3 cloudscape(vec2 p,float t){
  vec2 uv=gl_FragCoord.xy/R;
  vec3 sky=mix(vec3(.5,.72,.98),vec3(.12,.34,.8),p.y);
  sky+=vec3(1.,.85,.55)*exp(-length(p-vec2(R.x/R.y*.82,.75))*2.5)*.6;
  vec2 q=p*vec2(.9,1.6)+vec2(t*.12,0.);
  vec2 w=vec2(fbm(q+t*.05),fbm(q+4.2-t*.04));
  float d=smoothstep(.34,.72,fbm(q+1.4*w));
  float shade=fbm(q*1.6+w+.6);
  vec3 cl=mix(vec3(.55,.6,.7),vec3(1.,.99,.97),smoothstep(.3,.7,shade));
  return mix(sky,cl,d);
}

// ---------- THREAT: violet storm, red veins ----------
vec3 threat(vec2 p,float t){
  vec2 q=p*1.4;
  vec2 w=vec2(fbm(q+t*.12),fbm(q+5.+t*.1));
  float f=fbm(q+2.*w);
  vec3 col=mix(vec3(.05,.02,.12),vec3(.42,.24,.85),f*f*1.6);
  float ridge=1.-abs(fbm(q*1.6+w*2.-t*.15)*2.-1.);
  col+=vec3(1.,.2,.25)*pow(ridge,18.)*1.6;
  col+=vec3(.75,.6,1.)*pow(ridge,40.)*1.2;
  float gl=step(.985,h21(vec2(floor(p.y*30.),floor(t*8.))));
  col+=vec3(1.,.3,.4)*gl*.35;
  return col;
}

// ---------- VOICE: audio spectrum ----------
vec3 voice(vec2 p,float t){
  vec3 col=vec3(.03,.08,.1)+bokeh(p,2.,vec3(.2,.9,.75),t)*1.3;
  float bx=floor(p.x*9.);
  float x=fract(p.x*9.);
  float amp=.25+.75*pow(n2(vec2(bx*.31,t*2.6)),1.3);
  float mid=.5;float d=abs(p.y-mid);
  float bar=step(d,amp*.5)*step(.18,x)*step(x,.82);
  vec3 c=mix(vec3(.2,1.,.8),vec3(.35,.6,1.),p.y);
  col+=c*bar*(.7+.6*(1.-d/(amp*.5+.001)));
  col+=c*exp(-max(0.,d-amp*.5)*10.)*.3*step(.18,x)*step(x,.82);
  return col;
}

// ---------- ENGINEERING: circuit board ----------
vec3 engineering(vec2 p,float t){
  vec3 col=vec3(.05,.17,.12);
  vec2 g=p*3.2;vec2 id=floor(g);vec2 f=fract(g);
  float r=h21(id);
  float horiz=step(.5,r);
  float trace=horiz>.5?smoothstep(.07,.03,abs(f.y-.5)):smoothstep(.07,.03,abs(f.x-.5));
  float pad=smoothstep(.16,.1,length(f-.5))*step(.8,h21(id+3.));
  vec3 copper=vec3(.85,.6,.3);
  col+=copper*.75*(trace+pad);
  float along=horiz>.5?(id.x+f.x):(id.y+f.y);
  float cur=pow(fract(along*.2-t*(.4+r*.6)+r*5.),18.);
  col+=vec3(.4,1.,.85)*cur*trace*2.2;
  col+=vec3(.05,.15,.1)*fbm(p*3.);
  return col;
}

// ---------- COMMUNITY: golden-hour light ----------
vec3 community(vec2 p,float t){
  vec2 uv=gl_FragCoord.xy/R;
  vec3 col=mix(vec3(.95,.55,.2),vec3(.45,.18,.25),uv.y);
  col+=vec3(1.,.85,.5)*exp(-length(p-vec2(R.x/R.y*.25,.3))*1.8)*.8;
  col+=bokeh(p,2.2,vec3(1.,.8,.45),t*1.4)*1.6;
  col+=bokeh(p+7.,3.5,vec3(1.,.6,.35),t*1.1);
  return col;
}

void main(){
  vec2 uv=gl_FragCoord.xy/R;
  float a=texture2D(K,uv).a;
  if(a<.004){gl_FragColor=vec4(0.);return;}
  float yTop=R.y-gl_FragCoord.y;
  float line=floor(yTop/L);
  vec2 p=vec2(gl_FragCoord.x/L+line*3.7,1.-fract(yTop/L));
  // slow camera pan: the image drifts left to right continuously and seamlessly
  p.x-=T*.16;
  float tt=T*.3;                  // calm the motion inside the image
  vec3 c;
  if(M<.5)c=soc(p,tt);else if(M<1.5)c=network(p,tt);else if(M<2.5)c=enterprise(p,tt);
  else if(M<3.5)c=cloudscape(p,tt);else if(M<4.5)c=threat(p,tt);else if(M<5.5)c=voice(p,tt);
  else if(M<6.5)c=engineering(p,tt);else c=community(p,tt);
  // bevel light on the top-left of each glyph, soft shadow bottom-right
  vec2 px=1./R;float e=L*.022;
  float up=texture2D(K,uv+vec2(-1.,1.)*e*px).a;
  float dn=texture2D(K,uv+vec2(1.,-1.)*e*px).a;
  float mn=min(min(texture2D(K,uv+vec2(e,0.)*px).a,texture2D(K,uv-vec2(e,0.)*px).a),min(texture2D(K,uv+vec2(0.,e)*px).a,texture2D(K,uv-vec2(0.,e)*px).a));
  float rim=clamp(a-mn,0.,1.);
  c+=vec3(.75,.88,1.)*rim*.38;                 // glass edge so every letter reads
  c+=vec3(.95,.97,1.)*max(0.,a-up)*.45;         // top-left bevel light
  c*=1.-max(0.,a-dn)*.3;
  c=c/(1.+c*.25);
  c+=(h21(gl_FragCoord.xy+fract(T)*61.)-.5)*.03;
  gl_FragColor=vec4(c*a,a);
}`

type Props = { scene: string; animate: boolean; textRef: React.RefObject<HTMLSpanElement> }

export default function TitleScene({ scene, animate, textRef }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(animate)
  animRef.current = animate

  useEffect(() => {
    const canvas = ref.current, textEl = textRef.current
    const host = canvas?.parentElement
    if (!canvas || !textEl || !host) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) return
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null }
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(prog, 'R'), uT = gl.getUniformLocation(prog, 'T'), uM = gl.getUniformLocation(prog, 'M'), uL = gl.getUniformLocation(prog, 'L')
    gl.uniform1f(uM, Math.max(0, SCENES.indexOf(scene as typeof SCENES[number])))
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    const mask = document.createElement('canvas')

    let ready = false
    const t0 = performance.now() - Math.random() * 20000
    const frame = (now: number) => {
      gl.uniform1f(uT, (now - t0) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // Draw the title's glyphs exactly where the browser laid them out.
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const box = host.getBoundingClientRect()
      const w = Math.max(1, Math.round(box.width * dpr)), h = Math.max(1, Math.round(box.height * dpr))
      canvas.width = w; canvas.height = h; mask.width = w; mask.height = h
      gl.viewport(0, 0, w, h); gl.uniform2f(uR, w, h)
      const ctx = mask.getContext('2d')!
      ctx.clearRect(0, 0, w, h)
      const cs = getComputedStyle(textEl)
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic'
      const fs = parseFloat(cs.fontSize) || 40
      const lh = parseFloat(cs.lineHeight)
      gl.uniform1f(uL, (Number.isFinite(lh) && lh > 0 ? lh : fs * 1.2) * dpr)
      const upper = cs.textTransform === 'uppercase'
      const node = textEl.firstChild
      if (!node || node.nodeType !== Node.TEXT_NODE) return false
      const text = node.textContent ?? ''
      const range = document.createRange()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      let drew = false
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch.trim() === '') continue
        range.setStart(node, i); range.setEnd(node, i + 1)
        const r = range.getClientRects()[0]
        if (!r) continue
        const g = upper ? ch.toUpperCase() : ch
        const m = ctx.measureText(g)
        const asc = m.fontBoundingBoxAscent ?? r.height * 0.8
        ctx.fillText(g, r.left - box.left, r.top - box.top + asc)
        drew = true
      }
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask)
      return drew
    }

    let raf = 0, visible = false, last = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!ready || !visible || document.hidden || !animRef.current || now - last < 33) return
      last = now; frame(now)
    }
    const relayout = () => {
      if (!layout()) return
      ready = true
      host.classList.add('title-scene-live')
      frame(performance.now())
    }
    const fontSpec = (() => { const cs = getComputedStyle(textEl); return `${cs.fontWeight} 40px ${cs.fontFamily}` })()
    Promise.resolve(document.fonts?.load(fontSpec)).catch(() => {}).then(() => document.fonts?.ready).then(relayout)
    const ro = new ResizeObserver(() => { if (ready) relayout() })
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(canvas)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      host.classList.remove('title-scene-live')
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [scene, textRef])

  return <canvas ref={ref} aria-hidden className="title-scene" />
}
