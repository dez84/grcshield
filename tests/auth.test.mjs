import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkPasswordStrength,
  hashPassword,
  isEmail,
  newSessionToken,
  verifyPassword,
} from '../lib/auth.ts';

test('passwords hash to a scrypt string and verify correctly', async () => {
  const hash = await hashPassword('Passw0rd123');
  assert.match(hash, /^scrypt\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
  assert.equal(await verifyPassword('Passw0rd123', hash), true);
  assert.equal(await verifyPassword('Passw0rd124', hash), false);
});

test('the same password hashes differently each time (unique salt)', async () => {
  const a = await hashPassword('Passw0rd123');
  const b = await hashPassword('Passw0rd123');
  assert.notEqual(a, b);
});

test('verify rejects empty, null and malformed stored hashes', async () => {
  assert.equal(await verifyPassword('anything', null), false);
  assert.equal(await verifyPassword('anything', ''), false);
  assert.equal(await verifyPassword('anything', 'not-a-hash'), false);
  assert.equal(await verifyPassword('anything', 'scrypt$onlysalth$'), false);
});

test('password strength requires length plus a letter and a number', () => {
  assert.equal(checkPasswordStrength('short').ok, false);
  assert.equal(checkPasswordStrength('alllowercase').ok, false);
  assert.equal(checkPasswordStrength('123456789').ok, false);
  assert.equal(checkPasswordStrength('Passw0rd123').ok, true);
});

test('session tokens are long, unique and URL-safe', () => {
  const a = newSessionToken();
  const b = newSessionToken();
  assert.notEqual(a, b);
  assert.ok(a.length >= 40);
  assert.match(a, /^[A-Za-z0-9_-]+$/);
});

test('email validation accepts real shapes and rejects obvious mistakes', () => {
  assert.equal(isEmail('learner@example.com'), true);
  assert.equal(isEmail('a.b+c@sub.example.co.uk'), true);
  assert.equal(isEmail('no-at-sign'), false);
  assert.equal(isEmail('missing@domain'), false);
  assert.equal(isEmail('spaces in@example.com'), false);
  assert.equal(isEmail(42), false);
});
