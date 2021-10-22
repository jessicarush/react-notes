# Defining variables

## Table of Contents

<!-- toc -->
<!-- tocstop -->

In a React component, you have a number of places you could be defining and accessing values from. These include `props` and `state`. Obviously, there will be many variables that don't need to be `props` or `state` and generally speaking, those can be defined wherever they are being used.

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
    let transform = `translate(${xPos}px, ${yPos}px) rotate(${angle}deg)`
    return (
      <img
        src={this.props.image}
        alt={this.props.name}
        className="Card"
        style={{transform: transform}} />
    )
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
    this._transform = `translate(${xPos}px, ${yPos}px) rotate(${angle}deg)`
  }
  render() {
    return (
      <img
        src={this.props.image}
        alt={this.props.name}
        className="Card"
        style={{transform: this._transform}}/>
    )
  }
}
```
