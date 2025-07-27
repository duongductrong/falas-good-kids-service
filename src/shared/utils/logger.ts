import { Injectable } from "@nestjs/common"
import consola from "consola"

export const logger = consola

@Injectable()
export class LoggerService {
  private logger = logger

  debug(message: string, context?: string) {
    this.logger.debug(message, context)
  }

  info(message: string, context?: string) {
    this.logger.info(message, context)
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context)
  }

  error(message: string, context?: string) {
    this.logger.error(message, context)
  }

  fatal(message: string, context?: string) {
    this.logger.fatal(message, context)
  }

  start(message: string, context?: string) {
    this.logger.start(message, context)
  }

  success(message: string, context?: string) {
    this.logger.success(message, context)
  }

  ready(message: string, context?: string) {
    this.logger.ready(message, context)
  }

  silent(message: string, context?: string) {
    this.logger.silent(message, context)
  }

  trace(message: string, context?: string) {
    this.logger.trace(message, context)
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context)
  }

  log(message: string, context?: string) {
    this.logger.log(message, context)
  }

  get instance() {
    return this.logger
  }
}
