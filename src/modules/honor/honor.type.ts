import { DialogSubmitAction } from "@slack/bolt"

export interface VoteSubmissionAction
  extends Omit<DialogSubmitAction, "state"> {
  state: {
    values: {
      vote_type_selection?: {
        selected_option: {
          value: string
          text: {
            type: string
            text: string
          }
        }
      }
    }
  }
}
