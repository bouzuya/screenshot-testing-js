import { Test, run } from 'beater';
import { tests as approveTests } from './approve';
import { tests as exampleTests } from './example/format'; // TODO
import { tests as executeTests } from './execute';

const tests: Test[] = ([] as Test[])
  .concat(approveTests)
  .concat(exampleTests)
  .concat(executeTests);

run(tests).catch(() => process.exit(1));
