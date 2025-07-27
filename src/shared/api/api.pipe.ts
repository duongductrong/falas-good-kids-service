import { BadRequestException, HttpStatus, ValidationPipe } from "@nestjs/common"
import { ValidationError } from "class-validator"

export interface ApiPipeException {
  signalValidationPipe: boolean
  errors: (ValidationError & { messages: string[] })[]
}

export class ApiPipe {
  private static simpleErrors(errors: ValidationError[]) {
    return errors.reduce(
      (groupErrors, error) => ({
        ...groupErrors,
        [error.property]: Object.values(error.constraints ?? {}).join(", "),
      }),
      {} as Record<string, string>,
    )
  }

  private static complexErrors(errors: ValidationError[]) {
    const result = errors.map((error) => {
      return {
        ...error,
        messages: Object.values(error.constraints ?? {}),
      }
    })

    return result
  }

  static create() {
    return new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory(originalErrors) {
        const errors = ApiPipe.simpleErrors(originalErrors)
        return new BadRequestException({
          signalValidationPipe: true,
          errors,
        })
      },
    })
  }
}
