import * as fs from 'fs-extra';
import { Options } from './data/options';

const approve = async (
  { path: { approved, captured } }: Options
): Promise<void> => {
  await fs.copy(captured, approved, {
    overwrite: true,
    recursive: true
  });
};

export { approve };
