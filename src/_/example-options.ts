import * as puppeteer from 'puppeteer';
import { Options } from '../data/options';
import { Scenario } from '../data/scenario';
import { format } from './format';

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

const scenario1 = (): Scenario => {
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

const scenario2 = (): Scenario => {
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

const newExampleOptions = (): Options => {
  return {
    path: {
      approved: 'approved/',
      captured: '.tmp/captured/'
    },
    scenarios: [
      scenario1(),
      scenario2()
    ]
  };
};

export { newExampleOptions };
