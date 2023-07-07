class Heap {
  #arr: Array<Array<number>>;

  constructor() {
    this.#arr = new Array<Array<number>>();
  }

  #swap(i: number, j: number) {
    let temp: Array<number> = this.#arr[i];
    this.#arr[i] = this.#arr[j];
    this.#arr[j] = temp;
  }

  push(val: Array<number>): void {
    this.#arr.push(val);

    let i: number = this.#arr.length - 1;
    while (i > 0) {
      let father_idx: number = Math.floor((i - 1) / 2);

      if (this.#arr[father_idx][0] < this.#arr[i][0]) break;

      this.#swap(father_idx, i);
      i = father_idx;
    }
  }

  pop(): void {
    if (this.#arr.length == 0) return;

    this.#arr[0] = this.#arr[this.#arr.length - 1];
    this.#arr.pop();

    let i: number = 0, left_child_idx, right_child_idx;
    while (i < this.#arr.length) {
      left_child_idx = 2 * i + 1; right_child_idx = 2 * i + 2;

      if (right_child_idx < this.#arr.length
        && this.#arr[left_child_idx][0] <= this.#arr[right_child_idx][0]
        && this.#arr[left_child_idx][0] < this.#arr[i][0]) {
        this.#swap(left_child_idx, i);
        i = left_child_idx;
      } else if (right_child_idx < this.#arr.length
        && this.#arr[right_child_idx][0] <= this.#arr[left_child_idx][0]
        && this.#arr[right_child_idx][0] < this.#arr[i][0]) {
        this.#swap(right_child_idx, i);
        i = right_child_idx;
      } else break;
    }
  }

  empty(): boolean {
    return this.#arr.length == 0;
  }

  top(): Array<number> {
    return this.#arr.length == 0 ? [] : this.#arr[0];
  }
}

export default Heap;