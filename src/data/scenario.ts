import * as puppeteer from 'puppeteer';

export interface Scenario {
  action: (page: puppeteer.Page) => Promise<{ clip?: puppeteer.BoundingBox; }>;
  name: string;
}
