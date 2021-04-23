import { Message, Reaction } from "./components";
import { useCallback, useState } from "react";
import { render } from "./index";
import { useTimeout } from "./hooks";

function Counter() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => setCount(count => count+1), []);
  const decrement = useCallback(() => setCount(count => count-1), []);

  useTimeout(increment, 1000);

  return <>
    <Message>Current count: {count}</Message>
    <Reaction emoji="⬅️" onClick={decrement}/>
    <Reaction emoji="➡️" onClick={increment}/>
  </>;
}

const res = render(<Counter/>);
console.log("======================");
console.dir(res, {depth: 15});
res.onChange(() => {
  console.log("-------------------");
  console.dir(res, {depth: 15});
});