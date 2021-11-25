import {Entity, hasMany, model, property} from '@loopback/repository';
import {ProjectUserWithRelations, TaskWithRelations} from '.';
import {RoleEnum} from './../enums/role-enum';
import {ProjectUser} from './project-user.model';
import {Task} from './task.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;


  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    hidden: true,
    required: true,
  })
  password: string;


  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(RoleEnum),
    },
  })
  role?: RoleEnum;

  @property({
    type: 'boolean',
    default: true,
  })
  isActive?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

  @property({
    type: 'string',
  })
  avatarURL?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: string;

  @hasMany(() => ProjectUser)
  projectUsers: ProjectUser[];

  @hasMany(() => Task, {keyTo: 'assigneeTo'})
  assignedTasks: Task[];

  @hasMany(() => Task, {keyTo: 'createdBy'})
  createdTasks: Task[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
  projectUsers?: ProjectUserWithRelations[]
  assigneeTo?: TaskWithRelations[]
  createdBy?: TaskWithRelations[]
}

export type UserWithRelations = User & UserRelations;
