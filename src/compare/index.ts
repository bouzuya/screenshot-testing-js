import { CompareScenarioResult } from '../data/compare-scenario-result';
import { Options } from '../data/options';
import { compareScenario } from './compare-scenario';

const compare = (options: Options): Promise<void> => {
  const { report, scenarios } = options;
  return scenarios
    .reduce((promise, scenario) => {
      return promise
        .then((a) => {
          return compareScenario(options, scenario)
            .then((result) => a.concat([result]));
        });
    }, Promise.resolve([] as CompareScenarioResult[]))
    .then((results) => report(options, results));
};

export { compare };
