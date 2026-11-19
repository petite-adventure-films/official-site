import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runHostedStagingJob } from './hosted-staging-job.mjs';

function fixture(failure) {
  const calls = [];
  const claim = { operationId: 'operation', attempt: 1, token: 'claim' };
  const io = Object.fromEntries(['claim', 'checkProtection', 'prepare', 'upload', 'authorizeActivation', 'activate', 'verify', 'succeed', 'fail'].map(name => [name, async () => {
    calls.push(name);
    if (name === failure) throw new Error('network_or_provider_failure');
    return name === 'claim' ? claim : {};
  }]));
  return { io, calls };
}
test('no queued candidate means no build or deployment', async () => {
  const { io, calls } = fixture();
  io.claim = async () => null;
  assert.deepEqual(await runHostedStagingJob(io), { status: 'idle' });
  assert.deepEqual(calls, []);
});
test('protection and durable activation authorization precede deployment and verification precedes success', async () => {
  const { io, calls } = fixture();
  assert.deepEqual(await runHostedStagingJob(io), { status: 'succeeded' });
  assert.deepEqual(calls, ['claim', 'checkProtection', 'prepare', 'upload', 'checkProtection', 'authorizeActivation', 'activate', 'verify', 'succeed']);
});
for (const stage of ['checkProtection', 'prepare', 'upload']) {
  test(`${stage} failure never activates and reports terminal failure`, async () => {
    const { io, calls } = fixture(stage);
    assert.deepEqual(await runHostedStagingJob(io), { status: 'failed' });
    assert.equal(calls.includes('activate'), false);
    assert.equal(calls.at(-1), 'fail');
  });
}
for (const stage of ['authorizeActivation', 'activate', 'verify', 'succeed']) {
  test(`${stage} response loss remains unknown without retrying or reporting failure`, async () => {
    const { io, calls } = fixture(stage);
    assert.deepEqual(await runHostedStagingJob(io), { status: 'unknown' });
    assert.equal(calls.includes('fail'), false);
    assert.equal(calls.filter(value => value === 'claim').length, 1);
    assert.ok(calls.filter(value => value === 'activate').length <= 1);
  });
}
test('lost failure report preserves unknown state', async () => {
  const { io } = fixture('prepare');
  io.fail = async () => { throw new Error('lost_response'); };
  assert.deepEqual(await runHostedStagingJob(io), { status: 'unknown' });
});
