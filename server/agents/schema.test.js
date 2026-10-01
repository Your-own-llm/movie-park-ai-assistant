import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBrief, qualification, buildHandoff } from './schema.js';

test('normalizes a production brief', () => {
  const result = normalizeBrief({ projectType: 'Commercial Film', client: 'Acme' });
  assert.equal(result.project, 'Commercial Film');
  assert.equal(result.client, 'Acme');
});

test('qualifies a complete brief', () => {
  const result = qualification({
    client: 'Acme',
    project: 'Commercial Film',
    location: 'Dubai',
    deliverables: 'Hero film + social cuts',
    deadline: '6 weeks',
    budget: '$50K–$75K',
    references: 'Luxury automotive references',
    requirements: 'Live action + CGI'
  });
  assert.equal(result.score, 100);
  assert.equal(result.status, 'QUALIFIED');
  assert.deepEqual(result.missingFields, []);
});

test('flags incomplete brief for review', () => {
  const result = qualification({
    client: 'Acme',
    project: 'Commercial Film',
    location: 'Dubai',
    deliverables: 'Hero film'
  });
  assert.equal(result.status, 'REVIEW REQUIRED');
  assert.ok(result.missingFields.includes('deadline'));
});

test('builds a handoff payload', () => {
  const result = buildHandoff(
    { client: 'Acme', project: 'Commercial Film' },
    qualification({ client: 'Acme', project: 'Commercial Film' })
  );
  assert.equal(result.type, 'production_inquiry');
  assert.equal(result.nextStep, 'collect_missing_information');
});
