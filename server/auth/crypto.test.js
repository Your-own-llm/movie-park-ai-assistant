import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, signSession, verifySession } from './crypto.js';

test('password hashing verifies correctly',()=>{
  const hash=hashPassword('demo-password');
  assert.equal(verifyPassword('demo-password',hash),true);
  assert.equal(verifyPassword('wrong-password',hash),false);
});

test('signed sessions verify and expire',()=>{
  const secret='test-secret';
  const token=signSession({sub:'admin',exp:Date.now()+10000},secret);
  assert.equal(verifySession(token,secret).sub,'admin');
  assert.equal(verifySession(token,'wrong-secret'),null);
  const expired=signSession({sub:'admin',exp:Date.now()-1},secret);
  assert.equal(verifySession(expired,secret),null);
});
