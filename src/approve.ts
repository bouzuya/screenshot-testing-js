import * as fs from 'fs-extra';
import { Options } from './data/options';

const approve = async ({ path: { captured } }: Options) => {
  const approved = 'approved';
  await fs.copy(captured, approved, {
    overwrite: true,
    recursive: true
  });
};

export { approve };
