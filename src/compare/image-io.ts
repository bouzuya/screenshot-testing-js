import { Image, newImage } from '@bouzuya/compare-images';
import * as fs from 'fs-extra';
import { PNG } from 'pngjs';
import { ensureError, newNoImageError } from './error';

const loadImage = (filePath: string): Promise<Image> => {
  return fs.pathExists(filePath)
    .then((exists) => {
      if (!exists) throw newNoImageError(filePath);
      return fs.readFile(filePath);
    })
    .then((pngData) => parsePNG(pngData))
    .then((png) => newImage(png.data, png.height, png.width))
    .catch((error) => Promise.reject(ensureError(error)));
};

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

const saveImage = (filePath: string, image: Image): Promise<void> => {
  const png = new PNG({ height: image.height, width: image.width });
  png.data = image.data;
  // workaround @types/pngjs bug
  return fs.outputFile(filePath, PNG.sync.write(png as any))
    .catch((error) => Promise.reject(ensureError(error)));
};

export { loadImage, saveImage };
