const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const targets = [
  { id:'salone-aegis', url:'https://web-pink-chi-66.vercel.app', check:/aegis|salone/i },
  { id:'blue-soc-p8', url:'https://bluesoc.vercel.app', check:/blue.?soc|security operations|soc dashboard/i },
  { id:'pandie-foundation', url:'https://pandiefoundation.org', check:/pandie foundation/i },
  { id:'pweza-voice-agent', url:'https://josephkamara.vercel.app', check:/pweza/i, assistant:true }
]
;(async()=>{
  const browser = await chromium.launch({headless:true})
  const manifest = {}
  fs.mkdirSync('public/screenshots',{recursive:true})
  try {
    for(const target of targets){
      const context = await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1, reducedMotion:'reduce'})
      try {
        const page=await context.newPage()
        await page.route('**/*', route => {
          const req=route.request()
          // Public, read-only capture; do not submit forms or trigger service APIs.
          if (!['GET','HEAD'].includes(req.method())) return route.abort()
          return route.continue()
        })
        const response=await page.goto(target.url,{waitUntil:'domcontentloaded',timeout:35000})
        if(!response?.ok()) throw Error('HTTP '+response?.status())
        await page.waitForTimeout(3500)
        await page.evaluate(()=>document.fonts.ready)
        if(target.assistant){
          const launch=page.locator('button[aria-controls="pweza-panel"]')
          await launch.waitFor({state:'visible',timeout:10000})
          await launch.click({timeout:10000})
          await page.locator('#pweza-panel[aria-hidden="false"]').waitFor({timeout:5000})
          await page.waitForTimeout(900)
        }
        const content=(await page.title())+' '+(await page.locator('body').innerText())
        if(!target.check.test(content)||/^(?:vercel authentication|deployment not found|404: not found)/i.test(content.trim())) throw Error('Project identity not verified')
        const filename=target.id+'-actual.jpg'
        const dest=path.join('public/screenshots',filename)
        await page.screenshot({path:dest,type:'jpeg',quality:82,animations:'disabled'})
        manifest[target.id]='/screenshots/'+filename
        console.log('Captured',target.id, page.url())
      }catch(e){console.warn('Skipped',target.id,String(e))}
      finally {await context.close()}
    }
  }finally{await browser.close()}
  fs.writeFileSync('data/next-project-previews.json',JSON.stringify(manifest,null,2)+'\n')
})().catch(e=>{console.error(e);process.exitCode=1})
