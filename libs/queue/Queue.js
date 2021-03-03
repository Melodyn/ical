export default class Queue {
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

const filler = async () => Array.from(Array(5).keys()).reverse();
const task = async (data) => console.log(data);

const queue = new Queue(filler, task);
setInterval(() => queue.run(), 500);
