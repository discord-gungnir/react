import type { Message } from "discord.js";
import reconciler from "./reconciler";
import { RootNode } from "./nodes";

export const CURRENT_RENDER = Symbol("current render");
export const TRIGGER_CHANGE = Symbol("trigger change");

const noop = () => {};
export class RenderResult {
  public root = new RootNode(this);

  public constructor(element: JSX.Element) {
    const container = reconciler.createContainer(this.root, 0, false, null);
    reconciler.updateContainer(element, container, null, noop);
  }

  // changes
  readonly #changes = new Set<() => void>();
  public onChange(fn: () => void) {this.#changes.add(fn)}
  public offChange(fn: () => void) {this.#changes.delete(fn)}
  private [TRIGGER_CHANGE]() {
    for (const change of this.#changes) 
      change();
  }

  // message
  #message: Message | null = null;
  #waiting: ((msg: Message) => void)[] = [];
  public get message() {
    return this.#message;
  }
  public setMessage(message: Message) {
    this.#message = message;
    for (const fn of this.#waiting)
      fn(message);
    this.#waiting.length = 0;
  }
  public awaitMessage() {
    return new Promise<Message>(resolve => {
      if (this.message) resolve(this.message);
      else this.#waiting.push(resolve);
    });
  }

  // current
  private static [CURRENT_RENDER]: RenderResult | null = null;
}

export function render(element: JSX.Element) {
  return new RenderResult(element);
}