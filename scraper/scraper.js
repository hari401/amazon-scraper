const { chromium } = require("playwright");
const fs = require("fs");

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
async function runScraper(url) {
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

module.exports = { runScraper };
