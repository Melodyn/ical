const asyncInterval = (callback, period) => {
  let intervalId = null;
  return new Promise((resolve) => {
    intervalId = setInterval(() => resolve(callback()), period);
  }).then(() => intervalId);
};

export default class Synchronizer {
  constructor(filler, task) {
    this.queue = [];
    this.queueId = null;
    this.filler = filler;
    this.task = task;
    this.period = 1000;
    this.state = 'stopped';
  }

  async start() {
    const run = () => {
      if (this.state !== 'started') {
        throw new Error('Service not started');
      }

      const task = (this.queue.length === 0)
        ? this.filler().then((newQueue) => this.queue.push(...newQueue))
        : this.task(this.queue.shift());

      return task.catch((err) => {
        this.stop();
        throw err;
      });
    };

    this.state = 'started';
    this.queueId = await asyncInterval(run, this.period);

    return this.queueId;
  }

  async stop() {
    clearInterval(this.queueId);
    this.queue = [];
    this.queueId = null;
    this.state = 'stopped';

    return this.state;
  }
}

const filler = async () => Array.from(Array(5).keys()).reverse();
const task = async (data) => console.log('task', { data });

const synchronizer = new Synchronizer(filler, task);
synchronizer.start()
  .then(console.log)
  .catch(console.error);
setTimeout(() => {
  console.log('stop task');
  synchronizer.stop();
}, 5000);
