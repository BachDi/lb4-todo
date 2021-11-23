import {HttpErrors} from '@loopback/rest';
import {Credentials} from './jwt-authentication';

export function validateCredentials(credentials: Credentials) {
  if (!credentials.username) {
    throw new HttpErrors.UnprocessableEntity('username must not be empty');
  }

  if (credentials.password.length < 6) {
    throw new HttpErrors.UnprocessableEntity(
      'password length should be greater than 6',
    );
  }
}
