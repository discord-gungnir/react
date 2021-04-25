import type { Message, MessageEmbed } from "discord.js";
import { Command } from "@gungnir/core";
import { render } from "./render";

declare module "@gungnir/core" {
  namespace Command {
    interface Context {
      jsx(element: JSX.Element): Promise<Message>;
    }
  }
}

type Edit = {content: string, embed?: MessageEmbed};
Object.defineProperty(Command.Context.prototype, "jsx", {
  configurable: true, writable: true, enumerable: false,
  async value(this: Command.Context, element: JSX.Element) {
    let edit: Edit | null = null;
    let msg: Message;

    const renderResult = render(element, this.channel);
    renderResult.onChange(async () => {
      const content = renderResult.contents.join("\n");
      const embed = renderResult.embeds[0];
      if (msg) msg.edit(content, {embed: embed ?? null});
      else edit = {content, embed};
    });

    const content = renderResult.contents.join("\n");
    const embed = renderResult.embeds[0];
    const reactions = renderResult.reactions;

    msg = await this.send({content, embed});
    if (edit) await msg.edit({
      content: (edit as Edit).content ?? "",
      embed: (edit as Edit).embed ?? null}
    );

    renderResult.provideMessage(msg);
    reactions.forEach(async r => {
      try {await msg.react(r)} catch {}
    });
    return msg;
  }
});