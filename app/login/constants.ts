import { Attributes, StringMap } from "onecore"

export const userModel: Attributes = {
  username: { required: true, length: 100, resource: "username" },
  password: { required: true, length: 100, resource: "password" },
  message: {},
}

export const map: StringMap = {
  "2": "fail_authentication",
  "3": "fail_expired_password",
  "4": "fail_locked_account",
  "9": "fail_disabled_account",
}
