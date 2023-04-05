# flushSync

Call `flushSync` to force React to flush any pending work and update the DOM synchronously.

## Table of Contents

<!-- toc -->

## Example 

In this example we want to add a new list item then scroll that item into view. Without `flushSync`
the item that was just added would not be registered as the `lastChild` of the list. 

```javascript
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

export default function TodoList() {
  const listRef = useRef(null);
  const [text, setText] = useState('');
  const [todos, setTodos] = useState(initialTodos);

  function handleAdd() {
    const newTodo = { id: nextId++, text: text };
    flushSync(() => {
      setText('');
      setTodos([ ...todos, newTodo]);
    });
    listRef.current.lastChild.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }

  return (
    <>
      <button onClick={handleAdd}>Add</button>
      <input value={text} onChange={e => setText(e.target.value)}/>
      <ul ref={listRef}>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </>
  );
}

// Add a bunch of starter todos so we can see the scrolling
let nextId = 0;
let initialTodos = [];
for (let i = 0; i < 20; i++) {
  initialTodos.push({
    id: nextId++,
    text: 'Todo #' + (i + 1)
  });
}
```

## Resources

- [flushSync API reference](https://react.dev/reference/react-dom/flushSync#reference)
- [Flushing state updates synchronously with flushSync](https://react.dev/learn/manipulating-the-dom-with-refs#flushing-state-updates-synchronously-with-flush-sync)