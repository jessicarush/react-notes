# Context

Context provides a way to pass data through the component tree without having to pass props down manually at every level.

> In a typical React application, data is passed top-down (parent to child) via props, but such usage can be cumbersome for certain types of props (e.g. locale preference, UI theme) that are required by many components within an application. Context provides a way to share values like these between components without having to explicitly pass a prop through every level of the tree.

Context can be used with or without hooks.

## Table of Contents

<!-- toc -->

- [When to use context](#when-to-use-context)
- [In class components](#in-class-components)
- [In function components (UseContext hook)](#in-function-components-usecontext-hook)

<!-- tocstop -->

## When to use context

Context is designed to share data that can be considered *global* for a tree of React components, such as the current authenticated user, theme, or preferred language.

Context is primarily used when some data needs to be accessible by many components at different nesting levels. Apply it sparingly because it makes component reuse more difficult.

If you only want to avoid passing some props through many levels, [component composition](https://reactjs.org/docs/context.html#when-to-use-context) is often a simpler solution than context.


## In class components

To define a context we'll need to create a new file.

**Tip:** Create a new directory called *contexts*, then create a javascript file in that directory for each content. For example: `ThemeContext.js`.

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

