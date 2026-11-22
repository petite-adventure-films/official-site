// One hosted build owns one durable claim. Provider-specific I/O is injected so
// failures and lost responses can be tested without touching Cloudflare.
export async function runHostedStagingJob(io) {
  const sleep = io.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  // Diagnostics contain stage identifiers only, never candidate/provider output.
  async function step(name, run, attempts = 1) {
    for (let attempt = 1; ; attempt++) {
      io.observe?.({ stage: name, event: 'start', attempt });
      try {
        const result = await run();
        io.observe?.({ stage: name, event: 'complete', attempt });
        return result;
      } catch (error) {
        io.observe?.({ stage: name, event: 'error', attempt, reason: io.diagnose?.(error) ?? 'unavailable' });
        if (attempt >= attempts) throw error;
        await sleep(5000);
      }
    }
  }
  const claim = await step('claim', () => io.claim());
  if (!claim) return { status: 'idle' };
  let activationRequested = false;
  try {
    await step('checkProtection', () => io.checkProtection());
    const prepared = await step('prepare', () => io.prepare(claim));
    const uploaded = await step('upload', () => io.upload(prepared));
    await step('checkProtection', () => io.checkProtection());
    // A lost authorization response is ambiguous: never report terminal failure
    // or automatically obtain another claim after this point.
    activationRequested = true;
    await step('authorizeActivation', () => io.authorizeActivation(claim, { ...prepared, ...uploaded }));
    // A deployment may succeed while its response is lost. Never repeat the
    // mutation: only inspect the active version and immutable release marker.
    try { await step('activate', () => io.activate(uploaded)); } catch { /* Verify below. */ }
    const receipt = await step('verify', () => io.verify(claim, { ...prepared, ...uploaded }), 12);
    // The coordinator accepts an identical receipt idempotently, including
    // after the first response was lost. This never activates a version again.
    await step('succeed', () => io.succeed(claim, receipt), 6);
    return { status: 'succeeded' };
  } catch {
    if (activationRequested) return { status: 'unknown' };
    // This build has not attempted activation, so its failure is terminal.
    // If the report itself is lost, leave the durable claim for reconciliation.
    try { await step('fail', () => io.fail(claim), 3); return { status: 'failed' }; }
    catch { return { status: 'unknown' }; }
  }
}
