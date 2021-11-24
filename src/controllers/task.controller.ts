import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response
} from '@loopback/rest';
import {SecurityBindings} from '@loopback/security';
import set from 'lodash/set';
import {Task} from '../models';
import {TaskRepository} from '../repositories';
import {MyUserProfile} from '../services/jwt-authentication/type';
import {RoleEnum} from './../enums/role-enum';
import {TaskWithRelations} from './../models/task.model';

@authenticate('jwt')
export class TaskController {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) {}

  @post('/tasks')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Task model instance',
    content: {'application/json': {schema: getModelSchemaRef(Task)}},
  })
  async create(
    @inject(SecurityBindings.USER)
    currentUserProfile: MyUserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'NewTask',
            exclude: ['id'],
          }),
        },
      },
    })
    task: Omit<Task, 'id' | 'isCreatedByAdmin'>,
  ): Promise<Task> {
    const role: RoleEnum = currentUserProfile?.role ?? RoleEnum.USER;
    set(task, 'isCreatedByAdmin', role === RoleEnum.ADMIN)
    return this.taskRepository.create(task);
  }

  @get('/tasks/count')
  @response(200, {
    description: 'Task model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Task) where?: Where<Task>): Promise<Count> {
    return this.taskRepository.count(where);
  }

  @get('/tasks')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Array of Task model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Task, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER)
    currentUserProfile: MyUserProfile,
    @param.filter(Task) filter?: Filter<Task>,
  ): Promise<Task[]> {
    const role: RoleEnum = currentUserProfile?.role ?? RoleEnum.USER;
    const tasks: TaskWithRelations[] = await this.taskRepository.find(filter);
    return (role === RoleEnum.ADMIN) ? tasks : tasks.filter((task) => !task?.isCreatedByAdmin);
  }

  @patch('/tasks')
  @response(200, {
    description: 'Task PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {partial: true}),
        },
      },
    })
    task: Task,
    @param.where(Task) where?: Where<Task>,
  ): Promise<Count> {
    return this.taskRepository.updateAll(task, where);
  }

  @get('/tasks/{id}')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Task model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Task, {includeRelations: true}),
      },
    },
  })
  async findById(
    @inject(SecurityBindings.USER)
    currentUserProfile: MyUserProfile,
    @param.path.string('id') id: string,
    @param.filter(Task, {exclude: 'where'}) filter?: FilterExcludingWhere<Task>,
  ): Promise<Task> {
    const role: RoleEnum = currentUserProfile?.role ?? RoleEnum.USER;
    const task: TaskWithRelations = await this.taskRepository.findById(
      id,
      filter,
    );
    if (role !== RoleEnum.ADMIN && task.isCreatedByAdmin) {
      throw new HttpErrors.Unauthorized('This task can not be seen by user');
    }
    return task;
  }

  @patch('/tasks/{id}')
  @response(204, {
    description: 'Task PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {partial: true}),
        },
      },
    })
    task: Task,
  ): Promise<void> {
    await this.taskRepository.updateById(id, task);
  }

  @put('/tasks/{id}')
  @response(204, {
    description: 'Task PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() task: Task,
  ): Promise<void> {
    await this.taskRepository.replaceById(id, task);
  }

  @del('/tasks/{id}')
  @response(204, {
    description: 'Task DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.taskRepository.deleteById(id);
  }
}
