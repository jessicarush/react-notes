# React notes

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Why React](#why-react)
- [Design Decisions](#design-decisions)
- [React 18 notes](#react-18-notes)
- [Upgrade React in an existing create-react-app project](#upgrade-react-in-an-existing-create-react-app-project)
- [Learning Questions](#learning-questions)
  * [Are all React.js apps SPAs?](#are-all-reactjs-apps-spas)
  * [How would you integrate your React component or SPA into an existing website?](#how-would-you-integrate-your-react-component-or-spa-into-an-existing-website)
  * [Can I have flask serve the build created from create-react-app?](#can-i-have-flask-serve-the-build-created-from-create-react-app)
  * [Does the above still work with react-router stuff?](#does-the-above-still-work-with-react-router-stuff)
  * [Can I demonstrate working with a database via a Flask API backend and React frontend?](#can-i-demonstrate-working-with-a-database-via-a-flask-api-backend-and-react-frontend)
  * [What are the most common solutions for database/backend with React? Is there a solution built-in to Next.js?](#what-are-the-most-common-solutions-for-databasebackend-with-react-is-there-a-solution-built-in-to-nextjs)
  * [How do I handle authentication (logins) using Flask backend?](#how-do-i-handle-authentication-logins-using-flask-backend)
  * [What is the common solution for handling auth in React? Is there a solution built-in to Next.js?](#what-is-the-common-solution-for-handling-auth-in-react-is-there-a-solution-built-in-to-nextjs)
  * [Demonstrate email from React to Flask](#demonstrate-email-from-react-to-flask)
  * [What is the common solution for handling email in React? Is there a solution built-in to Next.js?](#what-is-the-common-solution-for-handling-email-in-react-is-there-a-solution-built-in-to-nextjs)
  * [Can I do socket.io between Flask and React?](#can-i-do-socketio-between-flask-and-react)
  * [If building a flask backend and react frontend, how are these two seemingly independent things deployed/served?](#if-building-a-flask-backend-and-react-frontend-how-are-these-two-seemingly-independent-things-deployedserved)
  * [Would a digitalocean PaaS be more appropriate/easier than a droplet? Would it allow for the Flask backend too?](#would-a-digitalocean-paas-be-more-appropriateeasier-than-a-droplet-would-it-allow-for-the-flask-backend-too)
  * [What exactly is the deal with Firebase? Is it worth learning?](#what-exactly-is-the-deal-with-firebase-is-it-worth-learning)
  * [What exactly is the deal with GraphQL? Is it worth learning?](#what-exactly-is-the-deal-with-graphql-is-it-worth-learning)
  * [What else do I need to know about Next.js? Do the tutorial.](#what-else-do-i-need-to-know-about-nextjs-do-the-tutorial)
  * [How to learn more about end to end testing? Is Cypress the best tool?](#how-to-learn-more-about-end-to-end-testing-is-cypress-the-best-tool)

<!-- tocstop -->

## Introduction

React is often called a framework but it is actually more of a library. A framework is generally an "all in one" system where you model your project, files and code to what the framework requires. React, in its most basic form is just a "component-building library". The idea is that you focus on building individual components, then put those together to build a full app.

There are a tonne of additional (optional) react-specific tools that you can choose from, e.g. *react-router*, *redux*, *enzyme*, etc. Once you start pulling all these tools together, it starts to resemble a framework.

> :star: March 22, 2023 Update: With the release of the new React.dev docs, React devs say that React can be used in two ways:
>
>- as a library (used with a low-level build tool like Vite or Parcel)
>- as a framework architecture (used with a framework like Next.js or Remix)

In other words, React says it can be used to develop a component (say an internal dashboard) that will be integrated into an existing non-React site, or it can be used to build a full React app with Server side rendering and more using a framework like Next.js.

- See [How to start a React Project in 2023](https://www.robinwieruch.de/react-starter/)

## Why React

In the past, web developers turned to libraries like jQuery to manage the various browsers implementing DOM things slightly differently. As websites evolved into bigger and bigger web applications the focus shifted away from separate HTML pages and more heavily on JavaScript. The application would load all at the front (like a desktop app) and instead of making new HTML page requests, the web app would use JavaScript to update the page content with new content. This led to the rise of single-page-applications and web frameworks like AngularJS where JavaScript code was organized into "containers" like controllers, views and models. Organizing code into these logical sections made projects easier to work on in Teams.

The downside to all this was complexity. Despite these frameworks organization, data was flowing everywhere and bugs became harder to find. It became harder to understand how each part of the app was affecting another. As a result, in 2013-2014 AngularJS realized they need to re-structure their library. Around the same time, React came out; so many AngularJS devs moved over to React.

In terms of DOM manipulation, React takes a *declarative* as opposed to *imperative* approach. Specifically, it uses *state* to do this and results in less complexity and overall better code quality. Some key React concepts:

- Don't manipulate the DOM directly, React will handle it (using its VirtualDOM)
- Build websites/apps like lego blocks (components)
- Uni-directional data flow (events trigger > state change triggers > Components change and DOM change)
- React is just the UI, the rest is up to you (it's a library not an opinionated framework)


## Design Decisions

When building a React app, the key design decisions will be:

- Deciding what components to build (what should be a component)
- Deciding on state and where the state should be defined
- What changes when state changes

This article: [Tao of React - Software Design, Architecture & Best Practices](https://alexkondov.com/tao-of-react/) lists some really great, practical, suggestions for designing and building your React app.

This article: [Bad Habits of Mid-Level React Developers](https://dev.to/srmagura/bad-habits-of-mid-level-react-developers-b41) is slightly more opinionated but still has some useful suggestions.


## React 18 notes 

There is a new way to render your app using `createRoot` which is from `react-dom/client`. 

Note that in strict dev mode, react calls some of the code twice. This will result in double console logs and API calls. It is a mechanism to help you verify that you have implemented proper "cleanup" if needed. See: [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed).

This behaviour won't happen in the production build. You can disable strict mode temporarily to turn it off.


```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```


## Upgrade React in an existing create-react-app project

The [create-react-app docs](https://create-react-app.dev/docs/updating-to-new-releases) states:

> To update an existing project to a new version of react-scripts, open the [changelog](https://github.com/facebook/create-react-app/blob/main/CHANGELOG.md), find the version you’re currently on (check package.json in this folder if you’re not sure), and apply the migration instructions for the newer versions.

In most cases bumping the react-scripts version in package.json and running npm install (or yarn install) in this folder should be enough, but it’s good to consult the changelog for potential breaking changes.

> :warning: March 22, 2023 Update: Since CRA is dead atm, you should [migrate to Vite](https://cathalmacdonnacha.com/migrating-from-create-react-app-cra-to-vite). Eventually, CRA will be morphed into a launcher where you will be able to choose your framework or build-tool.


## Learning Questions

### Are all React.js apps SPAs?

From the [React Docs](https://reactjs.org/docs/glossary.html):

> Though you may build a single-page application in React, it is not a requirement. React can also be used for enhancing small parts of existing websites with additional interactivity. Code written in React can coexist peacefully with markup rendered on the server by something like PHP, or with other client-side libraries. In fact, this is exactly how React is being used at Facebook.

### How would you integrate your React component or SPA into an existing website?

See the React docs: <https://reactjs.org/docs/add-react-to-a-website.html>

My summary notes are here: [react_with_existing_html.md](react_with_existing_html.md). I'm assuming you could have nested components, you would just need to src them in the right order. You would also need to add `type=module` to the component `<script>` tags (assuming we're using import/export). 

That being said, with this very simplistic approach, you wouldn't get to import css files or any other node packages into your components. Overall, not very useful. 

It seems to me that if you really needed to embed a react project into and existing website, the best approach would still be to use create-react-app or webpack. 

With create-react-app, we can use the `npm run build` command and serve all the static files it creates. This is explained step-by-step in the second half of [react_with_existing_html.md](react_with_existing_html.md).


### Can I have flask serve the build created from create-react-app?

Yes. This is pretty straightforward, see: [react_served_by_flask.md](react_served_by_flask.md).


### Does the above still work with react-router stuff?

Yes. It just works. See my notes in [react_served_by_flask.md](react_served_by_flask.md).

### Can I demonstrate working with a database via a Flask API backend and React frontend?

Yes. See [react_with_flask_api.md](react_with_flask_api.md).

### What are the most common solutions for database/backend with React? Is there a solution built-in to Next.js?

There's a number of different approaches you can take:

1. No backend - You can apparently use Next.js and Gatsby to do things like store posts as markdown files and load them in or store product data in json files and load that.

2. Use a BaaS (backend as a service) - For people who find managing a database and building a complete API to interact with that database is a daunting challenge. Firebase is an example... in includes authentication strategies and NoSql databases.

3. Build out your own backend - apparently Next.js has some API tools. Backend technologies frequently mentioned are Node.js, ExpressJS (or Node.js+ExpressJS), Django, Rails.

Side note: monorepos? turborepo.org 

Also mentioned: (FastApi a python web server)

### How do I handle authentication (logins) using Flask backend?

- [flask-praetorian](https://flask-praetorian.readthedocs.io/en/latest/)
- see <https://yasoob.me/posts/how-to-setup-and-deploy-jwt-auth-using-react-and-flask/> 

- see <https://blog.miguelgrinberg.com/post/how-to-create-a-react--flask-project> and <https://blog.miguelgrinberg.com/post/how-to-deploy-a-react--flask-project>

- [flask-security](https://flask-security-too.readthedocs.io/en/stable/)

### What is the common solution for handling auth in React? Is there a solution built-in to Next.js?

- react-router can be used to restrict access to routes to authenticated users <https://github.com/remix-run/react-router/tree/dev/examples/auth>
- Firebase BaaS has some pre-built options
- Supabase (open source Firebase alternative.)
- ExpressJS can be used <https://blog.logrocket.com/how-to-secure-react-app-login-authentication/>
- use an authentication service like Auth0 (I read it can get expensive)


### Demonstrate email from React to Flask

TODO...

### What is the common solution for handling email in React? Is there a solution built-in to Next.js?

TODO...

### Can I do socket.io between Flask and React?

TODO...

### If building a flask backend and react frontend, how are these two seemingly independent things deployed/served? 

The two things are the *web server* which serves the React SPA and the *application server* which serves all the JSON data through APIs.

What is the actual nginx setup? Do the two get to use the same domain name? What does the proxy line in the package.json have to say? Is it just that they're running on different ports? So nginx would serve the frontend port and the package.json proxy would point to the backend port?

### Would a digitalocean PaaS be more appropriate/easier than a droplet? Would it allow for the Flask backend too?

TODO...

### What exactly is the deal with Firebase? Is it worth learning? 

TODO...

Firebase is a platform developed by Google for creating mobile and web applications. It was originally an independent company founded in 2011 and acquired by Google in 2014.

Firebase is considered a *Backend-as-a-Service* (BaaS). It offers a database, authentication and authorization as a backend out of the box. The frontend interacts with Firebase via APIs. Most BaaS, including Firebase, also offer hosting.

### What exactly is the deal with GraphQL? Is it worth learning?

TODO...

### What else do I need to know about Next.js? Do the tutorial.

TODO...

Does Next.js produce separate pages when using /pages? 
Using <Link> makes it like an SPA, but what would I do if I wanted it to link like separate pages?

### How to learn more about end to end testing? Is Cypress the best tool?

TODO...