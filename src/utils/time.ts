const unitMap = {
  s: 1000,
  m: 60000,
  h: 3600000,
  d: 86400000,
}

export type Time = `${number}${"h" | "m" | "d" | "s"}`

export const milliseconds = (timeString: Time | string) => {
  const [value, unit] = timeString.match(/(\d+)([hmsd])/)?.slice(1) ?? []
  const valueNumber = Number(value)
  const unitNumber = unitMap[unit]
  return valueNumber * unitNumber
}
