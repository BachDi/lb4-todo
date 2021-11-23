// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {registerAuthenticationStrategy} from '@loopback/authentication';
import {
  Application,
  Binding,
  Component,
  CoreBindings,
  inject,
} from '@loopback/core';
import {MyUserService} from '.';
import {BcryptHasher} from '../hash-password';
import {JWTStrategy} from '../jwt.auth.strategy';
import {JWTService} from '../jwt.service';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from './keys';

export class MyJWTAuthenticationComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService),

    Binding.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher),
    Binding.bind(PasswordHasherBindings.ROUNDS).to(10),

    Binding.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService),
    Binding.bind(TokenServiceBindings.TOKEN_SECRET).to(
      process.env.JWT_SECRET_VALUE ?? 'vuhoangphuc',
    ),
    Binding.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      process.env.JWT_EXPIRES_IN_VALUE ?? '24h',
    ),
  ];
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    registerAuthenticationStrategy(app, JWTStrategy);
  }
}
