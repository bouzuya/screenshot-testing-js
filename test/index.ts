import { Test, run } from 'beater';
import { tests as executeTests } from './execute';

const tests: Test[] = ([] as Test[])
  .concat(executeTests);

run(tests).catch(() => process.exit(1));
