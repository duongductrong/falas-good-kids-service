import { BadRequestException, PipeTransform } from "@nestjs/common"
import { isNaN } from "lodash"

export class ParseNumberPipe implements PipeTransform {
  transform(value: unknown): number {
    const val = Number(value)

    if (isNaN(val)) {
      throw new BadRequestException("Invalid number")
    }

    return val
  }
}
