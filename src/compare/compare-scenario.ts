import {
  Dimension,
  Image,
  Result,
  compareImages as originalCompareImages,
  getDiffDimension,
  getDiffImage,
  isSame,
  isSameDimension,
  newImage
} from '@bouzuya/compare-images';
import * as fs from 'fs-extra';
import { join as pathJoin } from 'path';
import { PNG } from 'pngjs';
import { Options } from '../data/options';
import { Scenario } from '../data/scenario';
import { ensureError, isNoImageError, newNoImageError } from './error';

export type CompareScenarioResult =
  CompareScenarioResultNoApproved |
  CompareScenarioResultNoCaptured |
  CompareScenarioResultNotSameDimension |
  CompareScenarioResultNotSame |
  CompareScenarioResultSame |
  CompareScenarioResultUnknown;

export interface CompareScenarioResultNoApproved {
  type: 'no_approved';
}

export interface CompareScenarioResultNoCaptured {
  type: 'no_captured';
}

export interface CompareScenarioResultNotSameDimension {
  type: 'not_same_dimension';
  diffDimension: Dimension;
}

export interface CompareScenarioResultNotSame {
  type: 'not_same';
  diffImage: Image;
}

export interface CompareScenarioResultSame {
  type: 'same';
}

export interface CompareScenarioResultUnknown {
  type: 'unknown';
}

const compareImages = (
  image1: Image,
  image2: Image
): Promise<Result> => {
  try {
    return Promise.resolve(originalCompareImages(image1, image2));
  } catch (error) {
    return Promise.reject(ensureError(error));
  }
};

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

const saveImage = (filePath: string, image: Image): Promise<void> => {
  const png = new PNG({ height: image.height, width: image.width });
  png.data = image.data;
  // workaround @types/pngjs bug
  return fs.outputFile(filePath, PNG.sync.write(png as any));
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

const compareScenario = async (
  { path: { approved, captured } }: Options,
  { name: screenshotName }: Scenario
): Promise<CompareScenarioResult> => {
  try {
    const image2 = await loadImage(pathJoin(captured, screenshotName + '.png'))
      .catch((error) => {
        const e = ensureError(error);
        return isNoImageError(e)
          ? Promise.reject({ type: 'no_captured' })
          : Promise.reject({ type: 'unknown' });
      });
    const image1 = await loadImage(pathJoin(approved, screenshotName + '.png'))
      .catch((error) => {
        const e = ensureError(error);
        return isNoImageError(e)
          ? Promise.reject({ type: 'no_approved' })
          : Promise.reject({ type: 'unknown' });
      });
    const result = await compareImages(image1, image2)
      .catch((_) => Promise.reject({ type: 'unknown' }));
    if (!isSameDimension(result)) {
      return {
        diffDimension: getDiffDimension(result),
        type: 'not_same_dimension'
      };
    } else if (!isSame(result)) {
      return {
        diffImage: getDiffImage(result),
        type: 'not_same'
      };
    } else {
      return {
        type: 'same'
      };
    }
  } catch (error) {
    return error; // no_approved | no_captured | unknown
  }
};

const compareScenarioAndSaveResult = (
  options: Options,
  scenario: Scenario
): Promise<void> => {
  return compareScenario(options, scenario)
    .then((result) => saveResult(options, scenario, result));
};

const saveResult = (
  { path: { compared } }: Options,
  { name: screenshotName }: Scenario,
  result: CompareScenarioResult
): Promise<void> => {
  if (result.type === 'no_approved') {
    return fs.outputJSON(
      pathJoin(compared, screenshotName + '.json'),
      { result: result.type }
    );
  } else if (result.type === 'no_captured') {
    return fs.outputJSON(
      pathJoin(compared, screenshotName + '.json'),
      { result: result.type }
    );
  } else if (result.type === 'not_same_dimension') {
    return fs.outputJSON(
      pathJoin(compared, screenshotName + '.json'),
      { result: result.type, diffDimension: result.diffDimension }
    );
  } else if (result.type === 'not_same') {
    return fs.outputJSON(
      pathJoin(compared, screenshotName + '.json'),
      { result: result.type }
    ).then(() => {
      saveImage(
        pathJoin(compared, screenshotName + '.png'),
        result.diffImage
      );
    });
  } else if (result.type === 'same') {
    return fs.outputJSON(
      pathJoin(compared, screenshotName + '.json'),
      { result: result.type }
    );
  } else if (result.type === 'unknown') {
    return Promise.reject(result);
  } else {
    throw new Error(`assert unknown compare scenario result: ${result}`);
  }
};

export { compareScenarioAndSaveResult as compareScenario };
