export const isNil = (value: unknown) => {
  return value === null || value === undefined
}

export const isNotNil = (value: unknown) => {
  return !isNil(value)
}
