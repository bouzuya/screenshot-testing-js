import * as puppeteer from 'puppeteer';

export interface ScreenshotOptions {
  clip: puppeteer.BoundingBox;
}

export interface Scenario {
  action: (page: puppeteer.Page) => Promise<Partial<ScreenshotOptions>>;
  name: string;
}
