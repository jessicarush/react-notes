# Styling React Components

## Table of Contents

<!-- toc -->

- [Stylesheet styles](#stylesheet-styles)
- [Conditional Styles](#conditional-styles)
- [Inline Styles](#inline-styles)
- [Setting css variables](#setting-css-variables)
- [CSS-in-JS](#css-in-js)
  * [CSS-in-JS libraries](#css-in-js-libraries)
  * [styled-components](#styled-components)
    + [css helper](#css-helper)
    + [styled helper](#styled-helper)
    + [Attributes](#attributes)
    + [as helper](#as-helper)
    + [pseudo-elements, pseudo-selectors, and nesting...](#pseudo-elements-pseudo-selectors-and-nesting)
    + [1. When possible, use css variables](#1-when-possible-use-css-variables)
    + [2. Single source of Contextual styles](#2-single-source-of-contextual-styles)
    + [3. global styles](#3-global-styles)
  * [Styled themeing](#styled-themeing)
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
- Some native CSS and SCSS features are missing with CSS-in-JS

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

> :lightning: `import styled from 'styled-components/macro';` to see more helpful class names when debugging in the browser dev tools.

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

You can also write it like this:

```javascript
const Button = styled.button`
  color: ${({color}) => color ? color : "silver"};
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid ${({color}) => color ? color : "silver"};
  border-radius: 3px;
  background: transparent;
`;
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

  // '&' is a placeholder for the generated class name
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

#### css helper 

The `css` helper function can be used to generate CSS from a template literal with interpolations. You need to use this if you return a template literal with functions inside an interpolation due to how tagged template literals work in JavaScript. If you're interpolating a string you do not need to use this, only if you're interpolating a function. I couldn't really find a good example of this but here is what it looks like:

```javascript
import styled, { css } from 'styled-components';

const Wrapper = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 200;

  ${p => (p.variant === 'subheading') && css`
    font-size: 1.5rem;
    font-weight: 500;
  `}
`;
```

This syntax also works:

```javascript
const Wrapper = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 200;

  ${({ variant }) => (variant === 'subheading') && css`
    font-size: 1.5rem;
    font-weight: 500;
  `}
`;
```

Technically, works just fine without it but I lose my intellisense and syntax highlighting in vscode.

```javascript
const Wrapper = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 200;

  ${p => (p.variant === 'subheading') && `
    font-size: 1.5rem;
    font-weight: 500;
  `}
`;
```

#### styled helper

You can style an existing simple html component like:

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import './Card.css';

const Button = styled.button`
  color: ${p => p.color ? p.color : "silver"};
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid ${p => p.color ? p.color : "silver"};
  border-radius: 3px;
  background: transparent;

  &:hover {
    color: white;
  }
`;

// A new component based on Button with overrides
const SecondaryButton = styled(Button)`
  color: white;
  background: ${p => p.color ? p.color : "silver"};
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
  color: ${p => p.color ? p.color : "silver"};
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid ${p => p.color ? p.color : "silver"};
  border-radius: 3px;
  background: transparent;

  &:hover {
    color: white;
  }
`;

// A new component based on Button with overrides
const SecondaryButton = styled(Button)`
  color: white;
  background: ${p => p.color ? p.color : "silver"};
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

#### Attributes

Note that with simple html components, any known HTML attribute passed as props will be automatically passed to the DOM:

```javascript
  return (
    <div className={`${className} Card`}>
      <Button color="tomato" value="Submit" disabled>Normal</Button>
    </div>
  );
```

When you are creating s simple html component, you can also pass html attributes to it with `attrs()`:

```javascript
const Checkbox = styled.input.attrs({ type: "checkbox" })`
  color: blue;
`;
```

#### as helper

Every styled-component you create accepts an `as` prop which'll change which HTML element gets used. This can be really handy for headings, where the exact heading level will depend on the circumstance:

```javascript
import styled, { css } from 'styled-components';

// The `h1` here doesn't really matter since it'll always get overwritten!
const Wrapper = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 200;

  ${p => (p.variant === 'subheading') && css`
    font-size: 1.5rem;
    font-weight: 500;
  `}

  ${p => (p.variant === 'eyebrow') && css`
    color: silver;
    font-size: .8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
  `}
`;

function Heading(props) {
  // `level` is a number from 1 to 6, mapping to h1-h6
  const { level, variant, children } = props
  const element = `h${level}`;

  return (
    <Wrapper as={element} variant={variant}>
      {children}
    </Wrapper>
  );
}

export default Heading;
```

Usage:

```javascript
import Heading from './Heading';

function App() {
  return (
    <div className="App">

      <Heading level="2">
        Main heading
      </Heading>
      <Heading level="3" variant="subheading">
        Subheading
      </Heading>
      <Heading level="2" variant="eyebrow">
        Eyebrow heading
      </Heading>

    </div>
  );
}

export default App;
```

Or for buttons and/or links to look the same:

```javascript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';


const Button = styled.button`
  display: inline-block;
  border: solid 2px ${p => p.color ? p.color : 'blueviolet'};
  border-radius: 3px;
  color: white;
  background: ${p => p.color ? p.color : 'blueviolet'};
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  padding: .5em 2em;
  margin: 0;
  text-align: center;
  text-decoration: none;
  transition: filter .3s ease-in-out, transform .3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;

  &:hover,
  &:focus {
    filter: brightness(1.1);
  }

  &:focus {
    outline: 1px dashed gray;
    outline-offset: .2em;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ButtonOutline = styled(Button)`
  color: ${p => p.color ? p.color : 'blueviolet'};
  background: transparent;
`;

export { Button, ButtonOutline };
```

Usage:

```javascript
import { Button, ButtonOutline } from './Button';

function App() {
  return (
    <div className="App">

      <Button>Normal</Button>
      <ButtonOutline>Outline</ButtonOutline>
      <ButtonOutline as="a" href="#" color="tomato">Link Button</ButtonOutline>

    </div>
  );
}

export default App;
```

Reminder, this works because **for simple html components any known HTML attribute passed as props will be automatically passed to the DOM**. In this case the 'href' gets passed automatically.

#### pseudo-elements, pseudo-selectors, and nesting...

The docs day a single ampersand `&` refers to all instances of the component; it is used for applying broad overrides. A more accurate way of saying it is that `&` is a placeholder for the generated class name.

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

  // every Item that is preceded by something with class 'special'
  .special ~ & {
    background: purple;
  }

  // Item is inside something with class 'wrapper'
  .wrapper & {
    background: red;
    color: white;
  }

  // media query
  @media (max-width: 380px) {
    font-size: 1.2em;
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

Apparently "a double ampersand `&&` refers to an instance of the component; this is useful if you're doing conditional styling overrides and don't want a style to apply to all instances of a particular component." This doesn't really make sense to me but other sources seem to say its more about specificity. Using `&&` applies the class to the component twice. Seems hacky and janky to me. But here's the idea:

```javascript
const Wrapper = styled.div`
  p {
    color: blue;
  }
`
const Paragraph = styled.p`
  color: red;
  && {
    color: green;
  }
`;

// Somewhere:
<Wrapper>
  <Paragraph>I will be green!</Paragraph>
</Wrapper>
```

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
  ${Checkbox}:checked + & {
    color: orange;
  }

  // This also works:
  input[type="checkbox"]:checked + & {
    color: orange;
  }

  // And this also works:
  input:checked + & {
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

> :warning: I'm not sold on this stuff yet. I think it might work for some situations (like when a css property is linked to state) but I'm not sure I'd want to do all the CSS this way. I still think modular and BEM conventions are good for most projects I'll be doing. Side note: As of this writing, their github has 141 issues.

That being said, some [better advice for working with styled-component](https://www.joshwcomeau.com/css/styled-components/) takeaways:

#### 1. When possible, use css variables

```javascript
// ❌ This approach is "high-friction". Whenever these values change, 
// styled-components will need to re-generate the class and re-inject 
// it into the document's <head>, which can be a performance liability
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  opacity: ${p => p.opacity};
  background-color: ${p => p.color};
`;

function Modal(props) {
  // props
  const { opacity, color, children } = props;
  return (
    <Wrapper opacity={opacity} color={color}>
      {children}
    </Wrapper>
  );
}

export default Modal;
```

```javascript
// ✅ Do this instead
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  opacity: var(--opacity);
  background-color: var(--color);
`;

function Modal(props) {
  // props
  const { opacity, color, children } = props;
  const styles = {
    '--color': color,
    '--opacity': opacity
  };

  return (
    <Wrapper style={styles}>
      {children}
    </Wrapper>
  );
}

export default Modal;
```

You can even add defaults to css variables:

```javascript
const Wrapper = styled.div`
  opacity: var(--opacity, .5);
  background-color: var(--color, blueviolet);
`;
```

#### 2. Single source of Contextual styles

Assuming we have a basic link component:

```javascript
const TextLink = styled.a`
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
`;
```

Imagine we want to create a contextual style/version of this, specifially: when a `TextLink` is in an `Aside`, some styles are added/replaced. One possible (not good) solution:

```javascript
// ❌ This approach makes is so much harder to determine what's going on.
// When using a TextLink, we would have no idea to look here to find these 
// style overrides.

const Wrapper = styled.aside`
  a {
    color: var(--color-text);
    text-decoration: underline;
  }
`;

const Aside = ({ children }) => {
  return (
    <Wrapper>
      {children}
    </Wrapper>
  );
}

export default Aside;
```

Another (not great) approach:

```javascript
// ❌ This approach is only very slightly better than the above because
// at least we can do a search for TextLink, but this is still a weak design.
// When creating React components, it's important to think of them as "a box"
// with strict boundaries. Ideally, when you create a component, you can trust 
// that the HTML will only be modified from within that component. If any 
// component can "reach in" and overwrite any other component's styles, 
// we don't really have encapsulation at all.

import TextLink from '../TextLink'

const Wrapper = styled.aside`
  ${TextLink} {
    color: var(--color-text);
    text-decoration: underline;
  }
`;

const Aside = ({ children }) => {
  return (
    <Wrapper>
      {children}
    </Wrapper>
  );
}

export default Aside;
```

A better solution in Aside.js:

```javascript
// ✅ With this approach we know, with complete confidence, that all of the 
// styles for a given element are defined in the styled-component itself.

// Export this wrapper
export const Wrapper = styled.aside`
  /* wrapper styles only */
`;

const Aside = ({ children }) => {
  return (
    <Wrapper>
      {children}
    </Wrapper>
  );
};

export default Aside;
```

Then in TextLink.js 

```javascript
// ✅ TextLink is in charge of itself once more: we have a single source of styles.

import { Wrapper as AsideWrapper } from '../Aside'

const TextLink = styled.a`
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);

  ${AsideWrapper} & {
    color: var(--color-text);
    text-decoration: underline;
  }
`;

export default TextLink;
```

When we have two generic components like `Aside` and `TextLink`, this form of “inverted control” makes things nice and predictable. However, there will always be exceptions that make sense to do it the other way. For example, you may have some specific, one-off variants that aren't reused often. There's no need to clutter our component with markup and code that's not used 99% of the time.

For this we could used the composition API `styled()`:

```javascript
// HalloweenPage.js
import TextLink from '../TextLink';

const HalloweenTextLink = styled(TextLink)`
  font-family: 'Spooky Font', cursive;
`;
```

Here we're using the `TextLink` component to produce a new specialized component. Note, there is a tradeoff here: In theory, we might change `TextLink` in a way that silently breaks `HalloweenTextLink`, not even remembering that that component exists.

We wouldn't want to do this with `Aside` because:

- We use `Aside` components all over! It is beneficial to know about those styles whenever we work with `TextLink` because it's a core part of the application
- We want the contextual styles to be applied automatically. We don't want to have to remember to use `AsideTextLink` whenever they need a `TextLink` in an Aside.


#### 3. global styles 

TODO...

> The same can be said for global styles. In most of my projects, I apply a CSS reset and a handful of common-sense baseline styles. These are always applied on tags (eg. p, h1), to keep the specificity as low as possible. This is a quality-of-life thing; it's a little annoying to need to import a Paragraph component when I can use a <p> tag with some baseline styles.





### Styled theming

TODO...

<https://styled-components.com/docs/tooling#styled-theming>

## Links

See [React faq on styling](https://reactjs.org/docs/faq-styling.html)  
See the [classnames](https://github.com/JedWatson/classnames#readme) package
