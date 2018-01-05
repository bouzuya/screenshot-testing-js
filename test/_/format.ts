import { Test, test } from 'beater';
import * as assert from 'power-assert';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import { format } from '../../src/_/format';

const category = '/_/format ';
const tests: Test[] = [
  test(category + 'name', () => {
    assert(format('', 'foo', 'value') === '');
    assert(format('{name}', 'foo', 'value') === '{name}');
    assert(format('name', 'foo', 'value') === 'name');
    assert(format('name/{foo}', 'foo', 'value') === 'name/value');
    assert(format('{foo}/name', 'foo', 'value') === 'value/name');
  }),
  test(category + 'key', () => {
    assert(format('name', '', 'value') === 'name');
    assert.throws(() => format('name', '{foo', 'value'));
    assert.throws(() => format('name', 'foo}', 'value'));
  }),
  test(category + 'value', () => {
    assert(format('name', 'foo', '') === 'name');
    assert.throws(() => format('name', 'foo', '{value'));
    assert.throws(() => format('name', 'foo', 'value}'));
  })
];

export { tests };
