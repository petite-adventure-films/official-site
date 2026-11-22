// Allowlist only. Never serialize error.message, command, stdout or stderr.
export function stagingDiagnostic(error) {
  const result = {};
  if (Number.isInteger(error?.httpStatus)) result.httpStatus = error.httpStatus;
  if (Number.isInteger(error?.code)) result.exitCode = error.code;
  const providerCode = error?.stderr?.match(/\[code:\s*(\d+)\]/)?.[1];
  if (providerCode) result.providerCode = Number(providerCode);
  if (['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED'].includes(error?.cause?.code ?? error?.code)) {
    result.network = error.cause?.code ?? error.code;
  }
  if (['Active version mismatch', 'Release marker unavailable', 'Release marker mismatch',
    'Coordinator rejected request', 'Missing uploaded version', 'Access protection missing',
    'Access authentication failed', 'Invalid prepared release'].includes(error?.message)) result.check = error.message;
  if (error?.name === 'TimeoutError' || error?.killed) result.timeout = true;
  return result;
}
