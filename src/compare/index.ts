import { Options } from '../data/options';
import { Scenario } from '../data/scenario';
import { CompareScenarioResult, compareScenario } from './compare-scenario';
import { generateHtmlReport } from './generate-html-report';

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
    .then((results) => generateHtmlReport(options, results));
};

export { compare };
