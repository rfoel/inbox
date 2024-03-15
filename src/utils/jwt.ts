import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export const sign = async (payload?: jose.JWTPayload) => {
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  return jwt
}

export const decode = (jwt: string) => {
  return jose.decodeJwt(jwt)
}
