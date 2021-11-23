import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId} from '@loopback/security';
import lodashSplit from 'lodash/split';
import {promisify} from 'util';
import {User} from '../models/user.model';
import {MyUserProfile} from './jwt-authentication';
import {TokenServiceBindings} from './jwt-authentication/keys';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

interface DecodedToken {
  iat: number;
  exp: number;
  id: string;
}

export class JWTService {
  @inject(TokenServiceBindings.TOKEN_SECRET)
  public readonly jwtSecret: string;
  @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
  public readonly jwtExpiresIn: string;

  @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
  public readonly expiresSecret: string;

  async generateToken(userProfile: MyUserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error while generating token :userProfile is null',
      );
    }
    let token = '';
    try {
      token = await signAsync(userProfile, this.jwtSecret, {
        expiresIn: this.expiresSecret,
      });
      return token;
    } catch (err) {
      throw new HttpErrors.Unauthorized(`error generating token ${err}`);
    }
  }

  async verifyToken(token: string): Promise<MyUserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token:'token' is null`,
      );
    }

    let userProfile: MyUserProfile;

    try {
      const decryptedToken = await verifyAsync(token, this.jwtSecret);

      userProfile = Object.assign(
        {[securityId]: '', id: '', username: '', projectId: '', roleId: ''},
        {
          [securityId]: decryptedToken.id,
          id: decryptedToken.id,
          username: decryptedToken.username,
          name: decryptedToken.id,
          role: decryptedToken.role,
        },
      );
    } catch (err) {
      throw new HttpErrors.Unauthorized(`Error verifying token:${err.message}`);
    }
    return userProfile;
  }

  async generateTemporaryTokenForResetPassword(
    userProfile: User,
  ): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'error-generating-token-user-profile-is-null',
      );
    }
    const payload = {
      userId: userProfile.id,
    };
    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    return token;
  }

  async decodeToken(token: string): Promise<DecodedToken> {
    const decodedToken = await verifyAsync(token, this.jwtSecret);
    return decodedToken;
  }

  extractToken(authHeader: string): string {
    if (authHeader && lodashSplit(authHeader, ' ')[0] === 'Bearer') {
      return lodashSplit(authHeader, ' ')[1];
    }
    return '';
  }
}
