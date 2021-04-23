# Gungnir React

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

## Components

- [Gungnir React](#gungnir-react)
  - [Install](#install)
  - [Usage](#usage)
  - [Components](#components)
    - [`<Message>`](#message)
    - [`<Embed>`](#embed)

### `<Message>`

Simplest component, simply returns a Message.
```jsx
const message = await ctx.jsx(<Message>This is my message</Message>);
console.log(message.content); // "This is my message"
```

### `<Embed>`

This component is used to return an embed.
```jsx
<Embed color="669900">
  <Author>I am the author hello!</Author>
  <Field>
    <FieldName>Field name</FieldName>
    <FieldVale>Field name</FieldVale>
  </Field>
</Embed>
```