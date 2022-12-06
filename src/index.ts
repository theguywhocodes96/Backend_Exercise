import fetch from 'cross-fetch';
import _taxRates from './data/taxRate.json' assert { type: "json" };
import _importedItems from './data/importedItems.json' assert { type: "json" };
import _records from './data/records.json' assert { type: "json" };

/**
 * Get site titles of cool websites.
 *
 * Task: Can we change this to make the requests async so they are all fetched at once then when they are done, return all
 * the titles and make this function faster?
 *
 * @returns array of strings
 */
export async function returnSiteTitles() {

  const urls = [
    'https://patientstudio.com/',
    'https://www.startrek.com/',
    'https://www.starwars.com/',
    'https://www.neowin.net/'
  ]

  let titles = [];

  titles = await Promise.all(urls.map(async (url) => {
    const response = await fetch(url, { method: 'GET' });

    if (response.status === 200) {

      const data = await response.text();

      const match = data.match(/<title>(.*?)<\/title>/);

      if (match?.length) {
        titles.push(match[1]);
        return match[1];
      }
    }
  }));

  console.log('titles: ',titles);
  return titles;
}

// returnSiteTitles();

/**
 * Count the tags and organize them into an array of objects.
 *
 * Task: That's a lot of loops; can you refactor this to have the least amount of loops possible.
 * The test is also failing for some reason.
 *
 * @param localData array of objects
 * @returns array of objects
 */
export function findTagCounts(localData: Array<SampleDateRecord>): Array<TagCounts> {
  const tagCounts: Array<TagCounts> = [];

  for (let i = 0; i < localData.length; i++) {
    const tags = localData[i].tags;

    for (let j = 0; j < tags.length; j++) {
      const tag = tags[j];
      
      let pushedTags = tagCounts.find(tagCount => tagCount?.tag === tag);
      if (pushedTags?.tag === tag) {
        pushedTags.count++
      }
      else {
        tagCounts.push({ tag, count: 1 })
      }
    }
  }
  
  console.log('tagCounts:' ,tagCounts);
  return tagCounts;

}

// findTagCounts(_records);

/**
 * Calcualte total price
 *
 * Task: Write a function that reads in data from `importedItems` array (which is imported above) and calculates the total price, including taxes based on each
 * countries tax rate.
 *
 * Here are some useful formulas and infomration:
 *  - import cost = unit price * quantity * importTaxRate
 *  - total cost = import cost + (unit price * quantity)
 *  - the "importTaxRate" is based on they destiantion country
 *  - if the imported item is on the "category exceptions" list, then no tax rate applies
 */
export function calcualteImportCost(importedItems: Array<ImportedItem>): Array<ImportCostOutput> {
  const importCostOutput: Array<ImportCostOutput> = [];
  const taxRates: Array<ImportTaxRate> = _taxRates;

  for (let i = 0; i < importedItems.length; i++) {
    const item = importedItems[i];

    const tax: any = taxRates.find(taxRate => taxRate.country == item.countryDestination);

    let importCost;
    if (tax.categoryExceptions.includes(item.category)) {
      importCost = item.unitPrice * item.quantity;
    } else {
      importCost = item.unitPrice * item.quantity * tax.importTaxRate;
    }

    let totalCost = importCost + (item.unitPrice * item.quantity);

    importCostOutput.push({
      name: item.name,
      subtotal: importCost + totalCost,
      importCost: importCost,
      totalCost: totalCost,
    })
  }

  console.log('importCostOutput:', importCostOutput);
  return importCostOutput;

}

// calcualteImportCost(_importedItems);