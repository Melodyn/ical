export default class QueueService {
  constructor(filler, task) {
    this.queue = [];
    this.filler = filler;
    this.task = task;
  }

  run() {
    if (this.queue.length === 0) {
      return this.filler().then((data) => this.queue.push(...data));
    }

    return this.task(this.queue.shift());
  }
}
