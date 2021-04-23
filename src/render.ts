import type { Message, DMChannel, NewsChannel, TextChannel } from "discord.js";
import type { GungnirClient } from "@gungnir/core";
import reconciler from "./reconciler";
import { RootNode } from "./nodes";

export const TRIGGER_CHANGE = Symbol("trigger change");

const noop = () => {};
export class RenderResult {
  public root = new RootNode();

  public readonly client: GungnirClient = this.channel.client;
  public constructor(public readonly channel: DMChannel | TextChannel | NewsChannel, element: JSX.Element) {
    const container = reconciler.createContainer(this, 0, false, null);
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
  public static current: RenderResult | null = null;
}

export function render(element: JSX.Element, channel: DMChannel | TextChannel | NewsChannel) {
  return new RenderResult(channel, element);
}