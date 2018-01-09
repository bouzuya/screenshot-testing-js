import { Test, test } from 'beater';
import * as assert from 'power-assert';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import { execute as executeType } from '../src/execute';

const setUp = () => {
  const approve = sinon.stub().returns(Promise.resolve());
  const capture = sinon.stub().returns(Promise.resolve());
  const compare = sinon.stub().returns(Promise.resolve());
  const execute: typeof executeType = proxyquire(
    '../src/execute',
    {
      './approve': { approve },
      './capture': { capture },
      './compare': { compare }
    }
  ).execute;
  const options = { foo: 123 } as any; // TODO
  return {
    approve,
    capture,
    compare,
    execute,
    options
  };
};

const category = 'execute ';
const tests: Test[] = [
  test(category + 'approve', () => {
    const {
      approve,
      capture,
      compare,
      execute,
      options
    } = setUp();
    return execute('approve', options).then(() => {
      assert(approve.callCount === 1);
      assert(approve.getCall(0).args.length === 1);
      assert.deepEqual(approve.getCall(0).args[0], options);
      assert(capture.callCount === 0);
      assert(compare.callCount === 0);
    });
  }),
  test(category + 'capture', () => {
    const {
      approve,
      capture,
      compare,
      execute,
      options
    } = setUp();
    return execute('capture', options).then(() => {
      assert(approve.callCount === 0);
      assert(capture.callCount === 1);
      assert(capture.getCall(0).args.length === 1);
      assert.deepEqual(capture.getCall(0).args[0], options);
      assert(compare.callCount === 0);
    });
  }),
  test(category + 'compare', () => {
    const {
      approve,
      capture,
      compare,
      execute,
      options
    } = setUp();
    return execute('compare', options).then(() => {
      assert(approve.callCount === 0);
      assert(capture.callCount === 0);
      assert(compare.callCount === 1);
      assert(compare.getCall(0).args.length === 1);
      assert.deepEqual(compare.getCall(0).args[0], options);
    });
  }),
  test(category + 'test', () => {
    const {
      approve,
      capture,
      compare,
      execute,
      options
    } = setUp();
    return execute('test', options).then(() => {
      assert(approve.callCount === 0);
      assert(capture.callCount === 1);
      assert(capture.getCall(0).args.length === 1);
      assert.deepEqual(capture.getCall(0).args[0], options);
      assert(compare.callCount === 1);
      assert(compare.getCall(0).args.length === 1);
      assert.deepEqual(compare.getCall(0).args[0], options);
    });
  })
];

export { tests };
