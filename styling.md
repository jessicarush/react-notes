# Styling React Components

## Table of Contents

<!-- toc -->

- [Stylesheet styles](#stylesheet-styles)
- [Conditional Styles](#conditional-styles)
- [Inline Styles](#inline-styles)
- [Setting css variables](#setting-css-variables)
- [CSS-in-JS](#css-in-js)
- [Links](#links)

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

To use string interpolation:

```javascript
class Machine extends React.Component {
  let textClass;
  if (this.someprop > 0) {
    textClass = 'win';
  } else if (this.someprop < 0) {
    textClass = 'lose';
  } else {
    textClass = 'null';
  }
  render() {
    return (
      <div className="Machine">
        <p className={`Machine__${textClass}`}> ... </p>
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
        <Machine color="rgb(245,242,240)" />
        <Machine color="tomato" />
        <Machine color="#fff" />
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
```

If you want to put the property and value directly, use double `{{}}` like so:

```javascript
const color = props.color.value;

return (
  <div className="ColorChip" style={{ background: color }}>
    { props.color.value }
  </div>
);
```

## Setting css variables

Instead of doing inline properties you can also just set your css variables. Note they will be bound to the element and not available at root:

```javascript
import './Button.css';

function Button(props) {
  const {
    id,
    value,
    color,
    hoverColor,
    onClick,
    ...rest
  } = props;

  const styles = {'--color': color, '--hover-color': hoverColor};

  return (
    <button
      className={`Button`}
      onClick={onClick}
      style={styles}
      {...rest}>
      {value}
    </button>
  );
}

export default Button;
```

Then in your css:

```css

.Button {
  color: var(--color);
}

.Button:hover {
  color: var(--hover-color);
}
```

## CSS-in-JS

CSS-in JS is a styling approach that abstracts the CSS model to the component level, rather than the document level. It is teh idea that CSS can be scoped to a specific component only. The benefits include:

- reduce the number of http requests 
- styling fragmentation (write styles freely without worry of collisions or compatibility)

Many developers seem to have an issue with everything in CSS being globally scoped. While sticking to sincere naming/organization strategies like BEM (`.block__element--modifier`) can solve this issue, some developers prefer CSS-in-JS as it provides a more atomic way to scope styles only to the components that use them. Some also like that all the styles live in the react component directly. Some of the downsides include:

- CSS code now starts to look like JS code
- delayed rendering
- Messy DOM
- Library dependency
- A lot of native CSS and SCSS features are missing with CSS-in-JS
- No intellisense or auto-complete for CSS-in-JS in vscode

### CSS-in-JS libraries 

There are multiple CSS-in-JS libraries to choose from. Some will use *style objects* that look like JavaScript objects and others will allow you to write something that looks more like CSS. Using a style object has some drawbacks. CSS syntax is not always supported, so rules like media and feature queries might look very different. You’ll also have to rename all CSS properties to be camelCase, and the correct translation is not always readily apparent.

CSS string templates are exactly what they sound like: a string template is compiled directly to CSS. Some Sass features are baked in with Emotion and other libraries, like the `&` selector and the ability to nest components and media queries. String template-based libraries are easier for CSS developers to acclimate to and existing CSS can be copy/pasted.

[Emotion](https://emotion.sh/docs/introduction) and [Styled-Components](https://styled-components.com/) allow both methods and have many of the same features. There are many, many more.

### styled-components 

See: [React styles components tutorial](https://robinwieruch.de/react-styles-components)  
See: [styled-components docs](https://styled-components.com/docs/basics#installation)

```bash
npm install styled-components
```

When using styled-components, when defining your styles, you're actually creating a normal React component, that has your styles attached to it.

You can create a 'basic' component by using any html element:

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import './Card.css';

const Button = styled.button`
  color: #7279ef;
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid #7279ef;
  border-radius: 3px;
  background: transparent;
`;

function Card(props) {
  return (
    <div className="Card">
      <Button>Normal</Button>
    </div>
  );
}

export default Card;
```

You can access props like:

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import './Card.css';

const Button = styled.button`
  color: ${props => props.color ? props.color : "silver"};
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid ${props => props.color ? props.color : "silver"};
  border-radius: 3px;
  background: transparent;
`;

function Card(props) {
  return (
    <div className="Card">
      <Button color="tomato">Normal</Button>
    </div>
  );
}

export default Card;
```

You can do pseudo-classes like (more on this further down):

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import './Card.css';

const Button = styled.button`
  color: ${props => props.color ? props.color : "silver"};
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid ${props => props.color ? props.color : "silver"};
  border-radius: 3px;
  background: transparent;

  // '&' or '&&' refers to the instance of the component
  &:hover {
    color: white;
  }
`;

function Card(props) {
  return (
    <div className="Card">
      <Button color="tomato">Normal</Button>
    </div>
  );
}

export default Card;
```

You can style an existing simple html component like:

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import './Card.css';

const Button = styled.button`
  color: ${props => props.color ? props.color : "silver"};
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid ${props => props.color ? props.color : "silver"};
  border-radius: 3px;
  background: transparent;

  &:hover {
    color: white;
  }
`;

// A new component based on Button with overrides
const SecondaryButton = styled(Button)`
  color: white;
  background: ${props => props.color ? props.color : "silver"};
`;

function Card(props) {
  return (
    <div className="Card">
      <Button color="tomato">Normal</Button>
      <SecondaryButton color="teal">Secondary</SecondaryButton>
    </div>
  );
}

export default Card;
```

Or if you want to style your own component, just pass the className prop to one of the elements:

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import './Card.css';

const Button = styled.button`
  color: ${props => props.color ? props.color : "silver"};
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid ${props => props.color ? props.color : "silver"};
  border-radius: 3px;
  background: transparent;

  &:hover {
    color: white;
  }
`;

// A new component based on Button with overrides
const SecondaryButton = styled(Button)`
  color: white;
  background: ${props => props.color ? props.color : "silver"};
`;

// A new component based on our custom component
const StyledCard = styled(Card)`
  border: solid 1px yellow;
`;

function Card(props) {
  // props
  const { className } = props;

  return (
    <div className={className}>
      <Button color="tomato">Normal</Button>
      <SecondaryButton color="teal">Secondary</SecondaryButton>
    </div>
  );
}

export default StyledCard;
```

You could combine techniques:

```javascript
  return (
    <div className={`${className} Card`}>
      <Button color="tomato">Normal</Button>
      <SecondaryButton color="teal">Secondary</SecondaryButton>
    </div>
  );
```

Note that with simple html components, any known HTML attribute passed as props will be automatically passed to the DOM:

```javascript
  return (
    <div className={`${className} Card`}>
      <Button color="tomato" value="Submit" disabled>Normal</Button>
    </div>
  );
```

When you are creating s simple html component, you can also pass html attributes to it with ``:

```javascript
const Checkbox = styled.input.attrs({ type: "checkbox" })`
  color: blue;
`;
```

For pseudo-elements, pseudo-selectors, and nesting...

A single ampersand `&` refers to all instances of the component; it is used for applying broad overrides.

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import './Card.css';

const Item = styled.div`
  // gets applied to the component
  color: aquamarine;
  padding: .25em;

  // pseudo-class
  &:hover {
    font-style: italic;
  }

  // pseudo-element
  &::before {
    content: '*';
  }

  // Item also has the class 'special'
  &.special {
    background: pink;
  }

  // every Item that is immediately after an h1
  h1 + & {
    background: green;
  }

  // every Item that is preceeded by something with class 'special'
  .special ~ & {
    background: purple;
  }

  // Item is inside something with class 'wrapper'
  .wrapper & {
    background: red;
    color: white;
  }
`;

function Card(props) {

  return (
    <div>
      <h1>heading</h1>
      <Item>Item</Item>
      <Item>Item</Item>
      <Item className='special'>Item</Item>
      <Item>Item</Item>
      <Item>Item</Item>
      <section className='wrapper'>
        <Item>Item</Item>
      </section>
    </div>
  );
}

export default Card;
```

Apparently "a double ampersand `&&` refers to an instance of the component; this is useful if you're doing conditional styling overrides and don't want a style to apply to all instances of a particular component." This doesn't really make sense to me but other sources seem to say its more about specificity. Using `&&` applies the class to the component twice. Seems hacky and janky to me.

You can access other components within a components styles:

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  color: blue;
`;

const Label = styled.label`
  align-items: center;
  display: flex;
  gap: .25em;
  margin: .25em;
`;

const LabelText = styled.span`
  // When a Checkbox immediately before LabelText is checked
  ${Checkbox}:checked + && {
    color: orange;
  }

  // This also works:
  input[type="checkbox"]:checked + && {
    color: orange;
  }

  // And this also works:
  input:checked + && {
    color: orange;
  }
`;

function Card(props) {
  // props
  const { className } = props;

  return (
    <div>
      <Label>
        <Checkbox defaultChecked />
        <LabelText>Chips</LabelText>
      </Label>
      <Label>
        <Checkbox />
        <LabelText>Pop</LabelText>
      </Label>
      <Label>
        <Checkbox />
        <LabelText>Cheese</LabelText>
      </Label>
    </div>
  );
}

export default Card;
```

> :warning: The bottom line: I'm not sold on this stuff. I think it might work for some situations (like when a css property is linked to state) but I wouldn't want to do all CSS this way. I still think modular and BEM conventions are good for most projects I'll be doing. As an example, even in their docs, there is stuff that doesn't work. Try adding a 'size' prop to an input... is supposed to pass through as an attribute but doesn't. As of this writing, their github has 141 issues.

## Links

See [React faq on styling](https://reactjs.org/docs/faq-styling.html)
See the [classnames](https://github.com/JedWatson/classnames#readme) package
