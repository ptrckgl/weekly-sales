const scraperObject = {
  url: 'https://www.woolworths.com.au/shop/search/products?searchTerm=juice',
  async scraper(browser) {
    let page = await browser.newPage();
    page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36'
    );
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);

    textContent = await page.evaluate(() => {
      return [
        ...document
          .querySelector(
            '#search-content > div > wow-product-search-container > shared-grid > div'
          )
          .querySelectorAll('.shelfProductTile-information'),
      ].map((a) => {
        return {
          name: a.querySelector('.shelfProductTile-descriptionLink').innerHTML,
          price:
            a.querySelector('.price-dollars').innerHTML +
            '.' +
            a.querySelector('.price-cents').innerHTML,
        };
      });
    });

    console.log(textContent);
  },
};

module.exports = scraperObject;
