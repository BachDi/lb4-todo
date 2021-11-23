import {createBindingFromClass} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {repository} from '@loopback/repository';
import isEmpty from 'lodash/isEmpty';
import {Task} from '../models/task.model';
import {TaskRepository} from '../repositories';

@cronJob()
class CleanTask extends CronJob {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
  ) {
    super({
      name: 'clean-task-cronjob',
      onTick: async function onTick() {
        console.log('running cronjob');
        await cleanDeletedTasks(taskRepository);
      },
      cronTime: '0 0 0 * * *',
      start: true,
      // Turn on for testing
      runOnInit: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }
}

const cleanTaskBinding = createBindingFromClass(CleanTask);

export default cleanTaskBinding;

async function cleanDeletedTasks(taskRepository: TaskRepository) {
  let page = 0;
  const pageSize = 50;
  let tasks: Task[] = [];
  const updatingTasks: Task[] = [];
  try {
    while (!isEmpty(tasks) || page === 0) {
      tasks = await taskRepository.find({
        where: {
          isDeleted: true,
        },
        skip: page * pageSize,
        limit: pageSize,
      });
      updatingTasks.push(...tasks);
      page++;
    }
    await Promise.all(
      updatingTasks.map(item => taskRepository.deleteById(item.id)),
    );
    console.log('Cronjob: CleanTask ran successfully!');
  } catch (error) {
    console.warn('Cronjob: CleanTask ran failed! Error: ', error);
  }
}
