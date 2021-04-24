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
    const content = renderResult.contents.join("\n");
    const embed = renderResult.embeds[0];
    const reactions = renderResult.reactions;
    const msg = await this.channel.send(content, {embed});
    renderResult.onChange(() => {
      msg.edit(renderResult.contents.join("\n"), {embed: renderResult.embeds[0] ?? null});
    });
    reactions.forEach(async r => {
      try {await msg.react(r)} catch {}
    });
    renderResult.provideMessage(msg);
    return msg;
  }
});