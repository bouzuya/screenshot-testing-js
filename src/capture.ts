import * as fs from 'fs-extra';
import { dirname as getDirectoryName, join as pathJoin } from 'path';
import * as puppeteer from 'puppeteer';
import { format } from './_/format';

const ensureKey = (tmpl: string, key: string): string => {
  return tmpl.indexOf('{' + key + '}') >= 0
    ? tmpl
    : tmpl + '/{' + key + '}';
};

const scenario1 = async (page: puppeteer.Page) => {
  const capturedDirectory = '.tmp/captured/';
  const name = 'scenario1';
  const language = 'ja';
  const url = 'https://blog.bouzuya.net/2017/01/01/';
  const viewport = '320x480';

  // language
  await page.evaluateOnNewDocument([
    'Object.defineProperty(navigator, "language", {',
    '  get() { return "' + language + '"; }',
    '})'
  ].join(''));
  const name1 = format(ensureKey(name, 'language'), 'language', language);

  // viewport
  const [width, height] = viewport
    .split('x')
    .map((s) => parseInt(s, 10));
  const viewportObject = { height, width };
  page.setViewport(viewportObject);
  const name2 = format(ensureKey(name1, 'viewport'), 'viewport', viewport);

  await page.goto(url);

  // screenshot
  const type = 'png';
  const path = pathJoin(capturedDirectory, name2 + '.' + type);
  const dir = getDirectoryName(path);
  await fs.ensureDir(dir);
  await page.screenshot({ path, type });
};

const scenario2 = async (page: puppeteer.Page) => {
  const capturedDirectory = '.tmp/captured/';
  const name = 'scenario2';
  const language = 'ja';
  const url = 'https://blog.bouzuya.net/2017/01/02/';
  const viewport = '320x480';

  // language
  await page.evaluateOnNewDocument([
    'Object.defineProperty(navigator, "language", {',
    '  get() { return "' + language + '"; }',
    '})'
  ].join(''));
  const name1 = format(ensureKey(name, 'language'), 'language', language);

  // viewport
  const [width, height] = viewport
    .split('x')
    .map((s) => parseInt(s, 10));
  const viewportObject = { height, width };
  page.setViewport(viewportObject);
  const name2 = format(ensureKey(name1, 'viewport'), 'viewport', viewport);

  await page.goto(url);

  // screenshot
  const type = 'png';
  const path = pathJoin(capturedDirectory, name2 + '.' + type);
  const dir = getDirectoryName(path);
  await fs.ensureDir(dir);
  await page.screenshot({ path, type });
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
