import { Test, test } from 'beater';
import * as assert from 'power-assert';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import { approve as approveType } from '../src/approve';
import { Options } from '../src/data/options';

const buildOptions = (): Options => {
  return {
    path: {
      approved: '.tmp/approved/',
      captured: '.tmp/captured/'
    }
  } as any;
};

const setUp = () => {
  const copy = sinon.stub().returns(Promise.resolve());
  const approve: typeof approveType = proxyquire(
    '../src/approve',
    {
      'fs-extra': { copy }
    }
  ).approve;
  return {
    approve,
    copy
  };
};

const category = '/approve ';
const tests: Test[] = [
  test(category, () => {
    const { approve, copy } = setUp();
    const options = buildOptions();
    return approve(options)
      .then(() => {
        assert(copy.callCount === 1);
        assert(copy.getCall(0).args.length === 3);
        assert(copy.getCall(0).args[0] === options.path.captured);
        assert(copy.getCall(0).args[1] === options.path.approved);
        assert.deepEqual(copy.getCall(0).args[2], {
          overwrite: true,
          recursive: true
        });
      });
  })
];

export { tests };
