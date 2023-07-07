import ListNode from "./ListNode"

class Queue<T> {
  #front: ListNode<T> | null;
  #tail: ListNode<T> | null;
  #size: number;

  constructor() {
    this.#front = null;
    this.#tail = null;
    this.#size = 0;
  }

  empty(): boolean {
    return this.#size == 0;
  }

  front(): T | undefined {
    return this.#front?.val;
  }

  push(val: T): void {
    const new_node: ListNode<T> = new ListNode<T>(val);

    if (this.empty()) {
      this.#front = new_node;
      this.#tail = new_node;
      this.#size = 1;
      return;
    }

    if (this.#tail) {
      this.#tail.next = new_node;
      this.#tail = this.#tail.next;
      this.#size++;
    }
  }

  pop(): void {
    if (this.empty()) return;

    if (this.#size == 1) {
      this.#front = null;
      this.#tail = null;
      this.#size = 0;
      return;
    }

    if (this.#front) {
      const nxt: ListNode<T> | null | undefined = this.#front.next;
      this.#front.next = null;
      this.#front = nxt;
      this.#size--;
    }
  }

  size(): number {
    return this.#size;
  }
}

export default Queue;