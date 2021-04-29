# React State

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Example](#example)
- [Changing State](#changing-state)
- [React Events](#react-events)
- [State as Props pattern](#state-as-props-pattern)
- [Updating existing state values](#updating-existing-state-values)
- [Mutable data structures & state](#mutable-data-structures--state)
- [State Design](#state-design)
- [Updating state with map() vs for](#updating-state-with-map-vs-for)
- [Toggling a true/false value](#toggling-a-truefalse-value)

<!-- tocstop -->


## Introduction

State in a web application can describe when things need to change as a result of an event (clicking something, data changes, etc.). Examples are a logged-in user sees different content from an anonymous user, clicking an 'edit' button could open a modal window, sections could expand or collapse, etc.

In frontend/client-side, there are generally two types of things that state will track:
- UI logic - the changing state of the interface, e.g. there is a model open
- Business logic - the changing state of data, e.g. there are new messages in the inbox or new data to be displayed

Traditionally we kept track of state by selecting DOM elements and checking their styles or attributes, in other words, we inferred the state of an application from the DOM. In React we manage state more directly.

While React *properties* represent immutable data passed to components, *states* represent data specific to a component that is likely to change over time. Like *props*, state is an object, and an instance attribute on a component.


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
```


## Changing State

Note that you never directly modify a state via assignment. For example `this.state.score = 25;` is NOT how it's done. Instead, we use a React method called `this.setState()`.

> Think of setState() as a request rather than an immediate command to update the component. For better perceived performance, React may delay it, and then update several components in a single pass. React does not guarantee that the state changes are applied immediately.

You can pass an object of key value pairs or, a function that returns an object or, a callback. Note that `this.setState()` is asynchronous and any state-changes made to a component will cause it to re-render ([unless shouldComponentUpdate() returns false](https://reactjs.org/docs/react-component.html#setstate)).

Normally, an event would trigger a state change but for the moment, to illustrate changing a state the following class has a method that uses the `setInterval()` Window/Global Scope method to change the score state every 1000ms.

Passing a regular object to `setState()`:
```javascript
class StateDemo extends Component {
  constructor(props) {
    super(props);
    this.state = { score: 0};
    this.changeState();  // for demonstration only!
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

Passing a function to `setState()`:
```javascript
changeState() {
  this.setState(() => {
    let randomNum = Math.floor(Math.random() * 100);
    return {score: randomNum};
  });
}
```

Passing a callback to `setState()`:
```javascript
// ... outside of the component
function randomScore() {
  let randomNum = Math.floor(Math.random() * 100);
  return {score: randomNum};
}
```
```javascript
// ... in the component
changeState() {
  this.setState(randomScore);
}
```
or:

```javascript
// ... in the component
randomScore() {
  let randomNum = Math.floor(Math.random() * 100);
  return {score: randomNum};
}
changeState() {
  this.setState(this.randomScore);
}
```

Note that using a callback makes testing code much simpler, for example:

```javascript
expect(incrementScore({count: 0})).toEqual({count: 1});
```

Not that you should never `setState()` in the constructor.


## React Events

In React, every JSX element has built-in attributes representing every kind of browser event. They are camel-case and take callback functions as event listeners.

In the following example we've created a button and added an event handler. We've created a method in the component to handle the click event. The only thing that's unexpected here is that in order to use `this.setState` within that event handling method, we have to clarify what `this` is referring. As it turns out, the calling object is not our component but some other part of React. To clarify that `this` should be referring to our component, we have to do some binding:

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

Another way to handle the `this` problem is to use an arrow-type syntax. Like the shorthand method above for initializing state, you also **need to be using create-react-app and babel to do it this way** as this is considered *experimental syntax* and is not yet part of the standard spec.

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


## Updating existing state values

Remember that `setState()` is asynchronous, which means it's risky to assume the a previous call has finished when you call it again. In addition, React will sometimes batch calls to `setState()` together for better performance. As a result, if we wanted to update a state using its existing value, there is a right and wrong way to do it. This is where passing a function or callback to `setState()` becomes helpful.

When passing a function where we want to update a state value, we give it the current state as a parameter. The function should use that parameter to do any calculating, then return an object representing the new state.

Using a function:
```javascript
class Score extends Component {
  constructor(props) {
    super(props);
    this.state = { score: 0 };
    this.addPoint = this.addPoint.bind(this);
  }
  addPoint() {
    // Wrong:
    // this.setState({score: this.state.score + 1});
    // Right:
    this.setState(currentState => {
      return {score: currentState.score + 1};
    })
  }
  render() {
    return (
      <div>
        <h1>Score is: {this.state.score}</h1>
        <button onClick={this.addPoint}>add point</button>
      </div>
    )
  }
}
```

Using a callback:
```javascript
function incrementScore(currentState) {
  return {score: currentState.score + 1};
}

class Score extends Component {
  constructor(props) {
    super(props);
    this.state = { score: 0 };
    this.addPoint = this.addPoint.bind(this);
  }
  addPoint() {
    this.setState(incrementScore);
  }
  render() {
    return (
      <div>
        <h1>Score is: {this.state.score}</h1>
        <button onClick={this.addPoint}>add point</button>
      </div>
    )
  }
}
```

When the callback is a method in the class, remember to add `this`:
```javascript
class Score extends Component {
  constructor(props) {
    super(props);
    this.state = { score: 0 };
    this.addPoint = this.addPoint.bind(this);
  }
  incrementScore(currentState) {
    return {score: currentState.score + 1};
  }
  addPoint() {
    this.setState(this.incrementScore); // this
  }
  render() {
    return (
      <div>
        <h1>Score is: {this.state.score}</h1>
        <button onClick={this.addPoint}>add point</button>
      </div>
    )
  }
}
```


## Mutable data structures & state

If a state value is a mutable data structure like an object or array, we also have to follow safe practices when updating or editing a value within those data structures. Once again, we don't assign a new value directly, but rather we make a copy of the data structure, make the changes, return the new data structure and then `setState()` with that new object.

For example:

```javascript
class StateDemo extends Component {
  constructor(props) {
    super(props);
    this.state = { numbers: [] };
    this.addNumber = this.addNumber.bind(this);
  }
  addNumber() {
    let i = Math.floor(Math.random() * 10);
    // WRONG - modify the state value directly:
    // this.state.numbers.push(i);
    // RIGHT - make a copy of the existing array and add/change as needed:
    let new_numbers = [...this.state.numbers, i];
    this.setState({ numbers: new_numbers });

  }
  render() {
    return (
      <div className="StateDemo">
        <p>Greetings: {this.state.numbers}</p>
        <button onClick={this.addNumber}>text</button>
      </div>
    );
  }
}
```

Obviously creating copies of data structures comes with a processing efficiency penalty, but the gains in terms of ensuring your app doesn't have difficult-to-find bugs, due to Reacts handling of things under the hood, is mostly worth it.


## State Design

Designing components and deciding where states will go, takes time and practice. Some ideas to consider:

- **Minimize state** - in react, try to put as little data in state as possible. In other words, only include data that will change. If the data will not be changing, it should be a *prop*.

- **State on the parent** - in an attempt to support *downward data flow* we should, whenever possible, have our states be in the parent component.

If, for example, I had a child component that I wanted to change state: While the child could, in theory, have it's own state, we could also do something like this:

1. parent component defines a function
2. the function is passed to the child component as a prop
3. the child invokes the prop
4. the parent function is called, setting a new state
5. the parent and children are re-rendered as a result of the state change.

When you use this pattern, both the parent and the child need to bind their callback functions. For example:

Parent component:
```javascript
class TestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {color: 'rgb(255,99,71)'};
    this.setColor = this.setColor.bind(this);
  }

  randomColor() {
    function random(n) {
      return Math.floor(Math.random() * (n + 1));
    }
    return `rgb(${random(255)},${random(255)},${random(255)})`;
  }

  setColor() {
    this.setState({color: this.randomColor()});
  }

  render() {
    return (
      <div className="TestComponent">
        <TestChildComponent color={this.state.color} setColor={this.setColor} />
      </div>
    )
  }
}
```

Child component:
```javascript
class TestChildComponent extends Component {
  constructor(props) {
    super(props);
    this.handleSetColor = this.handleSetColor.bind(this);
  }

  handleSetColor() {
    this.props.setColor();
  }

  render() {
    const styles = {backgroundColor: this.props.color};
    return (
      <div style={styles} className="TestChildComponent">
        <button onClick={this.handleSetColor}>Click me</button>
      </div>
    )
  }
}
```

That being said, when you have state properties that are mainly for presentation, that state information could be stored in the component where it is being used. For the "core" data in an app, try to centralize the data in a parent component.  It can be helpful to frame it through the question: "what data would I want to send off to a database?".  In cases where we're only using a state/function for display purpose and wouldn't need to store that in a database, it might be preferable to keep it in the child component.


## Updating state with map() vs for  

I keep hearing that `for` loops are uncommon in the React world in favour of iterators like `map()`. I can't seem to pinpoint a real reason for this beyond preference so here are two methods that achieving the same result.

First, imagine I have a state that looks like this:

```javascript
this.state = {
  todos: [
    { id: uuid(), task: 'water plants', editing: false, completed: false },
    { id: uuid(), task: 'shopping', editing: false, completed: false },
    { id: uuid(), task: 'recycling', editing: false, completed: false }
    // etc
  ] };
```

What I want to do, is update a property of one of the objects which I'm going to select by id.

Here's doing it with a for loop:
```javascript
editTodo(id) {
  this.setState(currentState => {
    for (let i = 0; i < currentState.todos.length; i++) {
      if (currentState.todos[i].id === id) {
        currentState.todos[i].editing = true;
        break;
      }
    }
    return currentState;
  });
}
```

And with map():
```javascript
editTodo(id) {
  const newTodos = this.state.todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, editing: true };
    } else {
      return todo;
    }
  });
  this.setState({ todos: newTodos});
}
```

## Toggling a true/false value

This is more of a plain old JavaScript note, rather that a React-specific note but it came up so I'm making a note of it.

When you want to toggle a state on and off, a very long way might be something like this;

```javascript
if (currentState.todos[i].id === id) {
  currentState.todos[i].completed = (currentState.todos[i].completed === true) ? false : true;
  break;
}
```

But I always forget, it's way simpler to use the `!` not operand:
```javascript
if (currentState.todos[i].id === id) {
  currentState.todos[i].completed = !currentState.todos[i].completed;
  break;
}
```
