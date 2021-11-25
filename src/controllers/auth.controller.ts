// Uncomment these imports to begin using these cool features!

import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {pick} from 'lodash';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash-password';
import {
  Credentials,
  JWTService,
  MyUserService,
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings
} from '../services/jwt-authentication';
import {validateCredentials} from '../services/validator';
import {CredentialsRequestBody} from '../types/credential-schema';

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) {}

  @post('/auth/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {
              title: 'NewUser',
            }),
          },
        },
      },
    },
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            exclude: ['id', 'createdAt', 'updatedAt'],
          }),
        },
      },
    })
    userData: Omit<User, 'id'>,
  ) {
    validateCredentials(pick(userData, ['username', 'password']));

    const existedUser = await this.userRepository.findOne({
      where: {username: userData.username},
    });
    if (existedUser) {
      throw new HttpErrors.UnprocessableEntity('username existed');
    }

    const hashedPassword = await this.hasher.hashPassword(userData.password);
    const newUser = await this.userRepository.create({
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      name: userData.name,
    });
    return newUser;
  }

  @post('/auth/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token});
  }

  @get('/auth/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: 'application/json',
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    const userId: string = currentUserProfile[securityId];
    const userDetail: User = await this.userRepository.findById(userId);
    return userDetail;
  }
}
