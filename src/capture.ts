import * as fs from 'fs-extra';
import { dirname as getDirectoryName, join as pathJoin } from 'path';
import * as puppeteer from 'puppeteer';
import { format } from './_/format';

const ensureKey = (tmpl: string, key: string): string => {
  return tmpl.indexOf('{' + key + '}') >= 0
    ? tmpl
    : tmpl + '/{' + key + '}';
};

const languageHelper = (language: string): {
  name: (name: string) => string;
  page: (page: puppeteer.Page) => Promise<void>;
} => {
  return {
    name: (name) => {
      return format(ensureKey(name, 'language'), 'language', language);
    },
    page: (page) => {
      return page.evaluateOnNewDocument([
        'Object.defineProperty(navigator, "language", {',
        '  get() { return "' + language + '"; }',
        '})'
      ].join(''));
    }
  };
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

const viewportHelper = (viewport: string): {
  name: (name: string) => string;
  page: (page: puppeteer.Page) => Promise<void>;
} => {
  return {
    name: (name) => {
      return format(ensureKey(name, 'viewport'), 'viewport', viewport);
    },
    page: (page) => {
      const [width, height] = viewport
        .split('x')
        .map((s) => parseInt(s, 10));
      const viewportObject = { height, width };
      return page.setViewport(viewportObject);
    }
  };
};

const scenario1 = (): {
  action: (page: puppeteer.Page) => Promise<{ clip?: puppeteer.BoundingBox; }>;
  name: string;
} => {
  const baseName = 'scenario1';
  const language = 'ja';
  const url = 'https://blog.bouzuya.net/2017/01/01/';
  const viewport = '320x480';
  const {
    name: languageNameHelper,
    page: languagePageHelper
  } = languageHelper(language);
  const {
    name: viewportNameHelper,
    page: viewportPageHelper
  } = viewportHelper(viewport);
  const name = viewportNameHelper(languageNameHelper(baseName));
  return {
    action: async (page) => {
      await languagePageHelper(page);
      await viewportPageHelper(page);
      await page.goto(url);
      return {};
    },
    name
  };
};

const scenario2 = (): {
  action: (page: puppeteer.Page) => Promise<{ clip?: puppeteer.BoundingBox; }>;
  name: string;
} => {
  const baseName = 'scenario2';
  const language = 'ja';
  const url = 'https://blog.bouzuya.net/2017/01/02/';
  const viewport = '320x480';
  const {
    name: languageNameHelper,
    page: languagePageHelper
  } = languageHelper(language);
  const {
    name: viewportNameHelper,
    page: viewportPageHelper
  } = viewportHelper(viewport);
  const name = languageNameHelper(viewportNameHelper(baseName));
  return {
    action: async (page) => {
      await languagePageHelper(page);
      await viewportPageHelper(page);
      await page.goto(url);
      return {};
    },
    name
  };
};

const capture = async () => {
  const browser = await puppeteer.launch();
  const scenarios = [
    scenario1(),
    scenario2()
  ];
  await scenarios.reduce((promise, { action, name }) => {
    return promise
      .then(() => browser.newPage())
      .then((page) => action(page).then((o) => Object.assign({ page }, o)))
      .then(({ page, clip }) => {
        const capturedDirectory = '.tmp/captured/';
        return screenshotHelper(page, name, capturedDirectory, clip);
      });
  }, Promise.resolve());
  await browser.close();
};

export { capture };
