import Heap from "../types/Heap";
import Queue from "../types/Queue";

function heapTest() {
  const hp: Heap = new Heap();
  const arr: Array<Array<number>> = [[0, 1, 2], [1, 1, 2], [10, 1, 2], [2, 1, 2], [4, 1, 2], [4, 1, 2], [1, 1, 2], [21, 1, 2]];
  
  arr.forEach(i => hp.push(i));
  
  while (!hp.empty()) {
    console.log(hp.top());
    hp.pop();
  }
}

function queueTest() {
  const arr: Array<Array<number>> = [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2]];
  const q: Queue<Array<number>> = new Queue();

  arr.forEach(i => q.push(i));

  while (!q.empty()) {
    console.log(q.front());
    q.pop();
  }
}

export {
  heapTest,
  queueTest
}
