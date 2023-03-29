# Reducer and context

See first:

- [useReducer.md](useReducer.md)
- [context.md](context.md)

## Table of Contents

<!-- toc -->

## Concept 

> Reducers let you consolidate a component’s state update logic. Context lets you pass information deep down to other components. You can combine reducers and context together to manage state of a complex screen.
>
> With this approach, a parent component with complex state manages it with a reducer. Other components anywhere deep in the tree can read its state via context. They can also dispatch actions to update that state. [Source](https://react.dev/learn/managing-state#scaling-up-with-reducer-and-context)

A reducer helps keep event handlers short and concise. However, the state and dispatch function are defined somewhere near the top. As your app grows you may find yourself explicitly passing these props down to other components deep in the tree (prop drilling). If it's just a few steps, no big deal, but if there's many, you may want to but both the state and dispatch function into context.

Here is how you can combine a reducer with context:

1. Create the context.
2. Put state and dispatch into context.
3. Use context anywhere in the tree.

Lets say you have a reducer:

```javascript
function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, initialTodos);
  //...
```

Create some new contexts:

```javascript
import { createContext } from "react";

const TodosContext = createContext(null);
const TodosDispatchContext = createContext(null);

export { TodosContext, TodosDispatchContext };
```

Then import the contexts and provide them to the rest of the apping passing the state and dispatch function as values:

```jsx
import { TodosContext, TodosDispatchContext } from './todoContext';

//...

function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, initialTodos);
  
  return (
    <TodosContext.Provider value={todos}>
      <TodosDispatchContext.Provider value={dispatch}>
        {/* ... */}
      </TodosDispatchContext.Provider>
    </TodosContext.Provider>
  );
}

export default TodoList;
```

Now you can remove any props and event handlers being passed doen through the tree. Instead, any component that needs it:

```javascript
import React, { useContext } from 'react';
import { TodosContext, TodosDispatchContext } from './todoContext';

const TodoForm = () => {
  const todos = useContext(TodosContext);
  const dispatch = useContext(TodosDispatchContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'add', todo: { task }});
  };

  //...
```

If you wanted, you could combine your reducer, useReducer and context into a single file as well as wrap the two providers into your own provider:

```javascript
import { useReducer, createContext } from "react";
import { v4 as uuid } from 'uuid';

const TodosContext = createContext(null);
const TodosDispatchContext = createContext(null);

function TodosProvider({children}) {
  const [todos, dispatch] = useReducer(todoReducer, initialTodos);

  return (
    <TodosContext.Provider value={todos}>
      <TodosDispatchContext.Provider value={dispatch}>
        {children}
      </TodosDispatchContext.Provider>
    </TodosContext.Provider>
  );
}

function todoReducer(todos, action) {
  //...
}

export { TodosContext, TodosDispatchContext, TodosProvider };
```

Then in the main App:

```jsx
import { TodosProvider } from './todoContext';
import TodoList from './TodoList';

function App() {
  return (
    <TodosProvider>
      <div className="App">
        {/* ... */}
      </div>
    </TodosProvider>
  );
}

export default App;
```

You could also create a function to make the context tidier to use:

```javascript
const TodosContext = createContext(null);
const TodosDispatchContext = createContext(null);

function useTodos() {
  return useContext(TodosContext);
}

function useTodosDispatch() {
  return useContext(TodosDispatchContext);
}
```

Then: 

```javascript
import { useTodos } from './todoContext';

function TodoList() {
  const todos = useTodos();
  
  return (
      {/* ... */}
  );
}

export default TodoList;
```

And..

```javascript
import { useTodosDispatch } from './todoContext';

const TodoForm = () => {
  const [task, setTask] = useState('');
  const dispatch = useTodosDispatch();
  //...
```

See examples/usereducer_demo and examples/usereducer_and_context for a before & after comparison.

