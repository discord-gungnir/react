import type { ColorResolvable, FileOptions, MessageAttachment, User, EmojiIdentifierResolvable, MessageReaction, PartialUser, Message as DiscordMessage } from "discord.js";
import type { Elements, String } from "@dragoteryx/react-util";
import type { PropsWithChildren } from "./types";
import { useEffect } from "react";
import { useMessage } from "./hooks";

// intrinsic

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "gungnir-author": {children: String, iconURL?: string, url?: string};
      "gungnir-description": {children: String};
      "gungnir-embed": {children?: Elements, color?: ColorResolvable};
      "gungnir-field": {children: [name: JSX.Element, value: JSX.Element], inline?: boolean};
      "gungnir-field-name": {children: String};
      "gungnir-field-value": {children: String};
      "gungnir-file": {file: string | FileOptions | MessageAttachment};
      "gungnir-footer": {children: String, iconURL?: string};
      "gungnir-message": {children: String};
      "gungnir-image": {url: string};
      "gungnir-reaction": {emoji: EmojiIdentifierResolvable};
      "gungnir-thumbnail": {url: string};
      "gungnir-timestamp": {time?: number | Date};
      "gungnir-title": {children: String, url?: string};
    }
  }
}

export function Author(props: PropsWithChildren<"author">) {
  return <gungnir-author iconURL={props.iconURL} url={props.url}>{props.children}</gungnir-author>;
}

export function Description(props: PropsWithChildren<"description">) {
  return <gungnir-description>{props.children}</gungnir-description>;
}

export function Embed(props: PropsWithChildren<"embed">) {
  return <gungnir-embed color={props.color}>{props.children}</gungnir-embed>;
}

export function Field(props: PropsWithChildren<"field">) {
  return <gungnir-field inline={props.inline}>{props.children}</gungnir-field>;
}

export function FieldName(props: PropsWithChildren<"field-name">) {
  return <gungnir-field-name>{props.children}</gungnir-field-name>;
}

export function FieldValue(props: PropsWithChildren<"field-value">) {
  return <gungnir-field-value>{props.children}</gungnir-field-value>;
}

export function File(props: PropsWithChildren<"file">) {
  return <gungnir-file file={props.file}/>;
}

export function Footer(props: PropsWithChildren<"footer">) {
  return <gungnir-footer iconURL={props.iconURL}>{props.children}</gungnir-footer>;
}

export function Image(props: PropsWithChildren<"image">) {
  return <gungnir-image url={props.url}/>;
}

export function Message(props: PropsWithChildren<"message">) {
  return <gungnir-message>{props.children}</gungnir-message>;
}

export function Reaction(props: PropsWithChildren<"reaction"> & {onClick?(user: User): void, onAdd?(user: User): void, onRemove?(user: User): void}) {
  const msg = useMessage();

  const emoji = props.emoji;
  function createEvent(msg: DiscordMessage, event: (user: User) => void) {
    return async (msgReaction: MessageReaction, user: User | PartialUser) => {
      if (user.id == msg.client.user?.id) return;
      if (msgReaction.message.id != msg.id) return;
      if (user.partial) user = await msg.client.users.fetch(user.id);
      if (msgReaction.emoji.toString() != emoji) return;
      event(user);
    };
  }

  useEffect(() => {
    if (!msg || !props.onClick) return;
    const event = createEvent(msg, props.onClick);
    msg.client.on("messageReactionAdd", event);
    msg.client.on("messageReactionRemove", event);
    return () => {
      msg.client.off("messageReactionAdd", event);
      msg.client.off("messageReactionRemove", event);
    };
  }, [msg?.id, emoji, props.onClick]);

  useEffect(() => {
    if (!msg || !props.onAdd) return;
    const event = createEvent(msg, props.onAdd);
    msg.client.on("messageReactionAdd", event);
    return () => void msg.client.off("messageReactionAdd", event);
  }, [msg?.id, emoji, props.onAdd]);

  useEffect(() => {
    if (!msg || !props.onRemove) return;
    const event = createEvent(msg, props.onRemove);
    msg.client.on("messageReactionRemove", event);
    return () => void msg.client.off("messageReactionRemove", event);
  }, [msg?.id, emoji, props.onRemove]);

  return <gungnir-reaction emoji={props.emoji}/>;
}

export function Thumbnail(props: PropsWithChildren<"thumbnail">) {
  return <gungnir-thumbnail url={props.url}/>;
}

export function Timestamp(props: PropsWithChildren<"timestamp">) {
  return <gungnir-timestamp time={props.time}/>;
}

export function Title(props: PropsWithChildren<"title">) {
  return <gungnir-title url={props.url}>{props.children}</gungnir-title>;
}

// misc

export function ProgressBar(props: {name: string, percentage: number, length?: number, inline?: boolean}) {
  let bar = "";
  const length = props.length ?? 20;
  const size = Math.round(props.percentage*length); 
  for (let i = 0; i < length; i++) bar += i < size ? "???" : "???";
  return (
    <Field inline={props.inline}>
      <FieldName>{props.name}</FieldName>
      <FieldValue>[{bar}]</FieldValue>
    </Field>
  );
}