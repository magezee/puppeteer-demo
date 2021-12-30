const puppeteer = require('puppeteer')
const { saveCookie, getCookie } = require('./login')


const websites = {
  juejin: 'juejin'
}

const app = async() => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.setViewport({
    width: 1920,
    height: 1080
  })

  await Promise.all([
    page.goto('https://juejin.cn/'),
    page.waitForNavigation([
      'load',
      'domcontentloaded',
      'networkidle0'       
    ])
  ])

  // 获取指定网站cookie,如果本地文件没有存储,则进行存储
  let cookie = await getCookie(websites.juejin)

  if(!cookie) {
    console.log('需要登入...')
    await saveCookie(page, websites.juejin)
    cookie = await getCookie(websites.juejin)
  }

  await page.setCookie(...cookie)

  await page.reload()

}

app()






