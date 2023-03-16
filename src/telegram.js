import express from "express";
import puppeteer from "puppeteer";
import fs from 'node:fs';

const app = express();

const URL = `https://combot.org/telegram/top/groups?lng=all&page=1`;


app.get('/', async (request, response) => {

  (async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log('iniciei!');

    await page.goto(URL);

    const pages = 81349;
    let groups = [];

    for (let i = 1; i <= pages; i++) {
      console.log(`Pagina: ${i}`);

      await page.goto(
        `https://combot.org/telegram/top/groups?lng=all&page=${i}`,
        { waitUntil: 'networkidle0' }
      );

      const title = await page.$$eval('.card-title', element => {
        return element.map(e => e.textContent);
      });

      const image = await page.$$eval('.avatar img[src]', element => {
        return element.map(img => img.getAttribute('src'));
      });

      const link = await page.$$eval('.link a[href]', element => {
        return element.map(link => link.getAttribute('href'));
      });

      title.map((o, index) => {
        groups.push({
          title: title[index],
          image: image[index],
          link: link[index]
        });
      });

    }

    function gerarJSON() {
      fs.writeFile(`telegram.json`, JSON.stringify(groups, null, 4), err => {
        if (err) throw new Error('Error');

        console.log('Pronto!!!');
      });
    }

    gerarJSON();

  })();

  return response.json('Pronto');
});

app.listen(3000);