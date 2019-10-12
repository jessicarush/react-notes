# React State

State in a web application can describes when things need to change as a result of an event (clicking something, data changes, etc.). Examples are a logged-in user sees different content from an anonymous user, clicking an 'edit' button could open a modal window, sections could expand or collapse, etc.

In frontend/client-side, there are generally two types of things that state will track:
- UI logic - the changing state of the interface, e.g. there is a model open
- Business logic - the changing state of data, e.g. there are new messages in the inbox or new data to be displayed

Traditionally we kept track of state by selecting DOM elements and checking their styles or attributes, in other words, we inferred the state of an application from the DOM. In React we manage state more directly.

While React *properties* represent immutable data passed to components, *states* represent data specific to a component that is likely to change over time. Like *props*, state is an object, and an instance attribute on a component.


## Table of Contents

<!-- toc -->

- [Example](#example)
- [Changing State](#changing-state)
- [React Events](#react-events)
- [State as Props pattern](#state-as-props-pattern)

<!-- tocstop -->

## Example

In order to use states, it must be initialized with all the values we want to change over time (initial states) when the component is created using a constructor function:

```javascript
class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      player: 'New Player'
    };
  }
}
```

You can access state values via `this.state`:

```javascript
class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      player: 'New player'
    };
  }

  render() {
    console.log(this.state);  
    // Object { score: 0, player: "New player" }
    return (
      <div className="Game">
        <p>Player: {this.state.player}</p>
        <p>Score: {this.state.score}</p>
      </div>
    );
  }
}
```

Note that **if you are using create-react-app and babel**, you can also use a shorthand syntax for your initial state values. Note that behind the scenes, the constructor function will still be created for you and you still access the state value through `this.state`:

```javascript
class Game2 extends Component {
  state = {
    score: 0,
    player: 'New player'
  };

  render() {
    console.log(this.state);
    return (
      <div className="Game">
        <p>Player: {this.state.player}</p>
        <p>Score: {this.state.score}</p>
      </div>
    );
  }
}

export default Game2;
```

## Changing State

Note that you never directly modify a state via assignment. For example `this.state.score = 25;` is NOT how it's done. Instead, we use a React method called `this.setState()`.

> Think of setState() as a request rather than an immediate command to update the component. For better perceived performance, React may delay it, and then update several components in a single pass. React does not guarantee that the state changes are applied immediately.

You can pass an object of key value pairs or a function that returns and object. Note that `this.setState()` is asynchronous and any state-changes made to a component will cause it to re-render ([unless shouldComponentUpdate() returns false](https://reactjs.org/docs/react-component.html#setstate)).

Normally, an event would trigger a state change but for the moment, to illustrate changing a state the following class has a method that uses the `setInterval()` Window/Global Scope method to change the score state every 1000ms.

```javascript
class StateDemo extends Component {
  constructor(props) {
    super(props);
    this.state = { score: 0};
    this.changeState();  // normally you would never do this!
  }

  changeState() {
    setInterval(() => {
      let randomNum = Math.floor(Math.random() * 10);
      this.setState({score: randomNum});
    }, 1000);
  }

  render() {
    return (
      <div className="StateDemo">
        <p>Score: {this.state.score}</p>
      </div>
    );
  }
}
```

## React Events

In React, every JSX element has built-in attributes representing every kind of browser event. They are camel-case and take callback functions as event listeners.

In the following example we've created a button and added an event handler. We've created a method in the component to handle the click event. The only thing that's unexpected here is that we in order to use `this.setState` within that event handling method, we have to clarify what `this` is referring. As it turns out, the calling object not out component but some other part of React. To clarify `this` is referring to our component, we have to do some binding:

```javascript
class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {clicked: false};
    this.handleClick = this.handleClick.bind(this);  // bummer
  }
  handleClick(e) {
    this.setState({clicked: true});
  }
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Click me</button>
        <p>{this.state.clicked ? 'Clicked' : 'Not clicked.'}</p>
      </div>
    );
  }
}
```

Another way to handle the `this` problem is to use an arrow-type syntax. Like the shorthand method above for initializing state, you also **need to be using create-react-app and babel to do it this way**:

```javascript
class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {clicked: false};
  }
  handleClick = () => {
    this.setState({clicked: true});
  }
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Click me</button>
        <p>{this.state.clicked ? 'Clicked' : 'Not clicked.'}</p>
      </div>
    );
  }
}
```

## State as Props pattern

A common pattern in react apps is that we will have a *stateful* parent component that passes down its state values as props to a *stateless* child component. For example:

```javascript
class ParentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {num: 0};
  }
  render() {
    return (
      <div>
        <ChildComponent num={this.state.num} />
      </div>
    );
  }
}
```

This concept is referred to as *downward data flow*. It means that generally, components get simpler as you drill down the component hierarchy and parents tend to be more stateful than their children.
