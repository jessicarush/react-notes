# Add React to Existing HTML

> :warning: The React.dev docs have since updated their recommendations for this stuff. See <https://react.dev/learn/add-react-to-an-existing-project> for more up-to-date approaches. The content below has NOT been updated yet to reflect these new docs.
>
> One TLDR; from their docs is for when you want to [use React for an entire subroute of your existing website](https://react.dev/learn/add-react-to-an-existing-project#using-react-for-an-entire-subroute-of-your-existing-website). They say to:
>1. Build the React part of your app using a framework like Next.js
>2. Specify /some-app as the base path in your framework’s configuration
>3. Configure your server or a proxy so that all requests under /some-app/ are handled by your React app.
>
> Basically treat them as separate apps and use nginx to handle which one receieves which request.

Typically we would want to create a standalone app using `Vite.js` or `Next.js`, but what options do we have if we want to include our React project into an existing non-React project?

The first example here comes from the React docs, but I fail to see how this can be used for anything beyond a simple component. The second example comes from various searches so I'm not certain of its reliability.

## Table of Contents

<!-- toc -->

- [Add a simple component](#add-a-simple-component)
  * [1: Add a DOM Container to the HTML](#1-add-a-dom-container-to-the-html)
  * [2: Add the Scripts](#2-add-the-scripts)
  * [3. Set up a JSX Preprocessor](#3-set-up-a-jsx-preprocessor)
  * [4: Create a React Component](#4-create-a-react-component)
- [Add a create-react-app build](#add-a-create-react-app-build)
  * [1. Add a DOM Container to the HTML](#1-add-a-dom-container-to-the-html)
  * [2. Update `index.js` with the new container id](#2-update-indexjs-with-the-new-container-id)
  * [3. Add `"homepage": "."` to package.json](#3-add-homepage--to-packagejson)
  * [4. `npm run build`](#4-npm-run-build)

<!-- tocstop -->

## Add a simple component

This is a summary of the instructions found in the [official docs](https://reactjs.org/docs/add-react-to-a-website.html).

### 1: Add a DOM Container to the HTML

```javascript
<div id="react_component_container"></div>
```

### 2: Add the Scripts

```html
 <!-- ... other HTML ... -->

  <!-- Load React. -->
  <!-- Note: when deploying, replace "development.js" with "production.min.js". -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script> 
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <!-- Load our React component. -->
  <script src="js/react_component.js"></script>
</body>
```

### 3. Set up a JSX Preprocessor

In order to use JSX, we'll need babel to process our react component source files and covert them into plain JavaScript files. We'll use npm just to install babel, then run babel just like a preprocessor.

```bash
npm init -y 
npm install babel-cli@6 babel-preset-react-app@3
```
 
Create a folder called `src` in the directory where your js files are. In my case, I use a folder called `js`. Then run the following command:

```bash
npx babel --watch js/src --out-dir ./js --presets react-app/prod
```

This means babel is now watching the directory `js/src`. Any files saved or modified in there will be processed and saved to `js`. If you like you could output to a `build` folder instead, just remember the components `script src` is pointing to the processed js file.

### 4: Create a React Component 

Create a component and save it into the `js/src` directory 

```javascript
function LikeButton() {
  const [like, setLike] = React.useState(false);

  const toggleLike = () => {
    setLike(l => !l);
  };

  return (
    <div className="Example">
      <button onClick={toggleLike}>Like</button>
      <p>{like ? 'Like is true' : 'Like is false'}</p>
    </div>
  );
}

// React v17 API
// const container = document.getElementById('react_component_container');
// ReactDOM.render(<LikeButton />, container);

// React v18 API
const container = document.getElementById('react_component_container');
const root = ReactDOM.createRoot(container);
root.render(<LikeButton />);
```

You should now be able to see your component by serving the html (e.g. `python -m http.server`).

Note that the API for rendering has changed from React v17 to v18.

> Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot react-dom.development.js:73:32

> React 18 ships two root APIs, which we call the Legacy Root API and the New Root API.

> Legacy root API: This is the existing API called with ReactDOM.render. This creates a root running in “legacy” mode, which works exactly the same as React 17. Before release, we will add a warning to this API indicating that it’s deprecated and to switch to the New Root API.

> New root API: The new Root API is called with ReactDOM.createRoot. This creates a root running in React 18, which adds all of the improvements of React 18 and allows you to use concurrent features. This will be the root API moving forward.

As a side note, even if you do use the new root API, you will still get a warning:

> Warning: You are importing createRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".

So they actually want you to do this:

```javascript
import * as ReactDOMClient from 'react-dom/client';

const container = document.getElementById('root');
const root = ReactDOMClient.createRoot(container);
root.render(<App />);
```

But this type of import is a node_modules thing... then we need webpack and babel, so we might as well go the ~~[create-react-app](create_react_app.md)~~ [vitejs.md](vitej.md) route. 


## Add a create-react-app build

> :warning: have not yet looked into how to do this with Vite, only with CRA.

### 1. Add a DOM Container to the HTML

```javascript
<div id="react_todo"></div>
```

### 2. Update `index.js` with the new container id

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('react_todo'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

### 3. Add `"homepage": "."` to package.json 

```json 
{
  "name": "react_todo_app",
  "version": "0.1.0",
  "private": true,
  "homepage": ".",
  // ...
```

Note: This works differently if you have client-side routing. 

See <https://create-react-app.dev/docs/deployment/> for more information.

### 4. `npm run build`

After running this command, locate the build directory, then copy the static directory (which should contain css and js dirs) over to the destination websites root. I renamed the static folder "react_build". 

Now you need to link the css stylesheet and and the two scripts (leave the .map files).

```html
    <!-- ... -->
    <!-- Stylesheet -->
    <link href="./react_build/css/main.8afc6c12.css" rel="stylesheet">
  </head>

  <body>

    <h1>Add a cra build to existing html</h1>

    <div id="react_todo"></div>

    <!-- JavaScript -->
    <script src="./react_build/js/787.2be18bd2.chunk.js"></script>
    <script src="./react_build/js/main.def4e3de.js"></script>

  </body>
</html>
```

Order matters here. 

1. js/[number].[hash].chunk.js
2. js/main.[hash].js

With that you should be able to serve the html and see your app embedded. For an explanation of these files see: <https://create-react-app.dev/docs/production-build/>



