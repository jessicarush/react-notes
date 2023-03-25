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