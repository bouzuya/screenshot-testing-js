import { newExampleOptions } from './_/example-options';
import { approve } from './approve';
import { capture } from './capture';
import { compare } from './compare';

const execute = async (command: 'approve' | 'capture' | 'compare' | 'test') => {
  const options = newExampleOptions(); // FIXME
  if (command === 'approve') {
    await approve();
  } else if (command === 'capture') {
    await capture(options);
  } else if (command === 'compare') {
    await compare();
  } else if (command === 'test') {
    await capture(options);
    await compare();
  } else {
    throw new Error('unknown command');
  }
};

export {
  execute
};
