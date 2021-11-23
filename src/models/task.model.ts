import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {Project} from './project.model';

@model()
export class Task extends Entity {
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
    type: 'boolean',
  })
  isCreatedByAdmin?: boolean;

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
    type: 'date',
    default: () => new Date(),
  })
  startDate?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  completedDate?: string;

  @property({
    type: 'string',
  })
  priority?: string;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  dueDate?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createAt?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: string;

  @belongsTo(() => User, {name: 'assignee'})
  assigneeTo: string;

  @belongsTo(() => User, {name: 'creator'})
  createdBy: string;

  @belongsTo(() => Project)
  projectId: string;

  @belongsTo(() => Task)
  parentId: string;

  constructor(data?: Partial<Task>) {
    super(data);
  }
}

export interface TaskRelations {
  // describe navigational properties here
}

export type TaskWithRelations = Task & TaskRelations;
