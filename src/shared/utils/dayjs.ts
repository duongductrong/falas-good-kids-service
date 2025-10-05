import * as dayjs from "dayjs"
import * as timezone from "dayjs/plugin/timezone"
import * as utc from "dayjs/plugin/utc"
import * as customParseFormat from "dayjs/plugin/customParseFormat"

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

// Set default timezone
dayjs.tz.setDefault("Asia/Ho_Chi_Minh")

export { dayjs }
