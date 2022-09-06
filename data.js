const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const reader = require('xlsx');

puppeteer.use(StealthPlugin());
const requestParams = {
  baseURL: `http://google.com`,
  query: "Украина Киев бары",                                          
  hl: "ru",                                                    
};


async function scrollPage(page, scrollContainer) {
  let lastHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
  while (true) {
    await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
    await page.waitForTimeout(4000);
    let newHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
    if (newHeight === lastHeight) {
      break;
    }
    lastHeight = newHeight;
  }
}

const getData = async (page) => {
  return await page.evaluate((opts) => {
    const elements = document.querySelectorAll(".bJzME.Hu9e2e.tTVLSc");
    const placesElements = Array.from(elements).map(element => element.parentElement);

    const places = placesElements.map((place) => {
      const name = (place.querySelector(".DUwDvf")?.textContent || '').trim();
      const number = (place.querySelector("button[data-tooltip='Скопировать номер']")?.textContent.trim());
      return { name, number};
    })
    return places;
  });
}

async function getLocalPlacesInfo() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const URL = `${requestParams.baseURL}/maps/search/${requestParams.query}?hl=${requestParams.hl}`;
  await page.setDefaultNavigationTimeout(60000);
  await page.goto(URL);
  await page.waitForNavigation();
  // const scrollContainer = ".m6QErb[aria-label]";
  let localPlacesInfo = [];
  let res = [];
  // await scrollPage(page, scrollContainer);

  await page.waitForTimeout(2000);
  const elHandleArray = await page.$$('div.Nv2PK')
  for (const el of elHandleArray) {
    await el.click('.hfpxzc');
    await page.waitForTimeout(1500);
    await page.waitForSelector(".DUwDvf");
    const page_info = await getData(page);
    localPlacesInfo = localPlacesInfo.concat(page_info);
    await page.waitForTimeout(1500);
    await el.click('.VfPpkd-icon-LgbsSe');
  }
  const file = reader.readFile('test.xlsx')
  const ws = reader.utils.json_to_sheet(localPlacesInfo)
  reader.utils.book_append_sheet(file,ws,"Data")
  reader.writeFile(file,'test.xlsx')


  fs.writeFileSync("final.json", JSON.stringify(localPlacesInfo));
  await browser.close();
  return 'Good';

}
getLocalPlacesInfo().then(console.log);