import { copy } from 'fs-extra';
import { Options } from './data/options';

const approve = ({ path: { approved, captured } }: Options): Promise<void> => {
  return copy(captured, approved, { overwrite: true, recursive: true });
};

export { approve };
