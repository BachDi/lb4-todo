import {Entity, model, property, hasMany} from '@loopback/repository';
import {ProjectUserWithRelations, TaskWithRelations} from '.';
import {ProjectUser} from './project-user.model';
import {Task} from './task.model';

@model()
export class Project extends Entity {
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
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

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

  @hasMany(() => Task)
  tasks: Task[];

  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  // describe navigational properties here
  projectUsers?: ProjectUserWithRelations[]
  tasks?: TaskWithRelations[]
}

export type ProjectWithRelations = Project & ProjectRelations;
