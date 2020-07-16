# Application Layout

## Table of Contents

<!-- toc -->

- [1. Place components in separate files](#1-place-components-in-separate-files)
- [2. Create a top level component called App](#2-create-a-top-level-component-called-app)
- [3. Render your App in an index.js](#3-render-your-app-in-an-indexjs)
- [4. Create an element to hold your rendered react app in your html](#4-create-an-element-to-hold-your-rendered-react-app-in-your-html)
- [5. Add all the component scripts to your html](#5-add-all-the-component-scripts-to-your-html)
- [5. Run your app on a server](#5-run-your-app-on-a-server)

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
<div id="root">
  <!-- react app will go here will go in this div -->
</div>
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

## 5. Run your app on a server

If you try to open your `index.html`, you'll have issues because of the [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) stuff. Instead, navigate to the directory and run it on a python server:

```bash
python3 -m http.server
```
