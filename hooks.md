# Hooks in function components

- [Introduction to hooks](https://reactjs.org/docs/hooks-intro.html)
- [Built-in hooks](https://reactjs.org/docs/hooks-reference.html)
- [Rules for hooks](https://reactjs.org/docs/hooks-rules.html)
- [State hooks](https://reactjs.org/docs/hooks-state.html)


## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Rules](#rules)

<!-- tocstop -->

## Introduction

In React, there are basic built-in hooks:

- `useState` for creating stateful values as previously done with `this.state`
- `useEffect` for replicating lifecycle behavior
- `useContext` for creating common data that can be accessed throughout the component hierarchy without passing the props down manually to each level

Additional built-in hooks:

- `useReducer`
- `useCallback`
- `useMemo`
- `useRef`
- `useImperativeHandle`
- `useLayoutEffect`
- `useDebugValue`


## Rules

1. Only call Hooks at the top level. Don’t call Hooks inside loops, conditions, or nested functions.

> Don’t call Hooks inside loops, conditions, or nested functions. Instead, always use Hooks at the top level of your React function, before any early returns. By following this rule, you ensure that Hooks are called in the same order each time a component renders. That’s what allows React to correctly preserve the state of Hooks between multiple useState and useEffect calls.

2. Only call Hooks from React function components. Don’t call Hooks from regular JavaScript functions.

> Call Hooks from React function components or call Hooks from custom Hooks. By following this rule, you ensure that all stateful logic in a component is clearly visible from its source code.