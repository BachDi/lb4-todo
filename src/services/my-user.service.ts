import { UserRepository } from './../repositories/user.repository';
import { UserService } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId } from '@loopback/security';
import { JWTService } from '.';
import { PasswordHasherBindings, TokenServiceBindings } from './jwt-authentication/keys';
import { Credentials, MyUserProfile } from './jwt-authentication/type';
import { BcryptHasher } from './hash-password';
import { User } from '../models/user.model';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {
        username: credentials.username,
      },
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound('user not found');
    }
    const passwordMatched = await this.hasher.comparePassword(
      credentials.password,
      foundUser.password,
    );
    if (!passwordMatched)
      throw new HttpErrors.Unauthorized('password is not valid');
    return foundUser;
  }

  convertToUserProfile(user: User): MyUserProfile {
    return {
      [securityId]: user.id!,
      id: user.id!,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  }
}
