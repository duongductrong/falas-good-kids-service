export class AuthTokenPayload {
  id: number

  email: string

  role: string

  constructor(payload: AuthTokenPayload) {
    this.id = payload.id
    this.email = payload.email
    this.role = payload.role
  }
}
