import { Dimension, Image } from '@bouzuya/compare-images';

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
