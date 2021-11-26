import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Project, Task, TaskRelations, User} from '../models';
import {ProjectRepository} from './project.repository';
import {UserRepository} from './user.repository';

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
    @inject('datasources.MongoDB') dataSource: MongoDbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ProjectRepository') protected projectRepositoryGetter: Getter<ProjectRepository>,
  ) {
    super(Task, dataSource);
    // this.parent = this.createBelongsToAccessorFor('parent', taskRepositoryGetter,);
    this.parent = this.createBelongsToAccessorFor(
      'parent',
      Getter.fromValue(this),
    ); // for recursive relationship
    this.registerInclusionResolver('parent', this.parent.inclusionResolver);
    this.project = this.createBelongsToAccessorFor('project', projectRepositoryGetter,);
    this.registerInclusionResolver('project', this.project.inclusionResolver);
    this.creator = this.createBelongsToAccessorFor('creator', userRepositoryGetter,);
    this.registerInclusionResolver('creator', this.creator.inclusionResolver);
    this.assignee = this.createBelongsToAccessorFor('assignee', userRepositoryGetter,);
    this.registerInclusionResolver('assignee', this.assignee.inclusionResolver);
  }
}
