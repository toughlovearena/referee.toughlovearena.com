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

  private constructor(
    user: User,
  ) {
    this.aid = user.aid;
    this.jwt = user.jwt;
    UserState.cache.set(this.aid, this);
  }

  isValid(data: ClientRegister) {
    return this.jwt === data.user.jwt;
  }

  static cache = new Map<string, UserState>();
  static register(user: User) {
    const instance = new UserState(user);
    this.cache.set(instance.aid, instance);
  }
}
