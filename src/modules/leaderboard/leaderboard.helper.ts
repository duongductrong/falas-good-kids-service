import { dayjs } from "@/shared/utils/dayjs"
import { LeaderboardRange } from "./leaderboard.enum"

export const getLeaderboardRange = (range: LeaderboardRange) => {
  switch (range) {
    case LeaderboardRange.CURRENT_MONTH:
      return [
        dayjs().startOf("month").toDate(),
        dayjs().endOf("month").toDate(),
      ]
    case LeaderboardRange.CURRENT_YEAR:
      return [dayjs().startOf("year").toDate(), dayjs().endOf("year").toDate()]
    default:
      return null
  }
}
