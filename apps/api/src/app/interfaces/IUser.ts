export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  lastLogin: Date;
  salt: string;
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
  salt: string;
}
