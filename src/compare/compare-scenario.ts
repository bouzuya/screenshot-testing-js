import {
  Dimension,
  Image,
  Result,
  compareImages as originalCompareImages,
  getAllPixelCount,
  getDiffDimension,
  getDiffImage,
  getDiffPixelCount,
  isSame,
  isSameDimension
} from '@bouzuya/compare-images';
import * as fs from 'fs-extra';
import { join as pathJoin } from 'path';
import { Options } from '../data/options';
import { Scenario } from '../data/scenario';
import { ensureError, isNoImageError } from './error';
import { loadImage, saveImage } from './image-io';

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
  allPixelCount: number;
  diffImage: Image;
  diffPercentage: number;
  diffPixelCount: number;
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
      const allPixelCount = getAllPixelCount(result);
      const diffPixelCount = getDiffPixelCount(result);
      return {
        allPixelCount,
        diffImage: getDiffImage(result),
        diffPercentage: allPixelCount === 0
          ? 0
          : diffPixelCount / allPixelCount * 100,
        diffPixelCount,
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
): Promise<CompareScenarioResult> => {
  return compareScenario(options, scenario)
    .then((result) => {
      return saveResult(options, scenario, result)
        .then(() => result);
    });
};

const saveResult = (
  { path: { compared } }: Options,
  { name: screenshotName }: Scenario,
  result: CompareScenarioResult
): Promise<void> => {
  const screenshotsDirectory = pathJoin(compared, 'screenshots');
  const resultJSON = pathJoin(screenshotsDirectory, screenshotName + '.json');
  if (result.type === 'no_approved') {
    return fs.outputJSON(resultJSON, { result: result.type });
  } else if (result.type === 'no_captured') {
    return fs.outputJSON(resultJSON, { result: result.type });
  } else if (result.type === 'not_same_dimension') {
    return fs.outputJSON(resultJSON, {
      diffDimension: result.diffDimension,
      result: result.type
    });
  } else if (result.type === 'not_same') {
    return fs.outputJSON(resultJSON, {
      allPixelCount: result.allPixelCount,
      diffPercentage: result.diffPercentage,
      diffPixelCount: result.diffPixelCount,
      result: result.type
    })
      .then(() => {
        const resultPNG = pathJoin(screenshotsDirectory, screenshotName + '.png');
        return saveImage(resultPNG, result.diffImage);
      });
  } else if (result.type === 'same') {
    return fs.outputJSON(resultJSON, { result: result.type });
  } else if (result.type === 'unknown') {
    return Promise.reject(result);
  } else {
    throw new Error(`assert unknown compare scenario result: ${result}`);
  }
};

export { compareScenarioAndSaveResult as compareScenario };
