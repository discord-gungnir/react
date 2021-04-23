import type { ColorResolvable, FileOptions, MessageAttachment, User, EmojiIdentifierResolvable, MessageReaction, PartialUser, Message as DiscordMessage } from "discord.js";
import type { Elements, String, PropsWithChildren } from "./types";
import { Fragment, useCallback, useEffect } from "react";
import { useThisMessage } from "./hooks";

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
  return <gungnir-author {...props}/>;
}

export function Description(props: PropsWithChildren<"description">) {
  return <gungnir-description {...props}/>;
}

export function Embed(props: PropsWithChildren<"embed">) {
  return <gungnir-embed {...props}/>;
}

export function Field(props: PropsWithChildren<"field">) {
  return <gungnir-field {...props}/>;
}

export function FieldName(props: PropsWithChildren<"field-name">) {
  return <gungnir-field-name {...props}/>;
}

export function FieldValue(props: PropsWithChildren<"field-value">) {
  return <gungnir-field-value {...props}/>;
}

export function File(props: PropsWithChildren<"file">) {
  return <gungnir-file {...props}/>;
}

export function Footer(props: PropsWithChildren<"footer">) {
  return <gungnir-footer {...props}/>;
}

export function Image(props: PropsWithChildren<"image">) {
  return <gungnir-image {...props}/>;
}

export function Message(props: PropsWithChildren<"message">) {
  return <gungnir-message {...props}/>;
}

export function Reaction(props: PropsWithChildren<"reaction"> & {onClick?(user: User): void, onAdd?(user: User): void, onRemove?(user: User): void}) {
  const msg = useThisMessage();

  const emoji = props.emoji;
  const createEvent = useCallback((msg: DiscordMessage, event: (user: User) => void) => async (msgReaction: MessageReaction, user: User | PartialUser) => {
    if (user.partial) user = await msg.client.users.fetch(user.id);
    if (msgReaction.emoji.name != emoji) return;
    event(user);
  }, [emoji]);

  useEffect(() => {
    if (!msg || !props.onClick) return;
    const event = createEvent(msg, props.onClick);
    msg.client.on("messageReactionAdd", event);
    msg.client.on("messageReactionRemove", event);
    return () => {
      msg.client.off("messageReactionAdd", event);
      msg.client.off("messageReactionRemove", event);
    };
  }, [msg, props.onClick]);

  useEffect(() => {
    if (!msg || !props.onAdd) return;
    const event = createEvent(msg, props.onAdd);
    msg.client.on("messageReactionAdd", event);
    return () => void msg.client.off("messageReactionAdd", event);
  }, [msg, props.onAdd]);

  useEffect(() => {
    if (!msg || !props.onRemove) return;
    const event = createEvent(msg, props.onRemove);
    msg.client.on("messageReactionRemove", event);
    return () => void msg.client.off("messageReactionRemove", event);
  }, [msg, props.onRemove]);

  return <gungnir-reaction emoji={props.emoji}/>;
}

export function Thumbnail(props: PropsWithChildren<"thumbnail">) {
  return <gungnir-thumbnail {...props}/>;
}

export function Timestamp(props: PropsWithChildren<"timestamp">) {
  return <gungnir-timestamp {...props}/>;
}

export function Title(props: PropsWithChildren<"title">) {
  return <gungnir-title {...props}/>;
}

// logic components

export function If(props: {condition: boolean, children: Elements}) {
  return props.condition ? <>props.children</> : null;
}

export function IfElse(props: {condition: boolean, children: [If: JSX.Element, Else: JSX.Element]}) {
  return props.condition ? props.children[0] : props.children[1];
}

export function While(props: {condition(): boolean, children: Elements}) {
  const fields: JSX.Element[] = [];
  let i = 0;
  while (props.condition())
    fields.push(<Fragment key={i++}>{props.children}</Fragment>);
  return <>{fields}</>;
}

export function ForEach<T>(props: {for: Iterable<T>, key?(value: T): number, each(value: T): JSX.Element | null}) {
  const fields: JSX.Element[] = [];
  if (props.key) for (const value of props.for) {
    fields.push(<Fragment key={props.key(value)}>{props.each(value)}</Fragment>);
  } else {
    let i = 0;
    for (const value of props.for)
      fields.push(<Fragment key={i++}>{props.each(value)}</Fragment>);
  }
  return <>{fields}</>;
}

export function ForRange(props: {range: [min: number, max: number, incr?: number], each(i: number): JSX.Element | null}) {
  const fields: JSX.Element[] = [];
  for (let i = props.range[0]; i < props.range[1]; i += props.range[2] ?? 1)
    fields.push(<Fragment key={i}>{props.each(i)}</Fragment>);
  return <>{fields}</>;
}

export function Repeat(props: {for: number, children: Elements}) {
  const fields: JSX.Element[] = [];
  for (let i = 0; i < props.for; i++)
    fields.push(<Fragment key={i}>{props.children}</Fragment>);
  return <>{fields}</>;
}

// misc components

export function ProgressBar(props: {name: string, percentage: number, length?: number, inline?: boolean}) {
  let bar = "";
  const length = props.length ?? 20;
  const size = Math.round(props.percentage*length); 
  for (let i = 0; i < length; i++) bar += i < size ? "■" : "□";
  return (
    <Field inline={props.inline}>
      <FieldName>{props.name}</FieldName>
      <FieldValue>[{bar}]</FieldValue>
    </Field>
  );
}