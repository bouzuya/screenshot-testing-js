import { approve } from './approve';
import { capture } from './capture';
import { compare } from './compare';

const execute = async (command: 'approve' | 'capture' | 'compare' | 'test') => {
  if (command === 'approve') {
    await approve();
  } else if (command === 'capture') {
    await capture();
  } else if (command === 'compare') {
    await compare();
  } else if (command === 'test') {
    await capture();
    await compare();
  } else {
    throw new Error('unknown command');
  }
};

export {
  approve,
  capture,
  compare,
  execute
};
