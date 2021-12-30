const { writeFile, readFile } = require('fs/promises')



const saveCookie = async (page, website) => {
  await page.waitForFunction(() => {
    console.log('!')
    if(window.x) return true
  }, { timeout: 0 })

  const cookie =  await page.cookies()

  await writeFile(`./cookies/${website}.json`, JSON.stringify(cookie))
}

const getCookie = async (website) => {
  const path = `./cookies/${website}.json`
  const data = await readFile(`./cookies/${website}.json`, {
    flag: 'a+'
  })
  
  // 这里可以再加入判断cookie是否过期,如果过期,则也直接return的逻辑
  if(!data.toString()) return 
  
  return JSON.parse(data.toString())
}



module.exports = { saveCookie, getCookie }