export class Stack<T> {
  public stack: T[];
  private size: number;
  constructor(arr: T[] | undefined, size: number) {
    this.stack = arr || [];
    this.size = size;
  }
  push(item: T): void {
    if (this.stack.length >= this.size) {
      this.stack.shift();
    }
    this.stack.push(item);
  }
  pop(): T | undefined {
    return this.stack.pop();
  }
  peek(): T | undefined {
    return this.stack[this.stack.length - 1];
  }
  isEmpty(): boolean {
    return this.stack.length === 0;
  }
  clear(): void {
    this.stack = [];
  }
  getLength(): number {
    return this.stack.length;
  }
}
