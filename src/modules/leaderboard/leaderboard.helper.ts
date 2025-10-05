import { dayjs } from "@/shared/utils/dayjs"
import { LeaderboardRange } from "./leaderboard.enum"

export const getLeaderboardRange = (range: LeaderboardRange) => {
  switch (range) {
    case LeaderboardRange.MONTHLY:
      return [
        dayjs().startOf("month").toDate(),
        dayjs().endOf("month").toDate(),
      ]
    case LeaderboardRange.ALL_TIME:
      return [dayjs().startOf("year").toDate(), dayjs().endOf("year").toDate()]
    default:
      return null
  }
}
