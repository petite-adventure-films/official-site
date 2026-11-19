// One hosted build owns one durable claim. Provider-specific I/O is injected so
// failures and lost responses can be tested without touching Cloudflare.
export async function runHostedStagingJob(io) {
  const claim = await io.claim();
  if (!claim) return { status: 'idle' };
  let activationRequested = false;
  try {
    await io.checkProtection();
    const prepared = await io.prepare(claim);
    const uploaded = await io.upload(prepared);
    await io.checkProtection();
    // A lost authorization response is ambiguous: never report terminal failure
    // or automatically obtain another claim after this point.
    activationRequested = true;
    await io.authorizeActivation(claim, { ...prepared, ...uploaded });
    await io.activate(uploaded);
    const receipt = await io.verify(claim, { ...prepared, ...uploaded });
    await io.succeed(claim, receipt);
    return { status: 'succeeded' };
  } catch {
    if (activationRequested) return { status: 'unknown' };
    // This build has not attempted activation, so its failure is terminal.
    // If the report itself is lost, leave the durable claim for reconciliation.
    try { await io.fail(claim); return { status: 'failed' }; }
    catch { return { status: 'unknown' }; }
  }
}
