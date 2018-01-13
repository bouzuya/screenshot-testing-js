import { CompareScenarioResult } from '../data/compare-scenario-result';
import { Options } from '../data/options';
import { report as htmlReport } from '../report/html';
import { compareScenario } from './compare-scenario';

const compare = (options: Options): Promise<void> => {
  const { scenarios } = options;
  return scenarios
    .reduce((promise, scenario) => {
      return promise
        .then((a) => {
          return compareScenario(options, scenario)
            .then((result) => a.concat([result]));
        });
    }, Promise.resolve([] as CompareScenarioResult[]))
    .then((results) => htmlReport({ open: 'always' })(options, results));
};

export { compare };
