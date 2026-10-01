import test from 'node:test';
import assert from 'node:assert/strict';
import { isResearchSourceAllowed } from './firecrawl.js';

test('allows approved Movie Park HTTPS host', () => {
  assert.equal(isResearchSourceAllowed('https://movieparkpro.com/'), true);
});

test('rejects non-HTTPS sources', () => {
  assert.equal(isResearchSourceAllowed('http://movieparkpro.com/'), false);
});

test('rejects unapproved domains', () => {
  assert.equal(isResearchSourceAllowed('https://example.com/'), false);
});
