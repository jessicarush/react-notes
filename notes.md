# React

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Why React](#why-react)
- [Design Decisions](#design-decisions)

<!-- tocstop -->

## Introduction

React is often called a framework but it is actually more of a library. A framework is generally an "all in one" system where you model your project, files and code to what the framework requires. React, in its most basic form is just a "component-building library". The idea is that you focus on building individual components, then put those together to build a full app.

There are a tonne of additional (optional) react-specific tools that you can choose from, e.g. *react-router*, *redux*, *enzyme*, *create-react-app*, etc. Once you start pulling all these tools together, it starts to resemble a framework.


## Why React

In the past, web developers turned to libraries like jQuery to manage the various browsers implementing DOM things slightly differently. As websites evolved into bigger and bigger web applications the focus shifted away from separate HTMl pages and more heavily on JavaScript. The application would load all at the front (like a desktop app) and instead of making new HTML page requests, the web app would use JavaScript to update the page content with new content. This led to the rise of single-page-applications and web frameworks like AngularJS where JavaScript code was organized into "containers" like controllers, views and models. Organizing code into these logical sections made projects easier to work on in Teams.

The downside to all this was complexity. Despite these frameworks organization, data was flowing everywhere and bugs became harder to find. It became harder to understand how each part of the app was affecting another. As a result, in 2013-2014 AngularJS realized they need to re-structure their library (Angular), At the same time React came out so many AngularJS devs moved over to React.

In terms of DOM manipulation, React takes a *declarative* as opposed to *imperative* approach. Specifically, it uses *state* to do this and results in less complexity, better code quality. Some key React concepts:

- Don't manipulate the DOM directly, React will handle it (using its VirtualDOM)
- Build websites/apps like lego blocks (components)
- Uni-directional data flow (events trigger > state change triggers > Components change and DOM change)
- React is just the UI, the rest is up to you (its a library not an opinionated framework)


## Design Decisions

When building a React app, the key design decisions will be:

- Deciding what components to build (what should be a component)
- Deciding on state and where the state should be defined
- What changes when state changes
