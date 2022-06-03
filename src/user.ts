import { ClientRegister, User } from "./apiTypes";
import { RealClock } from "./time";
import { UserStatus } from "./types";

export class UserState {
  readonly aid: string;
  private readonly jwt: string;

  readonly timeKeeper = RealClock;
  createdAt = this.timeKeeper.now();
  updatedAt = this.timeKeeper.now();
  status = UserStatus.Ready;

  constructor(
    user: User,
  ) {
    this.aid = user.aid;
    this.jwt = user.jwt;
  }

  isValid(data: ClientRegister) {
    return this.jwt === data.user.jwt;
  }

  static cache = new Map<string, UserState>();
}
