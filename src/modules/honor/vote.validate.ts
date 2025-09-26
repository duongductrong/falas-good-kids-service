import { BadRequestException, Injectable } from "@nestjs/common"
import { UsersProfileGetResponse } from "@slack/web-api"
import { has } from "lodash"

@Injectable()
export class VoteValidate {
  throwIfBotOrYourSelf(
    sender: UsersProfileGetResponse,
    receiver: UsersProfileGetResponse,
  ) {
    const isVotedForBot =
      has(sender.profile, "bot_id") || has(receiver.profile, "bot_id")
    const isVotedForYourSelf = sender.profile?.email === receiver.profile?.email

    if (isVotedForBot || isVotedForYourSelf) {
      throw new BadRequestException("You can't vote for a bot or yourself")
    }

    return true
  }
}
