import { Test, run, test } from 'beater';
import * as assert from 'power-assert';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import { execute as executeType } from '../src';

const setUp = () => {
  const approve = sinon.stub().returns(Promise.resolve());
  const capture = sinon.stub().returns(Promise.resolve());
  const compare = sinon.stub().returns(Promise.resolve());
  const execute: typeof executeType = proxyquire('../src', {
    './approve': { approve },
    './capture': { capture },
    './compare': { compare }
  }).execute;
  return {
    approve,
    capture,
    compare,
    execute
  };
};

const category = 'execute ';
const tests: Test[] = [
  test(category + 'approve', () => {
    const {
      approve,
      capture,
      compare,
      execute
    } = setUp();
    return execute('approve').then(() => {
      assert(approve.callCount === 1);
      assert(capture.callCount === 0);
      assert(compare.callCount === 0);
    });
  }),
  test(category + 'capture', () => {
    const {
      approve,
      capture,
      compare,
      execute
    } = setUp();
    return execute('capture').then(() => {
      assert(approve.callCount === 0);
      assert(capture.callCount === 1);
      assert(compare.callCount === 0);
    });
  }),
  test(category + 'compare', () => {
    const {
      approve,
      capture,
      compare,
      execute
    } = setUp();
    return execute('compare').then(() => {
      assert(approve.callCount === 0);
      assert(capture.callCount === 0);
      assert(compare.callCount === 1);
    });
  }),
  test(category + 'test', () => {
    const {
      approve,
      capture,
      compare,
      execute
    } = setUp();
    return execute('test').then(() => {
      assert(approve.callCount === 0);
      assert(capture.callCount === 1);
      assert(compare.callCount === 1);
    });
  })
];

run(tests).catch(() => process.exit(1));
