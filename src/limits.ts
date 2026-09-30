/** Development safeguards only; physical mobile capacity has not been measured. */
export const LIMITS = Object.freeze({
  fileBytes: 50 * 1024 * 1024,
  sourcePages: 300,
  outputs: 100,
  copiedPages: 1000,
  inputCharacters: 4096,
  items: 512,
  groups: 100,
  outputBytes: 100 * 1024 * 1024,
  zipBytes: 110 * 1024 * 1024,
  // Reserve a second copy for Blob creation; actual browser peak still needs measurement.
  resultBytes: 50 * 1024 * 1024,
  resultResidentBytes: 100 * 1024 * 1024,
  timeoutMs: 120_000,
});
