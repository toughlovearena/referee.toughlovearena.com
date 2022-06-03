export interface User {
  jwt: string;
  aid: string;
}

export enum MessageType {
  ClientRegister = 'register',
}

export interface ClientRegister {
  type: MessageType.ClientRegister,
  user: User,
}
export type ClientMessage = (
  ClientRegister
)
