import {
  Image,
  Result,
  compareImages,
  newImage
} from '@bouzuya/compare-images';
import * as fs from 'fs-extra';
import { join as pathJoin } from 'path';
import { PNG } from 'pngjs';
import { Options } from './data/options';
import { Scenario } from './data/scenario';

const parsePNG = (pngData: Buffer): Promise<PNG> => {
  return new Promise<PNG>((resolve, reject) => {
    new PNG().parse(pngData, (error, png) => {
      if (error) {
        reject(error);
      } else {
        resolve(png);
      }
    });
  });
};

// TODO: no image
const loadImage = (filePath: string): Promise<Image> => {
  return fs
    .readFile(filePath)
    .then((pngData) => parsePNG(pngData))
    .then((png) => newImage(png.data, png.height, png.width));
};

const compareScenario = (
  { path: { approved, captured } }: Options,
  { name: screenshotName }: Scenario
): Promise<Result> => {
  return Promise.all([
    loadImage(pathJoin(approved, screenshotName)),
    loadImage(pathJoin(captured, screenshotName))
  ])
    .then(([image1, image2]) => compareImages(image1, image2));
};

const compare = (options: Options): Promise<void> => {
  const { scenarios } = options;
  return scenarios.reduce((promise, scenario) => {
    return promise
      .then(() => compareScenario(options, scenario))
      .then((result) => {
        // tslint:disable
        console.log(result); // TODO
      });
  }, Promise.resolve());
};

export { compare };
