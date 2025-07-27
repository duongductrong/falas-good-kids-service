export type Nullable<T> = null | T

export interface ApiConstructor<TData, TMeta = unknown> {
  message: string
  data: TData
  meta?: TMeta
}

export class Api<TData = unknown, TMeta = unknown> {
  message: string

  data: Nullable<TData>

  meta?: Nullable<TMeta>

  constructor() {
    this.message = ""
    this.data = null
    this.meta = null
  }

  getData() {
    return this.data
  }

  getMessage() {
    return this.message
  }

  getMeta() {
    return this.meta || undefined
  }
}
