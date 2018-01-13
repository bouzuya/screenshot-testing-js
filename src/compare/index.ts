import { CompareScenarioResult } from '../data/compare-scenario-result';
import { Options } from '../data/options';
import { Scenario } from '../data/scenario';
import { report as htmlReport } from '../report/html';
import { compareScenario } from './compare-scenario';

const compare = (options: Options): Promise<void> => {
  const { scenarios } = options;
  return scenarios
    .reduce((promise, scenario) => {
      return promise
        .then((a) => {
          return compareScenario(options, scenario)
            .then((result) => a.concat([{ result, scenario }]));
        });
    }, Promise.resolve([] as Array<{
      result: CompareScenarioResult;
      scenario: Scenario;
    }>))
    .then((results) => htmlReport({ open: 'always' })(options, results));
};

export { compare };
