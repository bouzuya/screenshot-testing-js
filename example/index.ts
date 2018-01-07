import { execute } from '../src'; // @bouzuya/screenshot-testing
import { newExampleOptions } from './example-options';

const main = (command: string): void => {
  const options = newExampleOptions();
  if (
    command === 'approve' ||
    command === 'capture' ||
    command === 'compare' ||
    command === 'test'
  ) {
    execute(command, options);
  } else {
    const helpMessage = [
      'node index.js <command>',
      '',
      'Commands:',
      '  approve',
      '  capture',
      '  compare',
      '  test'
    ].join('\n');
    // tslint:disable
    console.log(helpMessage);
  }
};

main(process.argv[2]);
