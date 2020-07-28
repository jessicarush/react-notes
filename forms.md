# React Forms

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Controlled Components](#controlled-components)
- [Multiple form elements](#multiple-form-elements)
- [Passing form data up](#passing-form-data-up)

<!-- tocstop -->

## Introduction

> In HTML, form elements such as `<input>`, `<textarea>`, and `<select>` typically maintain their own state and update it based on user input. In React, mutable state is typically kept in the state property of components, and only updated with setState().
>
> We can combine the two by making the React state be the “single source of truth”. The React component that renders a form also controls what happens in that form on subsequent user input. An input form element whose value is controlled by React in this way is called a “controlled component”.

When working with form elements we can create a function that both handles the form's submit and has access to the data entered. Unlike typical html form elements, React is aware anytime these elements are changed: the state will be updated. Components that are handled like this are referred to as controlled components.

## Controlled Components

To create basic controlled components:
- create a state property in the component for the form element
- set the value on the form element to that state property in the component
- create a callback to handle `onChange` that will update the state and thus constantly display the new value
- create a callback to handle `onSubmit`
- bind both callbacks in the constructor

```javascript
class FormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    // runs on every keystroke event
    this.setState({username: e.target.value});
  }

  handleSubmit(e) {
    // do something with the form data
    e.preventDefault();
    console.log('A name was submitted: ' + this.state.username);
    this.setState({username: ''});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="username">username</label>
        <input type="text" id="username" name="username" value={this.state.username} onChange={this.handleChange} />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```

**NOTE:** the usual `for` attribute used with `<label>` elements is replaced with `htmlFor` in React.


## Multiple form elements

Due to the requirements shown above, when you have multiple form fields and elements, the code can get pretty long. One thing we can do to trim things down is to use an ES6 syntax technique called *computed property names* in our change event handler.

```javascript
let keyname = 'something';

const myObject = {[keyname]: 'whatever'}

console.log(Object.keys(myObject));
// [ 'something' ]
```

So, if we wanted to add two more fields to the form above, we would need to add two new matching state properties but, **provided the `name` attributes match the state property names** we can do this:

```javascript
handleChange(e) {
  // runs on every keystroke event
  this.setState({[e.target.name]: e.target.value});
}
```

So the whole thing would look like:

```javascript
class FormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    // runs on every keystroke event
    this.setState({[e.target.name]: e.target.value});
  }

  handleSubmit(e) {
    // do something with the form data
    e.preventDefault();
    console.log('A name was submitted: ' + this.state.username);
    this.setState({username: ''});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="username">username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={this.state.username}
          onChange={this.handleChange}
        />
        <input
          type="text"
          name="email"
          placeholder="email"
          value={this.state.email}
          onChange={this.handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          value={this.state.password}
          onChange={this.handleChange}
        />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```

## Passing form data up

This example is similar to what's shown in [state.md](state.md#state-design).

Parent component:
```javascript
class ParentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {name: 'cream', qty: '3 cartons'}
      ]
    };
    this.addItem = this.addItem.bind(this);
  }

  addItem(item) {
    this.setState(state => {
      return {items: [...state.items, item]};
    })
  }

  renderItems() {
    return (
      <ul>
        {this.state.items.map(item => (
          <li key={item.name}>{item.name} - {item.qty}</li>
        ))}
      </ul>
    );
  }

  render() {
    return (
      <div>
        {this.renderItems()}
        <ChildComponent addItem={this.addItem} />
      </div>
    );
  }
}
```

Child component:
```javascript
class ChildComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {name: '', qty: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.addItem(this.state);
    this.setState({name: '', qty: ''});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={this.state.name}
          onChange={this.handleChange}
        />
        <label htmlFor="name">Quantity:</label>
        <input
          type="text"
          id="qty"
          name="qty"
          value={this.state.qty}
          onChange={this.handleChange}
        />
        <input type="submit"/>
      </form>
    )
  }
}
```
