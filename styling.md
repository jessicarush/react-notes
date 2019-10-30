# Styling React Components

## Table of Contents

<!-- toc -->

- [Stylesheet styles](#stylesheet-styles)
- [Conditional Styles](#conditional-styles)
- [Inline Styles](#inline-styles)

<!-- tocstop -->

## Stylesheet styles

Create and link a stylesheet as you normally would.

Note that while you can name your classes however you like, many people prefer to name them according to what the component is named. For example:

*Machine.css:*
```css
.Machine {
  background: rgb(245,242,240);
  box-shadow: 0 0 15px rgba(0,0,0,.2);
  padding: 10px;
}
```

*Machine.js:*
```javascript
import './Machine.css';

class Machine extends React.Component {
  render() {
    return (
      <div className="Machine">
        <p>...</p>
      </div>
    );
  }
}
```

Note that we are not using the standard HTML attribute `class=""` but rather `className=""`. This is because `class` is a reserved word in JavaScript. On that note, when rendering form labels, we have to do `<label htmlFor="name">` instead of `<label for="name">` because `for` is also a reserved word.

## Conditional Styles

You can easily apply different styles using conditions, for example:

*Machine.js:*
```javascript
class Machine extends React.Component {
  render() {
    return (
      <div className="Machine">
        <p className={win ? 'Machine__win' : 'Machine__lose'}> ... </p>
      </div>
    );
  }
}
```


## Inline Styles

While I prefer using stylesheets, you can also apply *inline* css:

*Machine.js:*
```javascript
class Machine extends React.Component {
  render() {
    const styles = {
      backgroundColor: 'rgb(245,242,240)',
      boxShadow: '0 0 15px rgba(0,0,0,.2)',
      padding: '10px'
    };
    return (
      <div style={styles}>
        <p>...</p>
      </div>
    );
  }
}
```

The benefit to this is that you could have your css values come from properties:

*Machine.js:*
```javascript
class Machine extends React.Component {
  render() {
    const styles = {
      backgroundColor: this.props.color,
      boxShadow: '0 0 15px rgba(0,0,0,.2)',
      padding: '10px'
    };
    return (
      <div style={styles}>
        <p>...</p>
      </div>
    );
  }
}
```

*index.js:*
```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        <Machine color="rgb(245,242,240)"/>
        <Machine color="tomato"/>
        <Machine color="#fff"/>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
```
