import test from 'ava';
import sinon from 'sinon';
import { log } from '../src/js/log';

test('Logs non-tables', t => {
  const mock = sinon.mock(console);
  mock
    .expects('log')
    .once()
    .withArgs('Hello');
  log('Hello');
  t.true(mock.verify());
});

test('Logs tables', t => {
  const mock = sinon.mock(console);
  mock
    .expects('table')
    .once(1)
    .withArgs(['Hello', 'World']);
  log(['Hello', 'World']);
  t.true(mock.verify());
});

test('Logs objects', t => {
  const mock = sinon.mock(console);
  mock
    .expects('table')
    .once(1)
    .withArgs({ hello: 'world' });
  log({ hello: 'world' });
  t.true(mock.verify());
});
