import { approve } from './approve';
import { capture } from './capture';
import { compare } from './compare';
import { Options } from './data/options';

const execute = async (
  command: 'approve' | 'capture' | 'compare' | 'test',
  options: Options
) => {
  if (command === 'approve') {
    await approve(options);
  } else if (command === 'capture') {
    await capture(options);
  } else if (command === 'compare') {
    await compare(options);
  } else if (command === 'test') {
    await capture(options);
    await compare(options);
  } else {
    throw new Error('unknown command');
  }
};

export {
  execute
};
