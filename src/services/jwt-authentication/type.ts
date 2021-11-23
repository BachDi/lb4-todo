import { UserProfile } from '@loopback/security';
import {RoleEnum} from '../../enums/role-enum';

export type Credentials = {
  username: string;
  password: string;
};

export interface MyUserProfile extends UserProfile {
  id: string;
  username: string;
  name?: string;
  role?: RoleEnum;
}
