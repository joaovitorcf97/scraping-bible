import express from "express";
import puppeteer from "puppeteer";
import fs from 'node:fs';

const app = express();

const mes = 8;
const ano = 2008;

const URL = `https://www.devocionaldiario.com.br/index.php?nMes=${mes}&nAno=${ano}`;


app.get('/', async (request, response) => {

  (async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    console.log('iniciei!');

    await page.goto(URL);

    const paginas = await page.$$eval('#in_main1 > div.marron14 > div p:last-child *', element => {
      return element;
    });

    let devotional = [];

    for (let index = 1; index <= paginas.length; index++) {
      console.log(`Pagina: ${index}`);

      await page.goto(`https://www.devocionaldiario.com.br/index.php?nMes=${mes}&nAno=${ano}&pg=${index}`);

      const verses = await page.$$eval('#verse > strong > em', element => {
        return element.map(text => text.innerHTML);
      });

      const pensamentos = await page.$$eval('#verse + br + p', element => {
        return element.map(text => text.textContent);
      });

      const oracoes = await page.$$eval('#verse + br + p + br + p', element => {
        return element.map(text => text.textContent);
      });

      verses.map((o, index) => {
        devotional.push({
          verse: verses[index],
          meditation: pensamentos[index],
          prayer: oracoes[index],
        });
      });
    }

    function gerarJSON() {
      fs.writeFile(`devotional-mes-${mes}-Ano-${ano}.json`, JSON.stringify(devotional, null, 4), err => {
        if (err) throw new Error('Error');

        console.log('Pronto!!!');
      });
    }

    gerarJSON();

    //await browser.close();
  })();

  return response.json('Pronto');
});

app.listen(3000);