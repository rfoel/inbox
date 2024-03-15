import crypto from 'node:crypto'

function hotp(
  key: string,
  counter: number,
  options: { algorithm: string; digits: number },
) {
  const algorithm = options.algorithm
  const digits = options.digits
  const hmac = crypto
    .createHmac(algorithm, key)
    .update(Buffer.from(counter.toString(16).padStart(16, '0'), 'hex'))
    .digest()
  return String(truncate(hmac, digits)).padStart(digits, '0')
}

function truncate(hmac: Buffer, digits: number) {
  const offset = hmac[hmac.length - 1] & 0x0f
  const value =
    ((hmac[offset + 0] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return value % 10 ** digits
}

export function totp(
  key: string,
  options: {
    algorithm?: string
    digits?: number
    t0?: number
    time?: number
    timeStep?: number
  } = {},
) {
  const time = options?.time ?? Date.now() / 1000
  const timeStep = options.timeStep ?? 30
  const t0 = options?.t0 ?? 0
  const digits = options?.digits ?? 6
  const algorithm = options?.algorithm ?? 'sha1'
  const counter = Math.floor((time - t0) / timeStep)
  return hotp(key, counter, { algorithm, digits })
}
