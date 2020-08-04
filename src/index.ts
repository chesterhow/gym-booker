import puppeteer from 'puppeteer';
import { config } from 'dotenv';

config();
const { USERNAME, PASSWORD, URL } = process.env;

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(URL as string);

  // Login
  await page.$eval(
    'input[name=Username]',
    (el, username) =>
      username ? ((el as HTMLInputElement).value = username) : null,
    USERNAME
  );
  await page.$eval(
    'input[name=Password]',
    (el, password) =>
      password ? ((el as HTMLInputElement).value = password) : null,
    PASSWORD
  );
  await page.$eval('input#LoginButton', (form) =>
    (form as HTMLInputElement).click()
  );
  await page.waitForNavigation();

  // Pick date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await page.$eval(
    `td[title="${tomorrow.toLocaleString('en-us', {
      weekday: 'long',
    })}, ${tomorrow.toLocaleString('default', {
      month: 'long',
    })} ${('0' + tomorrow.getDate()).slice(-2)}, ${tomorrow.getFullYear()}"]`,
    (form) => (form as HTMLInputElement).click()
  );
  await page.waitFor(5000);

  // Pick time
  await page.$eval(
    '#ctl00_ContentPlaceHolder1_StartTimePicker_timeView_wrapper',
    (form) => ((form as HTMLDivElement).style.display = 'block')
  );
  await page.$$eval(
    '#ctl00_ContentPlaceHolder1_StartTimePicker_timeView_tdl a',
    (anchors) =>
      (anchors.find(
        (anchor) => anchor.textContent === '07:00'
      ) as HTMLAnchorElement).click()
  );
  await page.waitFor(5000);

  // Submit
  await page.$eval('#ctl00_ContentPlaceHolder1_FooterSaveButton', (form) =>
    (form as HTMLAnchorElement).click()
  );
  await page.waitFor(5000);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
  });
