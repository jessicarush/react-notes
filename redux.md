# Redux

Redux is an open-source library for managing and centralizing state in a JavaScript app (most commonly used with React or Angular). It provides a way for all of your components to work and communicate with a centralized store of all your state values and logic.

Some of Redux's functionality can be replicated/replaced with the `useContext` and `useReducer` hooks. Many people are switching over to the Context hook as Redux tends to be verbose, difficult to pick up and introduces more complexity. See [context.md](context.md).

That being said, Redux and useContext + useReducer are different tools, intended to solve different problems. One of the maintainers of Redux explains it in [this reddit post](https://www.reddit.com/r/reactjs/comments/squatd/should_we_be_teaching_redux_in_2022/). They say:

> Context is not a "state management" tool. It's a Dependency Injection mechanism, whose only purpose is to make a single value accessible to a nested tree of React components. It's up to you to decide what that value is, and how it's created. Typically, that's done using data from React component state, ie, useState and useReducer. So, you're actually doing all the "state management" yourself - Context just gives you a way to pass it down the tree.
>
> Redux is a library and a pattern for separating your state update logic from the rest of your app, and making it easy to trace when/where/why/how your state has changed. It also gives your whole app the ability to access any piece of state in any component.
>
> In addition, there are some distinct differences between how Context and (React-)Redux pass along updates. Context has some major perf limitations - in particular, any component that consumes a context will be forced to re-render, even if it only cares about part of the context value.

## Table of Contents

<!-- toc -->



<!-- tocstop -->

TODO...
