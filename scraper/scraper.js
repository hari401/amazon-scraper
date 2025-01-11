const { chromium } = require("playwright");
const fs = require("fs");
const url =
  "https://www.amazon.com/CyberPowerPC-i5-13400F-GeForce-Windows-GXiVR8060A24/dp/B0DCMPRRFD/ref=sr_1_2?_encoding=UTF8&content-id=amzn1.sym.860dbf94-9f09-4ada-8615-32eb5ada253a&dib=eyJ2IjoiMSJ9.d9IPnRE6tAt-jLfAjOennMsi2gvc_SVjnwakOg1-CmdlbLImSTAtRPq25Kia8jaSv3XP1D0J8aTkdptV_IJGXFWZVJxlf6VqNe6kg1DZZDr6Yb9JCHMV7-uq3lFzzKki3gOiklo9OKFISTaXFfLm3L-4udn7gCPOHWAQwVgONQLaPQiSh4Jf1SOQPq5hVTrYbegg7cRgQTsmbzsBrYk7my71uIODG_DePjOtsmKrYc509yuRCjFQI4v6I2SdC4wERbTGd2DSmXyGNrcKLxgGG_WwJczcF0ibFy0ODjLHuy1CiY2zoAsXawHFNvnw6bmTJxYANBqDeLKgg_CrTY1dXTwN0-J7sB2LRGISzfchMjcchr8uZHmDpa7l5mA1IvbB1Au9gewyXX7OUVT0G9Gavi-Lq8SDw3sGPwKR5H1fVcsmn-RBFdrXGguPWuaDjYVV._fZGj_JBQqtPi8y-3Ha--_8p7b1kZkt-JS6MBZqCfDU&dib_tag=se&keywords=gaming&pd_rd_r=5b450079-cc57-4eed-a805-7039a5dc94a6&pd_rd_w=hDZic&pd_rd_wg=gffXZ&pf_rd_p=860dbf94-9f09-4ada-8615-32eb5ada253a&pf_rd_r=PSBBNY5Q2JQZEXX6FJ6D&qid=1736552299&sr=8-2&th=1";
/**
* Save data as list of dictionaries
as json file
* @param {object} data
*/
function saveData(data) {
  let dataStr = JSON.stringify(data, null, 2);
  fs.writeFile("data.json", dataStr, "utf8", function (err) {
    if (err) {
      console.log("An error occurred while writing JSON Object to File.");
      return console.log(err);
    }
    console.log("JSON file has been saved.");
  });
}
function cleanData(data) {
  if (!data) {
    return;
  }
  // removing extra spaces and unicode characters
  let cleanedData = data.split(/s+/).join(" ").trim();
  cleanedData = cleanedData.replace(/[^x00-x7F]/g, "");
  return cleanedData;
}
// The data extraction function used to extract
// necessary data from the element.
async function extractData(data, type) {
  let count = await data.count();
  if (count) {
    if (type == "innerText") {
      return await data.innerText();
    } else {
      return await data.getAttribute(type);
    }
  }
  return null;
}

async function parsePage(page) {
  // initializing xpaths
  let titleXPath = '//*[@id="title"]';
  let asinSelector = "//td/div[@id='averageCustomerReviews']";
  let ratingXPath =
    "//div[@id='prodDetails']//i[contains(@class,'review-stars')]/span";
  let ratingsCountXPath =
    "//div[@id='prodDetails']//span[@id='acrCustomerReviewText']";
  let sellingPriceXPath = "//input[@id='priceValue']";
  let listingPriceXPath =
    "//div[@id='apex_desktop_qualifiedBuybox']//span[@class='a-price a-text-price']/span[@class='a-offscreen']";
  let imgLinkXPath = "//div[contains(@class,'imgTagWrapper')]//img";
  let brandXPath =
    "//tr[contains(@class,'po-brand')]//span[@class='a-size-base po-break-word']";
  let statusXPath =
    "//div[@id='availabilityInsideBuyBox_feature_div']//div[@id='availability']/span";
  let productDescriptionXPath = "//div[@id='productDescription']//span";
  // wait until page loads
  await page.waitForSelector(titleXPath);
  // extract data using xpath
  let productTitle = page.locator(titleXPath);
  productTitle = await extractData(productTitle, (type = "innerText"));
  let asin = page.locator(asinSelector);
  asin = await extractData(asin, (type = "data-asin"));
  let rating = page.locator(ratingXPath);
  rating = await extractData(rating, (type = "innerText"));
  let ratingCount = page.locator(ratingsCountXPath);
  ratingCount = await extractData(ratingCount, (type = "innerText"));
  let sellingPrice = page.locator(sellingPriceXPath);
  sellingPrice = await extractData(sellingPrice, (type = "value"));
  let listingPrice = page.locator(listingPriceXPath);
  listingPrice = await extractData(listingPrice, (type = "innerText"));
  let brand = page.locator(brandXPath);
  brand = await extractData(brand, (type = "innerText"));
  let productDescription = page.locator(productDescriptionXPath);
  productDescription = await extractData(
    productDescription,
    (type = "innerText")
  );
  let imageLink = page.locator(imgLinkXPath);
  imageLink = await extractData(imageLink, (type = "src"));
  let status = page.locator(statusXPath);
  status = await extractData(status, (type = "innerText"));
  // cleaning data
  productTitle = cleanData(productTitle);
  asin = cleanData(asin);
  rating = cleanData(rating);
  ratingCount = cleanData(ratingCount);
  sellingPrice = cleanData(sellingPrice);
  listingPrice = cleanData(listingPrice);
  brand = cleanData(brand);
  imageLink = cleanData(imageLink);
  status = cleanData(status);
  productDescription = cleanData(productDescription);
  let dataToSave = {
    productTitle: productTitle,
    asin: asin,
    rating: rating,
    ratingCount: ratingCount,
    sellingPrice: sellingPrice,
    listingPrice: listingPrice,
    brand: brand,
    imageLinks: imageLink,
    status: status,
    productDescription: productDescription,
  };
  saveData(dataToSave);
}
/**
 * The main function initiates a browser object and handles the navigation.
 */
async function run() {
  // initializing browser and creating new page
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  page.setDefaultTimeout(30000);
  // Navigating to the home page
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await parsePage(page);
  await context.close();
  await browser.close();
}
run();
