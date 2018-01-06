import * as fs from 'fs-extra';
import { dirname as getDirectoryName, join as pathJoin } from 'path';
import * as puppeteer from 'puppeteer';
import { Options } from './data/options';

const capture = async ({ path: { captured }, scenarios }: Options) => {
  const browser = await puppeteer.launch();
  await scenarios.reduce((promise, { action, name }) => {
    return promise.then(async () => {
      const page = await browser.newPage();
      const screenshotOptions = await action(page);
      const { clip } = screenshotOptions;
      const type = 'png';
      const path = pathJoin(captured, name + '.' + type);
      const dir = getDirectoryName(path);
      await fs.ensureDir(dir);
      await page.screenshot({ clip, path, type });
    });
  }, Promise.resolve());
  await browser.close();
};

export { capture };
