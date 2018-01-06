import * as fs from 'fs-extra';
import { dirname as getDirectoryName, join as pathJoin } from 'path';
import * as puppeteer from 'puppeteer';
import { format } from './_/format';

const ensureKey = (tmpl: string, key: string): string => {
  return tmpl.indexOf('{' + key + '}') >= 0
    ? tmpl
    : tmpl + '/{' + key + '}';
};

const languageHelper = async (
  page: puppeteer.Page,
  name: string,
  language: string
): Promise<string> => {
  await page.evaluateOnNewDocument([
    'Object.defineProperty(navigator, "language", {',
    '  get() { return "' + language + '"; }',
    '})'
  ].join(''));
  return format(ensureKey(name, 'language'), 'language', language);
};

const screenshotHelper = async (
  page: puppeteer.Page,
  name: string,
  capturedDirectory: string,
  clip?: puppeteer.BoundingBox
): Promise<void> => {
  const type = 'png';
  const path = pathJoin(capturedDirectory, name + '.' + type);
  const dir = getDirectoryName(path);
  await fs.ensureDir(dir);
  await page.screenshot({ clip, path, type });
};

const viewportHelper = async (
  page: puppeteer.Page,
  name: string,
  viewport: string
): Promise<string> => {
  // viewport
  const [width, height] = viewport
    .split('x')
    .map((s) => parseInt(s, 10));
  const viewportObject = { height, width };
  page.setViewport(viewportObject);
  return format(ensureKey(name, 'viewport'), 'viewport', viewport);
};

const scenario1 = async (page: puppeteer.Page): Promise<void> => {
  const capturedDirectory = '.tmp/captured/';
  const name = 'scenario1';
  const language = 'ja';
  const url = 'https://blog.bouzuya.net/2017/01/01/';
  const viewport = '320x480';

  const name1 = await languageHelper(page, name, language);
  const name2 = await viewportHelper(page, name1, viewport);

  await page.goto(url);

  await screenshotHelper(page, name2, capturedDirectory);
};

const scenario2 = async (page: puppeteer.Page) => {
  const capturedDirectory = '.tmp/captured/';
  const name = 'scenario2';
  const language = 'ja';
  const url = 'https://blog.bouzuya.net/2017/01/02/';
  const viewport = '320x480';

  const name1 = await languageHelper(page, name, language);
  const name2 = await viewportHelper(page, name1, viewport);

  await page.goto(url);

  await screenshotHelper(page, name2, capturedDirectory);
};

const capture = async () => {
  const browser = await puppeteer.launch();
  const scenarios = [
    scenario1,
    scenario2
  ];
  await scenarios.reduce((promise, scenario) => {
    return promise
      .then(() => browser.newPage())
      .then((page) => scenario(page));
  }, Promise.resolve());
  await browser.close();
};

export { capture };
