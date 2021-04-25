import type { Message } from "discord.js";
import { Command } from "@gungnir/core";
import { render } from "./render";

declare module "@gungnir/core" {
  namespace Command {
    interface Context {
      jsx(element: JSX.Element): Promise<Message>;
    }
  }
}

Object.defineProperty(Command.Context.prototype, "jsx", {
  configurable: true, writable: true, enumerable: false,
  async value(this: Command.Context, element: JSX.Element) {
    const renderResult = render(element, this.channel);
    renderResult.onChange(() => {
      const content = renderResult.contents.join("\n");
      const embed = renderResult.embeds[0];
      msg.edit(content, {embed: embed ?? null});
    });
    const content = renderResult.contents.join("\n");
    const embed = renderResult.embeds[0];
    const reactions = renderResult.reactions;
    const msg = await this.send(content, embed);
    renderResult.provideMessage(msg);
    reactions.forEach(async r => {
      try {await msg.react(r)} catch {}
    });
    return msg;
  }
});