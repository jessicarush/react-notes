# React App Layout (Barebones)

## Table of Contents

<!-- toc -->

- [1. Place components in separate files](#1-place-components-in-separate-files)
- [2. Create a top level component called App](#2-create-a-top-level-component-called-app)
- [3. Render your App in an index.js](#3-render-your-app-in-an-indexjs)
- [4. Create an element to hold your rendered react app in your html](#4-create-an-element-to-hold-your-rendered-react-app-in-your-html)
- [5. Add all the component scripts to your html](#5-add-all-the-component-scripts-to-your-html)
- [6. Run your app on a server](#6-run-your-app-on-a-server)
- [Final note](#final-note)

<!-- tocstop -->

## 1. Place components in separate files

Usually you'll have many components. Standard practice is that each should be in their own file.

*welcome.js*

```javascript
class Welcome extends React.Component {
  render() {
    return (
      <div>
        <p>Hello...</p>
      </div>
    );
  }
}
```


## 2. Create a top level component called App

This will be where we bring together all the other components. This will be the one thing we render into the DOM.

*app.js*

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        <Welcome />
        <AnotherComponent />
      </div>
    );
  }
}
```

## 3. Render your App in an index.js

*index.js*

```javascript
ReactDOM.render(<App />, document.getElementById('root'));
```

## 4. Create an element to hold your rendered react app in your html

*index.html*

```html
<div id="root"> <!-- react app will render here --> </div>
```

## 5. Add all the component scripts to your html

*index.html*

```html
  <!-- React -->
  <script src="https://unpkg.com/react/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>

  <!-- Babel transpiles our JSX syntax into valid JavaScript -->
  <script src="https://unpkg.com/babel-standalone"></script>

  <!-- Our components (order is important!)-->
  <script src="js/welcome.js" type="text/jsx"></script>
  <script src="js/app.js" type="text/jsx"></script>
  <script src="js/index.js" type="text/jsx"></script>

</body>
```

Note: The React Docs do it a little different:

```html
  <!-- ... other HTML ... -->

  <!-- Load React -->
  <!-- Note: when deploying, replace "development.js" with "production.min.js". -->
  <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>

  <!-- Load Babel to transpile JSX -->
  <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

  <!-- Load our React components -->
  <script src="like_button.js" type="text/babel"></script>
</body>
```


**Tip: Minify JavaScript for Production**

Before deploying your website to production, be mindful that unminified JavaScript can significantly slow down the page for your users.

```html
<script src="https://unpkg.com/react@17/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js" crossorigin></script>
```

## 6. Run your app on a server

If you try to open your `index.html`, you'll have issues because of the [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) stuff. Instead, navigate to the directory and run it on a python server:

```bash
python3 -m http.server
```

## Final note

Though we can create a react app using this barebones structure, most of the time it will make more sense to use `create-react-app`. See [create_react_app.md](create_react_app.md).