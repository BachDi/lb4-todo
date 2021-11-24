import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {User, UserRelations, ProjectUser, Task} from '../models';
import {ProjectUserRepository} from './project-user.repository';
import {TaskRepository} from './task.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly projectUsers: HasManyRepositoryFactory<ProjectUser, typeof User.prototype.id>;

  public readonly assignedTasks: HasManyRepositoryFactory<Task, typeof User.prototype.id>;

  public readonly createdTasks: HasManyRepositoryFactory<Task, typeof User.prototype.id>;

  constructor(
    @inject('datasources.MongoDB') dataSource: MongoDbDataSource, @repository.getter('ProjectUserRepository') protected projectUserRepositoryGetter: Getter<ProjectUserRepository>, @repository.getter('TaskRepository') protected taskRepositoryGetter: Getter<TaskRepository>,
  ) {
    super(User, dataSource);
    this.createdTasks = this.createHasManyRepositoryFactoryFor('createdTasks', taskRepositoryGetter,);
    this.registerInclusionResolver('createdTasks', this.createdTasks.inclusionResolver);
    this.assignedTasks = this.createHasManyRepositoryFactoryFor('assignedTasks', taskRepositoryGetter,);
    this.registerInclusionResolver('assignedTasks', this.assignedTasks.inclusionResolver);
    this.projectUsers = this.createHasManyRepositoryFactoryFor('projectUsers', projectUserRepositoryGetter,);
    this.registerInclusionResolver('projectUsers', this.projectUsers.inclusionResolver);
  }
}
