# Gungnir React (WIP) <!-- omit in toc -->

A custom React renderer to easily create responses using Gungnir.

## Install

```
npm install @gungnir/react
```

## Usage

```jsx
import { Message, Embed, Field, FieldName, FieldValue, Reaction } from "@gungnir/react";
import { useState, useCallback } from "react";
import { Command } from "@gungnir/core";

function Counter() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => setCount(count => count+1), []);
  const decrement = useCallback(() => setCount(count => count-1), []);

  return <>
    <Message>Counting!</Message>
    <Embed>
      <Field>
        <FieldName>Current count</FieldName>
        <FieldValue>{count}</FieldValue>
      </Field>
    </Embed>
    <Reaction emoji="⬅️" onClick={decrement}/>
    <Reaction emoji="➡️" onClick={increment}/>
  </>;
}

@Command.define("counter")
export class CounterCommand extends Command {
  public run(ctx: Command.Context) {
    return ctx.jsx(<Counter/>);
  }
}
```

## Contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [Components](#components)
  - [`<Message>`](#message)
  - [`<Reaction>`](#reaction)
  - [`<Embed>`](#embed)
    - [`<Author>`](#author)
    - [`<Thumbnail>`](#thumbnail)
    - [`<Title>`](#title)
    - [`<Description>`](#description)
    - [`<Field>`](#field)
    - [`<Image>`](#image)
    - [`<Footer>`](#footer)
    - [`<Timestamp>`](#timestamp)
    - [`<File>`](#file)
- [Hooks](#hooks)
  - [`useTimeout`](#usetimeout)
  - [`useInterval`](#useinterval)
  - [`useTemporaryEffect`](#usetemporaryeffect)
  - [`useUser`](#useuser)
  - [`useGuild`](#useguild)
  - [`useGuildMember`](#useguildmember)
  - [`useChannel`](#usechannel)
  - [`useClient`](#useclient)
  - [`useThisChannel`](#usethischannel)
  - [`useThisGuild`](#usethisguild)
  - [`useThisMessage`](#usethismessage)

## Components

### `<Message>`

Simplest component, simply returns a Message.
```jsx
const message = await ctx.jsx(<Message>This is my message</Message>);
console.log(message.content); // "This is my message"
```

### `<Reaction>`
Appends a reaction to a message, can also listen to the `onClick`, `onAdd` and `onRemove` events.\
See the [counter example](#usage).

### `<Embed>`

This component is used to return an embed.
```jsx
<Embed color="669900"></Embed>
```

#### `<Author>`

Set the author field in an embed.
```jsx
<Embed>
  <Author iconURL="iconURL" url="url">I am the author</Author>
</Embed>
```

#### `<Thumbnail>`

Set the thumbnail of an embed. (top right image)
```jsx
<Embed>
  <Thumbnail url="url"/>
</Embed>
```

#### `<Title>`

Set the description field in an embed.
```jsx
<Embed>
  <Title url="url">I am the author</Title>
</Embed>
```

#### `<Description>`

Set the description field in an embed.
```jsx
<Embed>
  <Description>Embed description</Description>
</Embed>
```

#### `<Field>`

Add a field to the embed.
```jsx
<Embed>
  <Field inline>
    <FieldName>Field name</FieldName>
    <FieldValue>Field value</FieldValue>
  </Field>
</Embed>
```

#### `<Image>`

Set the image of an embed (bottom)
```jsx
<Embed>
  <Image url="url"/>
</Embed>
```

#### `<Footer>`

Attach a file to the embed.
```jsx
<Embed>
  <Footer iconURL="iconURL">Footer field</Footer>
</Embed>
```

#### `<Timestamp>`

Set the timestamp field in an embed.
```jsx
<Embed>
  <Timestamp time="1619189218000"/>
</Embed>
```

#### `<File>`

Attach a file to the embed.
```jsx
<Embed>
  <File file="file"></File>
</Embed>
```

## Hooks

### `useTimeout`

Creates a timeout that cancels itself when the component is unmounted. 3rd arg is a dependency list.
```ts
useTimeout(() => {
  console.log("1 second timeout");
}, 1000, []);
```

### `useInterval`

Works the same way as [`useTimeout`](#usetimeout), but using an interval instead.
```ts
useInterval(() => {
  console.log("1 second interval");
}, 1000, []);
```

### `useTemporaryEffect`

Creates an effect that is disabled after the specified duration.\
Using a negative duration never disables the effect.
```ts
useTemporaryEffect(10000, () => {
  // this effect will be disabled after 10 seconds
  return () => {};
}, []);
```

### `useUser`

Rerenders the component when the user passed as a parameter is updated.\
Disables itself after the specified duration.
```jsx
function UserAvatar(props: {user: User}) {
  useUser(props.user, 300000); // will disable itself after 5 minutes
  
  const avatarURL = props.user.displayAvatarURL({
    format: "png",
    size: 4096,
    dynamic: true
  });

  return <Image url={avatarURL}/>;
}
```

### `useGuild`
See [`useUser`](#useuser).

### `useGuildMember`
See [`useUser`](#useuser).

### `useChannel`
See [`useUser`](#useuser).

### `useClient`
Returns the client.
```jsx
function CustomEmbed(props: {children: Elements}) {
  const client = useClient();

  const avatarURL = client.user.displayAvatarURL({
    format: "png",
    dynamic: true
  });

  return (
    <Embed>
      <>{props.children}</>
      <Footer iconURL={avatarURL}>client.user.username</Footer>
    </Embed>
  )
}
```
### `useThisChannel`
Returns the channel where the message is posted.

### `useThisGuild`
Returns the guild where the channel is posted.

### `useThisMessage`
Rerenders the component once the message has been posted.
```jsx
function Ping() {
  const msg = useThisMessage() // Message | null;
  const now = useRef(Date.now()).current;
  
  if (msg) {
    return <Message>Pong! ({Date.now() - now}ms)</Message>;
  } else {
    return <Message>Pong!</Message>;
  }
}