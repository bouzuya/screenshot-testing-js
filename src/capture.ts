import * as fs from 'fs-extra';
import { dirname as getDirectoryName, join as pathJoin } from 'path';
import * as puppeteer from 'puppeteer';
import { Options } from './data/options';

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

const capture = async ({ path: { captured }, scenarios }: Options) => {
  const browser = await puppeteer.launch();
  await scenarios.reduce((promise, { action, name }) => {
    return promise
      .then(() => browser.newPage())
      .then((page) => action(page).then((o) => Object.assign({ page }, o)))
      .then(({ page, clip }) => {
        return screenshotHelper(page, name, captured, clip);
      });
  }, Promise.resolve());
  await browser.close();
};

export { capture };
