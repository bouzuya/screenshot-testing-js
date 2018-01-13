import { CompareScenarioResult } from './compare-scenario-result';
import { Options } from './options';

export type Report = (
  options: Options,
  results: CompareScenarioResult[]
) => void;
