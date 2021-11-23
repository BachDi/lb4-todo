import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Task, TaskRelations, User, Project} from '../models';
import {UserRepository} from './user.repository';
import {ProjectRepository} from './project.repository';

export class TaskRepository extends DefaultCrudRepository<
  Task,
  typeof Task.prototype.id,
  TaskRelations
> {

  public readonly assignee: BelongsToAccessor<User, typeof Task.prototype.id>;

  public readonly creator: BelongsToAccessor<User, typeof Task.prototype.id>;

  public readonly project: BelongsToAccessor<Project, typeof Task.prototype.id>;

  public readonly parent: BelongsToAccessor<Task, typeof Task.prototype.id>;

  constructor(
    @inject('datasources.MongoDB') dataSource: MongoDbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ProjectRepository') protected projectRepositoryGetter: Getter<ProjectRepository>, @repository.getter('TaskRepository') protected taskRepositoryGetter: Getter<TaskRepository>,
  ) {
    super(Task, dataSource);
    this.parent = this.createBelongsToAccessorFor('parent', taskRepositoryGetter,);
    this.registerInclusionResolver('parent', this.parent.inclusionResolver);
    this.project = this.createBelongsToAccessorFor('project', projectRepositoryGetter,);
    this.registerInclusionResolver('project', this.project.inclusionResolver);
    this.creator = this.createBelongsToAccessorFor('creator', userRepositoryGetter,);
    this.registerInclusionResolver('creator', this.creator.inclusionResolver);
    this.assignee = this.createBelongsToAccessorFor('assignee', userRepositoryGetter,);
    this.registerInclusionResolver('assignee', this.assignee.inclusionResolver);
  }
}
