import express from "express";
import puppeteer from "puppeteer";
import fs from 'node:fs';

const app = express();

const URL = `https://www.biblegateway.com/passage/?search=Genesis%201&version=KJV`;


app.get('/', async (request, response) => {

  (async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log('iniciei!');

    await page.goto(URL);

    const chapters = 40;

    let chapter = [];


    for (let i = 1; i <= chapters; i++) {
      console.log(`Pagina: ${i}`);

      await page.goto(`https://www.biblegateway.com/passage/?search=Exodus%20${i}&version=KJV`);

      const verses = await page.$$eval('p > span', element => {
        return element.map(text => text.lastChild.textContent);
      });

      let verse = [];
      verses.map((o, index) => {
        verse.push({
          num_verse: index + 1,
          verse: verses[index],
        });
      });

      chapter.push(verse);
    }

    function gerarJSON() {
      fs.writeFile(`Exodus.json`, JSON.stringify(chapter, null, 4), err => {
        if (err) throw new Error('Error');

        console.log('Pronto!!!');
      });
    }

    gerarJSON();

  })();

  return response.json('Pronto');
});

app.listen(3000);