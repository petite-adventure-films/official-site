import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runHostedStagingJob } from './hosted-staging-job.mjs';
import { stagingDiagnostic } from './staging-diagnostics.mjs';

function fixture(failure) {
  const calls = [];
  const claim = { operationId: 'operation', attempt: 1, token: 'claim' };
  const io = Object.fromEntries(['claim', 'checkProtection', 'prepare', 'upload', 'authorizeActivation', 'activate', 'verify', 'succeed', 'fail'].map(name => [name, async () => {
    calls.push(name);
    if (name === failure) throw new Error('network_or_provider_failure');
    return name === 'claim' ? claim : {};
  }]));
  io.sleep = async () => {};
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
for (const stage of ['authorizeActivation', 'verify', 'succeed']) {
  test(`${stage} persistent failure remains unknown without repeating deployment or reporting failure`, async () => {
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
test('lost activation response is recovered by verification without another deployment', async () => {
  const { io, calls } = fixture('activate');
  assert.deepEqual(await runHostedStagingJob(io), { status: 'succeeded' });
  assert.equal(calls.filter(name => name === 'activate').length, 1);
  assert.equal(calls.includes('fail'), false);
});
test('failed activation and unmatched active version remain unknown', async () => {
  const { io, calls } = fixture('activate');
  io.verify = async () => { throw new Error('Active version mismatch'); };
  assert.deepEqual(await runHostedStagingJob(io), { status: 'unknown' });
  assert.equal(calls.filter(name => name === 'activate').length, 1);
  assert.equal(calls.includes('succeed'), false);
  assert.equal(calls.includes('fail'), false);
});
test('propagation delay and lost success response are retried without a new claim or deployment', async () => {
  const { io, calls } = fixture();
  let checks = 0, reports = 0;
  io.verify = async () => { if (++checks < 3) throw new Error('Release marker mismatch'); return { deploymentId: 'same' }; };
  io.succeed = async (_claim, receipt) => { assert.equal(receipt.deploymentId, 'same'); if (++reports < 2) throw new Error('lost response'); };
  assert.deepEqual(await runHostedStagingJob(io), { status: 'succeeded' });
  assert.equal(checks, 3); assert.equal(reports, 2);
  assert.equal(calls.filter(name => name === 'activate').length, 1);
  assert.equal(calls.filter(name => name === 'claim').length, 1);
});
test('diagnostics exclude secrets, candidate text and provider output', () => {
  const diagnostic = stagingDiagnostic(Object.assign(new Error('secret candidate body'), {
    code: 1, stdout: 'secret', stderr: 'Authorization: secret [code: 10000]', command: 'secret',
  }));
  assert.deepEqual(diagnostic, { exitCode: 1, providerCode: 10000 });
  assert.equal(JSON.stringify(diagnostic).includes('secret'), false);
});
