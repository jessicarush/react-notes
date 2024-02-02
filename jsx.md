# JSX

> :warning: When I started learning React, it was all class components. As a result, most of the examples here use class components. I have left them in tact in case I ever have to deal with legacy code. That being said, the concepts are basically the same and when necessary, I've added function component examples as well and/or links to other notes.

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Rules](#rules)
- [Commenting](#commenting)
- [Javascript in JSX](#javascript-in-jsx)
  * [Functions](#functions)
  * [Conditionals](#conditionals)
    + [Ternary operator](#ternary-operator)
    + [Short-circuiting](#short-circuiting)
    + [if/else](#ifelse)
  * [Loops](#loops)
- [Keys](#keys)
  * [uuid](#uuid)
  * [Keys identify components as being unique](#keys-identify-components-as-being-unique)
- [Breaking code into chunks](#breaking-code-into-chunks)
- [Conditionally render content](#conditionally-render-content)
- [React Fragments](#react-fragments)
- [Map can be used for component names too](#map-can-be-used-for-component-names-too)

<!-- tocstop -->

## Introduction

React components have a render function that specifies what the HTML output of the React component will be. *JavaScript Syntax eXtension* or *JavaScript XML* (JSX), is a React extension that allows us to write JavaScript that looks like HTML.


## Rules

JSX isn't legal JavaScript syntax. In order for our browser to translate this JSX syntax, we need to use/include the *babel* transpiler.

```html
<script src="https://unpkg.com/babel-standalone"></script>
```

You don't need to use JSX to write React, but it makes the code much simpler and easier to read. Fundamentally, JSX just provides *syntactic sugar* for the `React.createElement(component, props, ...children)` function.

For example, this JSX:

```javascript
<div className="sidebar">Hello</div>
```

compiles into this javascript:

```javascript
React.createElement('div', {className: 'sidebar'}, 'Hello');
```

Note at <https://babeljs.io/repl> you can type in your JSX code to see what it actually transpiles to.

JSX is much more strict than HTML in that if the html element doesn't have an explicit closing tag, you *must* include the `/` at the end of the standalone tag. e.g `<input type="text" />`.

We should also always stick with double quotes when typing attributes or properties (see [properties.md](properties.md)).

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        <Welcome name="Jessica" day="Thursday" />
      </div>
    );
  }
}
```

## Commenting

If you want to write comments in your components, JSX requires that you use multiline JS/CSS style but wrapped in curly braces like so `{/* comment */}`:

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        {/* Here's my comment */}
        <Welcome name="Jessica" day="Thursday" />
      </div>
    );
  }
}
```


## Javascript in JSX

You can include JavaScript expressions in JSX by using curly braces, for example:

```javascript
class Demo extends React.Component {
  render() {
    return (
      <div>
        <h1>My number is {2 * 8}</h1>
      </div>
    );
  }
}
```

These curly braces can be used to call functions, run loops, conditionals, etc.

### Functions

```javascript
function getColor() {
  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'aquamarine',
    'purple'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

class Demo extends React.Component {
  render() {
    return (
      <div>
        <h1>My color is {getColor()}</h1>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('root'));
```

### Conditionals

[This article](https://blog.logrocket.com/conditional-rendering-in-react-c6b0e5af381e/) looks at 8 different ways of rendering with conditionals (e.g if/else, ternary operator, short-circuiting, etc). For example...

#### Ternary operator

Here's an example of the ternary operator:

```javascript
function getNum() {
  return Math.floor(Math.random() * 10) + 1;
}

class Demo extends React.Component {
  render() {
    const num = getNum();
    return (
      <div>
        <h1>My number is... {num}</h1>
        <p>{num === 7 ? 'Woot!' : 'Meh.'}</p>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('root'));
```

#### Short-circuiting

An example of short-circuiting, if we wanted to display an image only if the number if 7:

```javascript
function getNum() {
  return Math.floor(Math.random() * 10) + 1;
}

class Demo extends React.Component {
  render() {
    const num = getNum();
    return (
      <div>
        <h1>My number is... {num}</h1>
        <p>{num == 7 ? 'Woot!' : 'Meh.'}</p>
        {num === 7 && <img src="img/photo.jpg" />}
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('root'));
```

The conditional before the `&&` should resolve to a pure boolean.

#### if/else

This example uses an if/else to set a variable containing content. The content is then added at the end. Note that even in this variable (msg), we can return only one element. In other words, multiple elements should be wrapped in one.

```javascript
function getNum() {
  return Math.floor(Math.random() * 10) + 1;
}

class Demo extends React.Component {
  render() {
    const num = getNum();
    let msg;
    if (num === 7) {
      msg = (
        <div>
          <p>'Woot!'</p>
          <img src="img/photo.jpg" />
        </div>
      );
    } else {
      msg = <p>'Meh.'</p>;
    }
    return (
      <div>
        <h1>My number is... {num}</h1>
        {msg}
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('root'));
```

### Loops

The most common way to loop in JSX is to use the `array.map()` function. For example lets say I'm passing properties into a component:

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        <Messages
          name="Jessica"
          msgs={[
            {id: 1, text: 'Great'},
            {id: 2, text: 'Awesome'},
            {id: 3, text: 'Fantastic'},
            {id: 4, text: 'Super'}
          ]}
        />
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
```

In the component I could use map to loop through the `msgs`. Remember, `msgs` is just an array of objects. The outermost set of curly braces `{}` are there because of the syntax rules for 'JavaScript in JSX'.

```javascript
class Messages extends React.Component {
  render() {
    const { name, msgs } = this.props;
    return (
      <ul>
        <li>{ name }</li>
        { msgs.map(m => <li>{m.text}</li>) }
      </ul>
    );
  }
}
```

## Keys

Note that with the above, you'll get a **Warning** in the console that reads: `Warning: Each child in a list should have a unique "key" prop`.

The reason for this is...

> Keys help React identify which items have changed, are added, or are removed. Keys should be given to the elements inside the array to give the elements a stable identity.

Using the example above, the solution is:

```javascript
{ msgs.map(m => <li key={m.id}>{m.text}</li>) }
```

Note that this will always be recommended when using `map()` to generate jsx DOM elements. In the following example I received the same warning:

```javascript
<div className="Pokedex">

  {this.props.pokemon.map(p => (
    <Pokecard name={p.name} type={p.type} exp={p.base_experience} />
  ))}
</div>
```

When I add a key property, provided the key is unique, react will be satisfied. I this case, the names will always be unique, so they can be used for keys:

```javascript
<div className="Pokedex">
  {this.props.pokemon.map(p => (
    <Pokecard
      key={p.name}
      name={p.name}
      type={p.type}
      exp={p.base_experience}
    />
  ))}
</div>
```

### uuid

In the event that you don't have any obvious, easy id or name to use for keys, there are a couple of options. The first is to use the index number of the item. This index number can be accessed automatically as the second argument to the `map()` method:

```javascript
const todoItems = todos.map((todo, index) => (
  // Only do this as a last resort
  <li key={index}>{todo.text}</li>
));
```

> You might be tempted to use an item’s index in the array as its key. In fact, that’s what React will use if you don’t specify a key at all. But the order in which you render items will change over time if an item is inserted, deleted, or if the array gets reordered. Index as a key often leads to subtle and confusing bugs. [Source](https://react.dev/learn/rendering-lists#where-to-get-your-key)

Instead, we can use an external library to help: [uuid](https://www.npmjs.com/package/uuid)

```bash
npm install uuid
```

Then import it using the id version type of your choice. For example, v1 is a timestamp, v4 is random.

```javascript
import { v4 as uuid } from 'uuid';
```

Then use the function call to generate it:

```javascript
let todos = [
  {id: uuid(), text: 'Water plants'},
  {id: uuid(), text: 'Get milk'}
]

const todoItems = todos.map(todo => (
  <li key={todo.id}>{todo.text}</li>
));
```

Note that the act of installing and importing a module like this assumes that you are using a tool like [create-react-app](create_react_app.md) or [vite](vitejs.md). Specifically, to install, you would need a `package.json` and to use `import`, you would need to set the `<script>` element's attribute `type="module"`. Since React apps need the `type` attribute to be set to `text/jsx`, we use one of the aforementioned tools to sort it out.


### Keys identify components as being unique

Note that when you pass a prop to component, if that prop changes, anywhere that prop is being used will be updated but any other state values in that component will not be affected. For example, consider [this situation from the React.dev docs](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes):

```javascript
import { useState } from "react";

function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  return (
     <div>
       <p>userId: {userId}</p>
       <p>comment: {comment}</p>
       <input type="text" value={comment} onChange={e => setComment(e.target.value)}/>
     </div>
  );
}

export default ProfilePage;
```

I have a `userId` prop passed down from the parent component and I have the ability to add a comment. If the `userId` prop changes, the `userId` being displayed will change, but the comment state will remain untouched. You can demonstrate this by passing in a new `userId`: 

```javascript
// App.js
import { useState } from 'react';
import ProfilePage from './ProfilePage';
import './App.css';

function App() {
  const [userId, setUserId] = useState('1');

  return (
    <div className="App">
      <ProfilePage userId={userId} />
      <button onClick={() => setUserId('1')}>go to userid 1</button>
      <button onClick={() => setUserId('2')}>go to userid 2</button>
    </div>
  );
}

export default App;
```

I we want the `comment` state to reset when the `userId` changes, we need to tell React that each `ProfilePage` is conceptually a different profile by giving it an explicit key. 

```javascript
// App.js
import { useState } from 'react';
import ProfilePage from './ProfilePage';
import './App.css';

function App() {
  const [userId, setUserId] = useState('1');

  return (
    <div className="App">
      {/* Now whenever userId changes, the component will re-render */} 
      <ProfilePage userId={userId} key={userId} />
      <button onClick={() => setUserId('1')}>go to userid 1</button>
      <button onClick={() => setUserId('2')}>go to userid 2</button>
    </div>
  );
}

export default App;
```

> Normally, React preserves the state when the same component is rendered in the same spot. By passing userId as a key to the Profile component, you’re asking React to treat two Profile components with different userId as two different components that should not share any state. Whenever the key (which you’ve set to userId) changes, React will recreate the DOM and reset the state of the Profile component and all of its children. Now the comment field will clear out automatically when switching between users.

If you did have some state elements that you DID want to retain between users, you would instead create a new component inside `ProfilePage` that contains the elements you want to reset and set a `key={userId}` on that one.

```javascript
import { useState } from "react";

function ProfilePage({ userId }) {
  return (
     <div>
       <Profile userId={userId} key={userId} />
     </div>
  );
}

function Profile({ userId }) {
  const [comment, setComment] = useState('');
  return (
     <div>
       <p>userId: {userId}</p>
       <p>comment: {comment}</p>
       <input type="text" value={comment} onChange={e => setComment(e.target.value)}/>
     </div>
  );
}

export default ProfilePage;
```


## Breaking code into chunks

With map rendered components the `render()` method of the parent component can get pretty long. Feel free to pull any sections out into their own functions or variables to help organize your code better. For example:

```javascript
class TestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {id: 1, name: 'cream', qty: '3 cartons'},
        {id: 2, name: 'broccoli', qty: '1 bunch'},
        {id: 3, name: 'cucumber', qty: '2'}
      ]
    };
  }

  renderItems() {
    return (
      <ul>
        {this.state.items.map(item => (
          <li key={item.id}>{item.name} - {item.qty}</li>
        ))}
      </ul>
    );
  }

  render() {
    return (
      <div>
        {this.renderItems()}
      </div>
    );
  }
}
```

Alternatively:

```javascript
class TestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {id: 1, name: 'cream', qty: '3 cartons'},
        {id: 2, name: 'broccoli', qty: '1 bunch'},
        {id: 3, name: 'cucumber', qty: '2'}
      ]
    };
  }

  render() {
    const listItems = this.state.items.map(item => (
      <li key={item.id}>{item.name} - {item.qty}</li>
    ));
    return (
      <div>
        <ul>{listItems}</ul>
      </div>
    );
  }
}
```

## Conditionally render content

Style-wise, there's a number of ways to conditionally render elements using the methods described above in the [Conditionals](#conditionals) section. For example, you could render one or another variable using the conditional operator:

```javascript
render() {
  const todo = (
    <div className="Todo">
      ...etc...
    </div>
  );
  const todoEdit = (
    <form className="Todo" onSubmit={this.handleSubmit}>
      ...etc...
    </form>
  );

  return this.props.editing === true ? todoEdit : todo;
}
```

Or, you could use if/else to set a single variable:

```javascript
render() {
  let result;
  if (this.props.editing) {
    result = (
      <div className="Todo">
        ...etc...
      </div>
    );
  } else {
    result = (
      <form className="Todo" onSubmit={this.handleSubmit}>
        ...etc...
      </form>
    );
  }
  return result;
}
```


## React Fragments

A common pattern in React is to return multiple elements. As we know, multiple elements must be wrapped in a single element. Usually, you will have something that makes sense (e.g. `<div>`), but other times you may not want an element to be rendered. For these situations you can use `<React.Fragment>` which will not render anything in the DOM. For example:

```javascript
class Table extends React.Component {
  render() {
    return (
      <table>
        <tr>
          <Columns />
        </tr>
      </table>
    );
  }
}
```

In this case if we wrap the `<td>` elements in anything, we'll get invalid HTML rendered in the DOM.

```javascript
class Columns extends React.Component {
  render() {
    return (
      <div>
        <td>Hello</td>
        <td>World</td>
      </div>
    );
  }
}
```

The above would result in:

```html
<table>
  <tr>
    <div>
      <td>Hello</td>
      <td>World</td>
    </div>
  </tr>
</table>
```

This is were `<React.Fragment>` is useful:

```javascript
class Columns extends React.Component {
  render() {
    return (
      <React.Fragment>
        <td>Hello</td>
        <td>World</td>
      </React.Fragment>
    );
  }
}
```

Gives us what we want:

```html
<table>
  <tr>
    <td>Hello</td>
    <td>World</td>
  </tr>
</table>
```

As of React v16.2.0, you can also use the shorthand `<></>` syntax.

```javascript
function Columns() {
  return (
    <>
      <td>Hello</td>
      <td>World</td>
    </>
  );
}
```

Keep in mind though, if you have to pass a `key=uuid()`, you'll need to use the normal `<Fragment>` syntax.


## Map can be used for component names too 

I don't know why my brain found this noteworthy, but it did. When mapping, the name of a component can come from the mapped object, for example:

```jsx
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

// Map of links to display in the side navigation.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentDuplicateIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <a key={link.name} href={link.href} className="">
            <LinkIcon className="" />
            <p className="">{link.name}</p>
          </a>
        );
      })}
    </>
  );
}
```