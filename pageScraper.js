const scraperObject = {
  url: 'https://www.woolworths.com.au/shop/search/products?searchTerm=juice',
  async scraper(browser) {
    let page = await browser.newPage();
    page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36'
    );
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);

    async function scrapeCurrentPage() {
      console.log(page.url());
      await waitTillHTMLRendered(page);
      textContent = await page.evaluate(() => {
        return [
          ...document
            .querySelector(
              '#search-content > div > wow-product-search-container > shared-grid > div'
            )
            .querySelectorAll('.shelfProductTile-information'),
        ].map((a) => {
          let obj;
          try {
            obj = {
              name: a.querySelector('.shelfProductTile-descriptionLink')
                .innerHTML,
              price:
                a.querySelector('.price-dollars').innerHTML +
                '.' +
                a.querySelector('.price-cents').innerHTML,
            };
          } catch (err) {
            obj = { name: 'ERROR', price: 'ERROR' };
          }
          return obj;
        });
      });

      console.log(textContent);

      let nextButtonExists = false;

      // Checking if the next button exists (ie, if we are on the last page)
      try {
        const nextButton = await page.evaluate(() => {
          return document.querySelector('.paging-next').textContent;
        });
        console.log(nextButton);
        nextButtonExists = true;
      } catch (err) {
        nextButtonExists = false;
      }

      if (nextButtonExists) {
        console.log('\n\nNEXT BUTTON FOUND AND CLICKED\n\n');
        await page.click('.paging-next');
        return scrapeCurrentPage();
      }
    }

    await scrapeCurrentPage();
  },
};

// From https://stackoverflow.com/questions/52497252/puppeteer-wait-until-page-is-completely-loaded
const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while (checkCounts++ <= maxChecks) {
    let html = await page.content();
    let currentHTMLSize = html.length;

    let bodyHTMLSize = await page.evaluate(
      () => document.body.innerHTML.length
    );

    console.log(
      'last: ',
      lastHTMLSize,
      ' <> curr: ',
      currentHTMLSize,
      ' body html size: ',
      bodyHTMLSize
    );

    if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else countStableSizeIterations = 0; //reset the counter

    if (countStableSizeIterations >= minStableSizeIterations) {
      console.log('Page rendered fully..');
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }
};

module.exports = scraperObject;
