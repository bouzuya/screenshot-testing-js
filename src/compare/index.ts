import { Options } from '../data/options';
import { compareScenario } from './compare-scenario';

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
