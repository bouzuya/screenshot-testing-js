import * as fs from 'fs-extra';
import { dirname as getDirectoryName, join as pathJoin } from 'path';
import * as puppeteer from 'puppeteer';
import { format } from './_/format';

const ensureKey = (tmpl: string, key: string): string => {
  return tmpl.indexOf('{' + key + '}') >= 0
    ? tmpl
    : tmpl + '/{' + key + '}';
};

const capture = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const name = 'scenario1';
  const language = 'ja';
  const url = 'http://example.com';
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
  const capturedDirectory = '.tmp/captured/';
  const type = 'png';
  const path = pathJoin(capturedDirectory, name2 + '.' + type);
  const dir = getDirectoryName(path);
  await fs.ensureDir(dir);
  await page.screenshot({ path, type });

  await browser.close();
};

export { capture };
