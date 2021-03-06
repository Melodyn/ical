/* eslint-disable no-await-in-loop */
import errors from '../../utils/errors.cjs';

const { ICalAppError } = errors;

class CronServiceError extends ICalAppError {}

const asyncTimeout = (task, delay) => {
  let timerId = null;

  return new Promise((resolve) => {
    timerId = setTimeout(() => resolve(task()), delay);
  })
    .then(() => timerId);
};

export default class CronService {
  constructor(tasks, period, firstDelay = 0) {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      throw new CronServiceError('tasks must be not empty array');
    }
    this.period = period;
    this.firstDelay = firstDelay;
    this.tasks = tasks;
    this.state = 'init';
    this.timerId = null;
  }

  async start() {
    if (this.state === 'init') {
      this.state = 'started';
      await asyncTimeout(() => {}, this.firstDelay);
      const tasks = this.tasks.slice();
      const tasksCount = tasks.length;
      let taskIndex = 0;

      while (this.state === 'started') {
        const currentTaskIndex = taskIndex % tasksCount;
        const currentTask = tasks[currentTaskIndex];
        this.timerId = await asyncTimeout(currentTask, this.period);
        taskIndex += 1;
      }
    }

    this.state = 'stopped';

    return true;
  }

  async stop() {
    clearTimeout(this.timerId);
    this.state = 'terminated';
  }
}
