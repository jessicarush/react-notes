# Performance notes 

Various notes related to performance.

## Table of Contents

<!-- toc -->

- [cache results of expensive calculations](#cache-results-of-expensive-calculations)
- [measuring if a calculation is slow](#measuring-if-a-calculation-is-slow)

<!-- tocstop -->

## cache results of expensive calculations

The [useMemo](https://react.dev/reference/react/useMemo) hook lets you cache the result of a calculation between re-renders. See [hooks.md](hookd.md).


## measuring if a calculation is slow 

```javascript
console.time('filter array');
const visibleTodos = getFilteredTodos(todos, filter);
console.timeEnd('filter array');
```

> Perform the interaction you’re measuring (for example, typing into the input). You will then see logs like filter array: 0.15ms in your console. If the overall logged time adds up to a significant amount (say, 1ms or more), it might make sense to memoize that calculation. As an experiment, you can then wrap the calculation in useMemo to verify whether the total logged time has decreased for that interaction or not. [Source](https://react.dev/learn/you-might-not-need-an-effect#how-to-tell-if-a-calculation-is-expensive)