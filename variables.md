# Defining variables

## Table of Contents

<!-- toc -->

- [In class components](#in-class-components)
- [In functional components](#in-functional-components)

<!-- tocstop -->

## In class components

In a traditional React component, you have a number of places you could be defining and accessing values from. These include `props` and `state`. Obviously, there will be many variables that don't need to be `props` or `state` and generally speaking, those can be defined wherever they are being used.

 For example, this component needs a random CSS transform style. We can define those random variables right in the `render()` method since that is where `transform` is ultimately being used.

```javascript
class Card extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let angle = Math.random() * 90 - 45;
    let xPos = Math.random() * 40 - 20;
    let yPos = Math.random() * 40 - 2;
    let transform = `translate(${xPos}px, ${yPos}px) rotate(${angle}deg)`;
    return (
      <img
        src={this.props.image}
        alt={this.props.name}
        className="Card"
        style={{transform: transform}} />
    );
  }
}
```

*However*, since these variables are in the `render()` method, anytime the parent component causes a re-render via an update, these values will be recalculated. If this works for your design, carry on, otherwise another solution would be to place the variables in the `constructor`, thus having them be calculated only once.

In order for the `render` method to have access to variables defined in the `constructor`, we have to add `this.`. It was mentioned briefly that common practice is to name these variables with a leading underscore, but I haven't found an actual explanation of this yet.

```javascript
class Card extends Component {
  constructor(props) {
    super(props);
    let angle = Math.random() * 90 - 45;
    let xPos = Math.random() * 40 - 20;
    let yPos = Math.random() * 40 - 2;
    this._transform = `translate(${xPos}px, ${yPos}px) rotate(${angle}deg)`;
  }
  render() {
    return (
      <img
        src={this.props.image}
        alt={this.props.name}
        className="Card"
        style={{transform: this._transform}}/>
    );
  }
}
```

## In functional components

Looking at the same example from above, where the goal is that each Card component has its own random `angle`, `xPos` and `yPos`, and those values don't change when the parent component causes a re-render (e.g. by adding another card to a state defined array of cards).

```javascript
// If we define the variables as shown here, the values will be recalculated
// every time, just like if they were in the render() of a class component.

function Card(props) {

  let angle = Math.random() * 90 - 45;
  let xPos = Math.random() * 40 - 20;
  let yPos = Math.random() * 40 - 2;
  const transform = `translate(${xPos}px, ${yPos}px) rotate(${angle}deg)`;

  return (
    <img
      src={props.image}
      alt={props.name}
      className="Card"
      style={{ transform: transform }} />
  )
}
```

```javascript
// If we define the variables as shown here, the values won't be recalculated
// evert time there is a re-render, but every Card will have the same values.

import React, { useEffect } from 'react';

function Card(props) {
  let transform;
  useEffect(() => {
    let angle = Math.random() * 90 - 45;
    let xPos = Math.random() * 40 - 20;
    let yPos = Math.random() * 40 - 2;
    transform = `translate(${xPos}px, ${yPos}px) rotate(${angle}deg)`
  }, []);

  return (
    <img
      src={props.image}
      alt={props.name}
      className="Card"
      style={{ transform: transform }} />
  )
}
```

```javascript
// In order to get the result I want, I have to use state, even though
// I have no intention of changing the state once the elements have been
// created. I do however, want each returned element to have its own state.

import React, { useState } from 'react';

function Card(props) {
  const [state, setState] = useState({
    angle: Math.random() * 90 - 45,
    xPos: Math.random() * 40 - 20,
    yPos: Math.random() * 40 - 2
  });

  const transform = `translate(${state.xPos}px, ${state.yPos}px) rotate(${state.angle}deg)`

  return (
    <img
      src={props.image}
      alt={props.name}
      className="Card"
      style={{ transform: transform }} />
  )
}
```
