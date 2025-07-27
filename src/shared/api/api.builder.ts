import { HttpException, InternalServerErrorException } from "@nestjs/common"
import { Api } from "./api"
import { ApiMeta } from "./api.interface"
import { isNil } from "./api.utils"

export class ApiBuilder<TData = unknown> {
  private signal: Api<TData, ApiMeta>

  constructor() {
    this.signal = new Api<TData, ApiMeta>()
  }

  static create() {
    return new ApiBuilder()
  }

  setData<T extends TData>(data: T): ApiBuilder<T> {
    this.signal.data = data
    return this as unknown as ApiBuilder<T>
  }

  setMessage(message: string) {
    this.signal.message = message
    return this
  }

  setMeta<T extends ApiMeta>(pagination: T) {
    this.signal.meta = pagination
    return this
  }

  throwException(exception: HttpException | Error) {
    if (exception instanceof HttpException) {
      throw new HttpException(
        exception?.getResponse?.(),
        exception?.getStatus?.(),
        {
          cause: exception.cause,
          description: exception.name,
        },
      )
    }

    if (exception instanceof Error) {
      throw new InternalServerErrorException(exception.message, {
        cause: exception.stack,
      })
    }
  }

  build() {
    if (isNil(this.signal.message) || isNil(this.signal.data))
      throw new Error("Missing Signal properties included in (message, data).")

    return {
      data: this.signal.getData(),
      message: this.signal.getMessage(),
      meta: this.signal.getMeta(),
    }
  }
}
