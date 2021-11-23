import {inject} from '@loopback/core';
import {compare, genSalt, hash} from 'bcryptjs';
import {PasswordHasherBindings} from './jwt-authentication/keys';

export interface PasswordHasher<T = string> {
  hashPassword(password: T): Promise<T>;
  comparePassword(password: T, storedPass: T): Promise<boolean>;
}

export class BcryptHasher implements PasswordHasher<string> {
  async comparePassword(
    password: string,
    storedPass: string,
  ): Promise<boolean> {
    const passwordMatches = await compare(password, storedPass);
    return passwordMatches;
  }

  @inject(PasswordHasherBindings.ROUNDS)
  public readonly rounds: number;

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.rounds);
    return hash(password, salt);
  }
}
