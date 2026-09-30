/** Decimal 1.5 GB size policy; physical browser/device capacity is not guaranteed. */
const SIZE_LIMIT_BYTES = 1_500_000_000;

export const LIMITS = Object.freeze({
  fileBytes: SIZE_LIMIT_BYTES,
  outputBytes: SIZE_LIMIT_BYTES,
  zipBytes: SIZE_LIMIT_BYTES,
  timeoutMs: 120_000,
});
