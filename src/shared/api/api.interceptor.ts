/* eslint-disable no-nested-ternary */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common"
import { Request, Response } from "express"
import { EMPTY, Observable, catchError, map } from "rxjs" // Add EMPTY
import { Api } from "./api"

@Injectable()
export class ApiInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiInterceptor.name) // Add logger

  /**
   * Check if the current execution context is HTTP
   * This prevents errors when using with non-HTTP contexts (e.g., Telegram bots, WebSockets, etc.)
   */
  private isHttpContext(context: ExecutionContext): boolean {
    return context.getType() === "http"
  }

  private responseHandler(
    res: Pick<Api, "data" | "message" | "meta">,
    context: ExecutionContext,
  ) {
    const ctx = context.switchToHttp()

    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = HttpStatus.OK as number
    response.status(status).json({
      status: true,
      statusCode: status,
      path: request.url,
      data: res.data,
      meta: res.meta,
      message: res.message,
      timestamp: new Date().toISOString(),
    })
  }

  private errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const isDebugging = request.headers?.["x-custom-debug"] || false

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const result = (exception as any)?.errors
      ? (exception as any)?.errors?.reduce(
          (groupErrors, error) => ({
            ...groupErrors,
            [error.property]: Object.values(error.constraints ?? {}).join(", "),
          }),
          {} as Record<string, string>,
        )
      : exception.cause
        ? exception.cause
        : (exception?.getResponse?.() as any)?.signalValidationPipe
          ? (exception?.getResponse?.() as any).errors
          : exception instanceof HttpException
            ? null
            : null

    // Log the error properly with full details
    this.logger.error(
      `HTTP ${status} Error: ${exception.message}`,
      exception.stack || "No stack trace available",
    )

    // Send the response but don't return it
    response.status(status).json({
      data: result,
      status: false,
      statusCode: status,
      path: request.url,
      meta: {},
      timestamp: new Date().toISOString(),
      message: exception.message ?? "Error",
      stack: isDebugging ? exception.stack : undefined,
      name: isDebugging ? exception.name : undefined,
    })

    // Don't return the response object - it causes issues
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<any> {
    // Only apply this interceptor to HTTP contexts
    // Skip for other contexts like Telegram bots, WebSockets, Microservices, etc.
    if (!this.isHttpContext(context)) {
      return next.handle()
    }

    return next.handle().pipe(
      map((res) => this.responseHandler(res as any, context)),
      catchError((err) => {
        this.errorHandler(err, context)
        // Return EMPTY to complete the observable without throwing
        return EMPTY
      }),
    )
  }
}
