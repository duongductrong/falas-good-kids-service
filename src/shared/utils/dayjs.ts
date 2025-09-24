import * as dayjs from "dayjs"
import * as timezone from "dayjs/plugin/timezone"
import * as utc from "dayjs/plugin/utc"

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Set default timezone
dayjs.tz.setDefault("Asia/Ho_Chi_Minh")

export { dayjs }
