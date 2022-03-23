# React notes

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Why React](#why-react)
- [Design Decisions](#design-decisions)
- [Learning Questions](#learning-questions)
  * [Are all React.js apps SPAs?](#are-all-reactjs-apps-spas)
  * [How would you integrate your React component/SPA into an existing website?](#how-would-you-integrate-your-react-componentspa-into-an-existing-website)
  * [Can I have flask serve the build/index.html created from create-react-app?](#can-i-have-flask-serve-the-buildindexhtml-created-from-create-react-app)
  * [Does the above still work with react-router stuff?](#does-the-above-still-work-with-react-router-stuff)
  * [Does Next.js produce separate pages when using /pages?](#does-nextjs-produce-separate-pages-when-using-pages)
  * [Demonstrate working with Flask backed as an API for database stuff.](#demonstrate-working-with-flask-backed-as-an-api-for-database-stuff)
  * [What are the most common solutions for database with React? Is there a solution built-in to Next.js?](#what-are-the-most-common-solutions-for-database-with-react-is-there-a-solution-built-in-to-nextjs)
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

There are a tonne of additional (optional) react-specific tools that you can choose from, e.g. *react-router*, *redux*, *enzyme*, *create-react-app*, etc. Once you start pulling all these tools together, it starts to resemble a framework.


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


## Learning Questions

### Are all React.js apps SPAs?

From the [React Docs](https://reactjs.org/docs/glossary.html):

> Though you may build a single-page application in React, it is not a requirement. React can also be used for enhancing small parts of existing websites with additional interactivity. Code written in React can coexist peacefully with markup rendered on the server by something like PHP, or with other client-side libraries. In fact, this is exactly how React is being used at Facebook.

### How would you integrate your React component/SPA into an existing website?

See the React docs: <https://reactjs.org/docs/add-react-to-a-website.html>

TODO... create a demo of a component (with nested components) using their instructions for working with JSX.

### Can I have flask serve the build/index.html created from create-react-app?

Yes. You need to:

1. Copy all the files from inside the build directory (created from `npm run build`) and place them inside the static directory of the flask app.

2. Create a route the serves a static file from the static directory:

```python
@app.route('/test', methods=['GET', 'POST'])
def test():
    '''Test view function.'''
    return app.send_static_file('index.html')
```

3. Add `static_url_path=''` to the Flask app instance initialization:

```python
app = Flask(__name__, static_url_path='')
```

Alternatively, if you'd prefer to have the react build files in their own directory within the flask static dir, you could modify the package.json to have the following line:

```json
"homepage": "/static/react",
```

...where 'static' is the flask static dir and 'react' is the new dir that we'll dump the build files into. Adding this line ensures that the react app has the proper paths. See the [create-react-app docs](https://create-react-app.dev/docs/deployment/#building-for-relative-paths for better explanation. According to this doc, I may be able to use `"homepage": ".",` to have relative paths. Should test this.

When we do it this way, you don't need to add the `static_url_path=''`.

```python
app = Flask(__name__)
```

Finally, we would need to specify the new dir in our route path:

```python
@app.route('/test', methods=['GET', 'POST'])
def test():
    '''Test view function.'''
    return app.send_static_file('react/index.html')
```


### Does the above still work with react-router stuff?

TODO...
hashrouter?
<https://create-react-app.dev/docs/deployment/>

### Does Next.js produce separate pages when using /pages? 

TODO...
Using <Link> makes it like an SPA, but what would I do if I wanted it to link like separate pages?

### Demonstrate working with Flask backed as an API for database stuff.

TODO...

### What are the most common solutions for database with React? Is there a solution built-in to Next.js?

TODO...

### How do I handle authentication (logins) using Flask backend?

TODO...

### What is the common solution for handling auth in React? Is there a solution built-in to Next.js?

TODO...

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

### How to learn more about end to end testing? Is Cypress the best tool?

TODO...