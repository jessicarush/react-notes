# Add a React to Existing HTML

Typically we would want to create a standalone SPA using `create-react-app`, but what options do we have if we want to include our React project into an existing html doc?

The first example here come from the React docs, but I fail to see how this can be used for anything beyond a simple component.

The second example comes from various searches so I'm not certain of its reliability.

## Table of Contents

<!-- toc -->


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
 
Create a folder called `src` in the directory where your js files. In my case, I use a folder called `js`. Then run the following command:

```bash
npx babel --watch js/src --out-dir ./js --presets react-app/prod
```

This means babel is now watching the directory `js/src`. Any files saved or modified in there will be processed and saved to `js`. If you like you could output to a `build` folder instead, just remember the components `script src` is pointing to the processed js file.

### 4: Create a React Component 

Create a component and save it into the `js/src` directory 

```javascript
function LikeButton() {
  const [like, setLike] = React.useState(false);

  return (
    <div className="Example">
      <button onClick={() => setLike(true)}>Like</button>
      <p>{like ? 'Woot! you like' : 'Meh. you no like'}</p>
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

You should npw be able to see your component by serving the html (e.g. `python -m http.server`).

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

But this type of import is a node_modules thing... then we need webpack and babel, so we might as well go the [create-react-app](create_react_app.md) route. 


## Add a create-react-app build

### 1. Add a DOM Container to the HTML

```javascript
<div id="react_todo"></div>
```

### 2. Update `index.js` with the new container id

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<App />, document.getElementById('react_todo'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
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

Now you need to link the css stylesheet and and the three scripts (leave the .map files).

```html 
    <!-- Stylesheet -->
    <link href="./react_build/css/main.4be25687.chunk.css" rel="stylesheet">
  </head>

  <body>

    <h1>Add a cra build to existing html</h1>

    <div id="react_todo"></div>

    <!-- JavaScript -->
    <script src="./react_build/js/runtime-main.86297d73.js"></script>
    <script src="./react_build/js/2.450ae4ea.chunk.js"></script>
    <script src="./react_build/js/main.58438f3a.chunk.js"></script>

  </body>
</html>
```

Order matters here. 

1. js/runtime-main.[hash].js
2. js/[number].[hash].chunk.js
3. js/main.[hash].chunk.js

With that you should be able to serve the html and see your app embedded. Note there will be a couple console warnings, one about the service worker that I haven't bothered to look into yet and another related to security.

For an explanation of these files see: <https://create-react-app.dev/docs/production-build/>


## Build your own Webpack configuration 


TODO...

<https://webpack.js.org/concepts/>
<https://github.com/mattcarlotta/cra-single-bundle/blob/master/config/webpack.config.js>
