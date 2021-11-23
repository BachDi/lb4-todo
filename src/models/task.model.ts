import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

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
  })
  isActive?: boolean;

  @property({
    type: 'date',
  })
  startDate?: string;

  @property({
    type: 'date',
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
  })
  dueDate?: string;

  @property({
    type: 'date',
  })
  createAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  @belongsTo(() => User, {name: 'assignee'})
  assigneeTo: string;

  @belongsTo(() => User, {name: 'creator'})
  createdBy: string;

  constructor(data?: Partial<Task>) {
    super(data);
  }
}

export interface TaskRelations {
  // describe navigational properties here
}

export type TaskWithRelations = Task & TaskRelations;
