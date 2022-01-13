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
  constructor(task, period, firstDelay = 0) {
    if (!task || (typeof task !== 'function')) {
      throw new CronServiceError('tasks must be function');
    }
    this.period = period;
    this.firstDelay = firstDelay;
    this.task = task;
    this.state = 'init';
    this.timerId = null;
  }

  async start() {
    if (this.state === 'init') {
      this.state = 'started';
      await asyncTimeout(() => {}, this.firstDelay);

      while (this.state === 'started') {
        this.timerId = await asyncTimeout(this.task, this.period);
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
