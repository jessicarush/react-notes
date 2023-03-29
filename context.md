# Context

Context provides a way to pass data through the component tree without having to pass props down manually at every level.

> In a typical React application, data is passed top-down (parent to child) via props, but such usage can be cumbersome for certain types of props (e.g. locale preference, UI theme) that are required by many components within an application. Context provides a way to share values like these between components without having to explicitly pass a prop through every level of the tree.

Context can be used with or without hooks.

See: 

- [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [useContext API Reference](https://react.dev/reference/react/useContext)
- [createContext API Reference](https://react.dev/reference/react/createContext)


## Table of Contents

<!-- toc -->

- [When to use context](#when-to-use-context)
- [In class components](#in-class-components)
- [In function components (UseContext hook)](#in-function-components-usecontext-hook)
- [useReducer](#usereducer)

<!-- tocstop -->

## When to use context

Context is designed to share data that can be considered *global* for a tree of React components, such as:

- theme data (e.g. dark or light mode)
- user data (the currently authenticated user)
- location-specific data (e.g. user language or locale)

Context is primarily used when some data needs to be accessible by many components at different nesting levels. Apply it sparingly because it makes component reuse more difficult.

If you only want to avoid passing some props through many levels, [component composition](https://reactjs.org/docs/context.html#when-to-use-context) is often a simpler solution than context.


## In class components

To define a context we'll need to create a new file.

**Tip:** Create a new directory called *contexts*, then create a javascript file in that directory for each context. For example: `ThemeContext.jsx`.

In this new file:

```javascript
import React, { Component, createContext } from 'react';

const ThemeContext = createContext();

class ThemeProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {isDarkMode: true};
  }
  render() {
    return (
      <ThemeContext.Provider value={{...this.state}}>
        {this.props.children}
      </ThemeContext.Provider>
    )
  }
}

export {ThemeContext, ThemeProvider};
```

Then in your main `App.js` you would import the provider and wrap it around all the components that will need access.

```javascript
// ...
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <PageContent>
          <Navbar />
          <Form />
        </PageContent>
      </ThemeProvider>
    </div>
  );
}

export default App;
```

In addition, for every component that you want to be able to access the context data, you'll need to import the Context and set the `Class.contextType`. There's two ways you can do this:

```javascript
// ...
import { ThemeContext } from './contexts/ThemeContext';

class Navbar extends Component {
  static contextType = ThemeContext;  // <-- here

  render() {
    return (
      <div className="Navbar">
        {/* ... */}
      </div>
    );
  }
}

export default Navbar;
```

or:

```javascript
// ...
import { ThemeContext } from './contexts/ThemeContext';

class Navbar extends Component {
  render() {
    return (
      <div className="Navbar">
        {/* ... */}
      </div>
    );
  }
}

Navbar.contextType = ThemeContext; // <-- here

export default Navbar;
```

You can now access the context data has been passed in by looking at `this.context`:

```javascript
// ...
import { ThemeContext } from './contexts/ThemeContext';

class Navbar extends Component {
  static contextType = ThemeContext;

  render() {
    console.log(this.context);   // <-- Object {isDarkMode: true}
    const { isDarkMode } = this.context;
    return (
      <div className="Navbar">
        {/* ... */}
      </div>
    );
  }
}

export default Navbar;
```

To be able to update a context, you'll need to create a method to update state in the Provider, then pass that method on to the value property:

```javascript
import React, { Component, createContext } from 'react';

const ThemeContext = createContext();

class ThemeProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {isDarkMode: true};
    this.toggleTheme = this.toggleTheme.bind(this);
  }
  toggleTheme() {
    this.setState({isDarkMode: !this.state.isDarkMode})
  }
  render() {
    return (
      <ThemeContext.Provider value={{...this.state, toggleTheme: this.toggleTheme}}>
        {this.props.children}
      </ThemeContext.Provider>
    )
  }
}

export {ThemeContext, ThemeProvider};
```

Then you can access it in the same way...

```javascript
// ...
import { ThemeContext } from './contexts/ThemeContext';

class Navbar extends Component {
  static contextType = ThemeContext;

  render() {
    const { isDarkMode, toggleTheme } = this.context;
    return (
      <div className="Navbar">
        {/* ... */}
        <Switch onChange={toggleTheme} />
      </div>
    );
  }
}

export default Navbar;
```

If you have more than one context that you want to use, for example:

```javascript
import React, { Component, createContext } from 'react';

const LanguageContext = createContext();

class LanguageProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {language: 'english'};
    this.setLanguage = this.setLanguage.bind(this);
  }
  setLanguage(e) {
    this.setState({language: e.target.value})
  }
  render() {
    return (
      <LanguageContext.Provider value={{...this.state, setLanguage: this.setLanguage}}>
        {this.props.children}
      </LanguageContext.Provider>
    )
  }
}

export {LanguageContext, LanguageProvider};
```

Then the `App.js` could look like:

```javascript
// ...
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <LanguageProvider>
          <PageContent>
            <Navbar />
            <Form />
          </PageContent>
        </LanguageProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
```

Things get tricky in the components though because you can only set `contextType` to one thing. We have to make a higher order component that creates another component with the context injected. Overall, IMO, this blows. I'd rather just pass props around. But here it is anyways...

```javascript
import React, { Component, createContext } from 'react';

const LanguageContext = createContext();

class LanguageProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {language: 'english'};
    this.setLanguage = this.setLanguage.bind(this);
  }
  setLanguage(e) {
    this.setState({language: e.target.value})
  }
  render() {
    return (
      <LanguageContext.Provider value={{...this.state, setLanguage: this.setLanguage}}>
        {this.props.children}
      </LanguageContext.Provider>
    )
  }
}

const withLanguageContext = (MyComponent) => (props) => (
  <LanguageContext.Consumer>
    {(value) => <MyComponent languageContext={value} {...props} />}
  </LanguageContext.Consumer>

);

export {LanguageProvider, withLanguageContext};
```

Then in my component...

```javascript
// ...
import { ThemeContext } from './contexts/ThemeContext';
import { withLanguageContext } from './contexts/LanguageContext';

class Navbar extends Component {
  static contextType = ThemeContext;

  render() {
    const { isDarkMode, toggleTheme } = this.context;
    const { language, setLanguage } = this.props.languageContext;
    return (
      <div className="Navbar">
        {/* ... */}
        <Switch onChange={toggleTheme} />
      </div>
    );
  }
}

export default withLanguageContext(Navbar);
```


## In function components (UseContext hook)

To create the context provider as a function:

```javascript
import React, { useState, createContext } from 'react';

const ThemeContext = createContext();

function ThemeProvider(props) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{isDarkMode, toggleTheme}}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export {ThemeContext, ThemeProvider};
```

And...

```javascript
import React, { useState, createContext } from 'react';

const LanguageContext = createContext();

function LanguageProvider(props) {
  const [language, setLanguage] = useState('english');
  const changeLanguage = (e) => setLanguage(e.target.value);

  return (
    <LanguageContext.Provider value={{language, changeLanguage}}>
      {props.children}
    </LanguageContext.Provider>
  )
}

export {LanguageContext, LanguageProvider};
```

You import the context providers and wrap them around your app components exactly the same as with classes:

```javascript
// ...
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <LanguageProvider>
          <PageContent>
            <Navbar />
            <Form />
          </PageContent>
        </LanguageProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
```

To use (consume) the context in the components is easier using `useContext()`:

```javascript
import React, { useContext } from 'react';
// ...
import { ThemeContext } from './contexts/ThemeContext';
import { LanguageContext } from './contexts/LanguageContext';

function Navbar() {
  const { isDarkMode } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <div className="Navbar">
      {/* ... */}
    </div>
  );
}

export default Navbar;
```

Note that when working with `useContext`, whenever the context providers value changes, any component consuming that context will be re-rendered. This is true even if components are using different methods or parameters from the context... the thing to remember is the context provider always outputs a single value, even if that value happens to be an object.


## useReducer

To improve performance, `useReducer` is often used in combination with context. See [useReducer.md](useReducer.md).
