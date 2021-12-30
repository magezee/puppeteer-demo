const puppeteer = require('puppeteer')
const path = require('path')

const screenshot = async (url, config={}) => {
  
  let { 
    viewPort = { width: 1920, height: 1080 }, 
    maxHeight = 1080, 
    browserWSEndpoint = null, 
    browserConfig = {},
    fullPage = false,
  } = config

  let browser = null

  if (fullPage) {
    maxHeight = Infinity                                           // 对于无限滚动，设置该字段可以一直截取下去,覆盖maxHeight字段
  }
  
  if (browserWSEndpoint) {
    browser = await puppeteer.connect({ browserWSEndpoint })      // 如果存在浏览器实例，则直接连接
  } else {
    browser = await puppeteer.launch(browserConfig)
  }

  const page = await browser.newPage()
  await page.setViewport(viewPort)

  await Promise.all([
    page.goto(url),
    page.waitForNavigation([
      'load',
      'domcontentloaded',
      'networkidle0'       
    ])
  ])

  const maxTime = Math.ceil(maxHeight / viewPort.height)

  const documentHeight =  await page.evaluate(async (maxTime, height) => {
    for(let i=1; i<maxTime; i++ ) {
      const curHeight = i * height

      window.scrollTo({
        left: 0,
        top: curHeight - height,
        behavior: 'smooth'
      }) 

      // 这里主动延时是等待跳转连接后新的请求加载完毕,否则容器高度更新不及时
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        },500)
      })

      const documentHeight = document.documentElement.scrollHeight    // 由于可能加载新元素发生容器高度变化，因此每一次都获取一次容器高度

      // 当前视窗理论高度大于总容器高度则判断已到达网页末尾
      if(curHeight >= documentHeight) {
        return documentHeight
      } 
    }
  }, maxTime, viewPort.height)
  
  const imgPath = path.resolve(__dirname, `./imgs/${new Date().valueOf()}.png`)

  await page.screenshot({
    path: imgPath,
    fullPage: fullPage,
    clip: fullPage ? null : {
      x: 0,
      y: 0,                  
      width: viewPort.width,
      height: documentHeight || maxHeight                             // 如果网页没有达到最大高度,则截取网页高度
    }
  })

  await page.close()
  await browser.close()

  return imgPath

  
}

module.exports = screenshot