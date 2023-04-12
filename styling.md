# Styling React Components

> :warning: When I started learning React, it was all class components. As a result, some of the examples here use class components. I have left them in tact in case I ever have to deal with legacy code. That being said, the concepts are basically the same and when necessary, I've added function component examples as well and/or links to other notes.

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
  * [Theming](#theming)
  * [Styled theming (with additional library styled-theming)](#styled-theming-with-additional-library-styled-theming)
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

To use if/else and string interpolation:

```javascript
class Machine extends React.Component {
  // ...
  let textClassName = 'Machine';

  if (someprop > 0) {
    textClassName += '__win';
  } else {
    textClassName += '__lose';
  }
  render() {
    return (
      <div className="Machine">
        <p className={textClassName}> ... </p>
      </div>
    );
  }
}
```

Using a boolean flag with string interpolation:

```javascript
<div className={`ColorChip ${isActive && '--active'}`}>
</div>
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

Rather than use the ternary operator above, you can also set `defaultProps` like you would with a class component:

```javascript
const Button = styled.button`
  color: ${props => props.color};
  font-size: 1.1em;
  margin: 1em;
  padding: .5em 1em;
  border: 2px solid ${props => props.color};
  // ...
`;

Button.defaultProps = {
  color: 'silver'
}
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

> In most projects, you want to apply a CSS reset and a handful of common-sense baseline styles. These are always applied on tags (eg. p, h1), to keep the specificity as low as possible. This is a quality-of-life thing; it's annoying to need to import a Paragraph component when you can could just use a <p> tag with some baseline styles.

Normally you might place all your global styles in `index.css`, but styled-components wants you to use `createGlobalStyle`. The main benefit to this, it seems, would be that it gives you accessing to theme information in your global styles. I'll try to explore this in the next section.

First create a document called, say `globalStyles.js` then: 

```javascript
// globalStyles.js
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  html {
  background-color: #282c34;
  }
  body {
    color: white;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default GlobalStyles;
```

Then at the top of your React component tree, import it and place if before (as a sibling to) the main application component:

```javascript
// App.js 
import GlobalStyles from './globalStyles';
import Content from './components/Content';

// ...
 
function App() {
  return (
    <>
      <GlobalStyles />
      <Wrapper>
        <Content />
      </Wrapper>
    </>
  );
}
 
export default App;
```

That's it.

### Theming

> :star: Note that we can create our own ThemeProvider using contexts in React. See my notes in [contexts.md](contexts.md). That being said, styled-components has its own ThemeProvider which is just a wrapper for the context API.

First, create some themes:

```javascript
// theme.js
const themes = {
  light: {
    colors: {
      background: '#f7f7f7',
      body: '#141517',
      heading: '#000',
      subheading: '#000',
      eyebrow: 'gray'
    }
  },
  dark: {
    colors: {
      background: '#282c34',
      body: '#f0eded',
      heading: '#fff',
      subheading: '#fff',
      eyebrow: 'silver'
    }
  }
}
export default themes;
```

Next, import a `ThemeProvider` and wrap it around the App content:

```javascript
// App.js
import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import themes from './themes';
// ...

function App() {
  const [theme, setTheme] = useState('light');
  const isDarkMode = (theme === 'dark');

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <ThemeProvider theme={isDarkMode ? themes.dark : themes.light}>
      <GlobalStyles />
      <Wrapper>
        {/* The rest of my app */}
        <ThemeSwitch id="theme-switch" toggleTheme={toggleTheme} isDarkMode />
      </Wrapper>
    </ThemeProvider>
  );
}

export default App;
```

Then to access the values:

```javascript
// globalStyles.js
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  html {
  background-color: ${p => p.theme.colors.background};
  transition: background-color .3s;
  }
  body {
    color: ${p => p.theme.colors.body};
    transition: color .3s;
    // ...
  }
`;

export default GlobalStyles;
```

Then in my styled-components:

```javascript
import styled, { css } from 'styled-components';

const Wrapper = styled.h1`
  color: ${p => p.theme.colors.heading};
  transition: color .3s;
  // ...
`;

function Heading(props) {
  return (
    <Wrapper>
      {children}
    </Wrapper>
  );
}

export default Heading;
```

To get access to theme values in a non-styled component:

```javascript
import { useTheme } from "styled-components";

function MyComponent() {
  const theme = useTheme();

  return (
    <div>{theme.colors.body}</div>
  )
}

export default MyComponent;
```

or..

```javascript
import { withTheme } from "styled-components";

function MyComponent(props) {

  return (
    <div>{props.theme.colors.body}</div>
  )
}

export default withTheme(MyComponent);
```

> :pushpin: Note you would want to also save the current theme preference in localStorage so it doesn't reset every time they leave and come back. To do this see examples/styled_components (private repo).


### Styled theming (with additional library styled-theming)

```bash
npm install styled-theming
```

Why the need for this library? According to the developers: 

> Passing CSS values down this way (as shown above) works for a bit. But when you start using this in hundreds of places in your app, you'll notice it gets a bit painful. The problem is that we're back to having a separate set of styles that lives at the top of our app in giant objects. And our component styles have tons of lookup functions: `color: ${props => props.theme.buttonDefaultColor};`. [Source](https://jamie.build/styled-theming.html) 


Not to mention how cumbersome it gets trying to manage variants:

```javascript
const Button = styled.button`
  color: ${props => {
    if (props.kind === "default") return props.theme.buttonDefaultColor;
    if (props.kind === "primary") return props.theme.buttonPrimaryColor;
    if (props.kind === "success") return props.theme.buttonSuccessColor;
    if (props.kind === "warning") return props.theme.buttonWarningColor;
    if (props.kind === "danger") return props.theme.buttonDangerColor;
  }};
  // ...
`;

Button.defaultProps = {
  kind: "default",
};
```

Instead of all of this, styled-theming tries to reverse the relationship between themes and abstracts all the repetition into helpers. 

styled-theming makes it easier to manage themes by allowing you to declare your themes alongside your components instead of at the top of your app. Instead of passing down values from the root of your app, you pass down names instead.

```javascript
<ThemeProvider theme={{ mode: "light" }}>
```

Then when you declare your components, you can use the `theme` helper:

```javascript
import theme from "styled-theming";

const backgroundColor = theme("mode", {
  light: "#fff",
  dark: "#000",
});

const Button = styled.button`
  background-color: ${backgroundColor};
`;
```

`theme() `is a tiny little function that returns another function which you can use as a value in styled-components. It looks up the correct value using the `theme` prop you provided to `<ThemeProvider>`. You're encouraged to create your own helper functions that wrap `theme()` to make it easier to declare your themes. Just make sure that you're doing as much work as possible ahead of time (or only once).

In addition to the `theme()` function, there's also a `theme.variants() `function to help you declare variantions of the same component based on a prop.

```javascript
import theme from "styled-theming";

const backgroundColor = theme.variants("mode", "kind", {
  default: { light: "#123456", dark: "#123456" },
  primary: { light: "#123456", dark: "#123456" },
  success: { light: "#123456", dark: "#123456" },
  danger: { light: "#123456", dark: "#123456" },
  warning: { light: "#123456", dark: "#123456" },
});

const Button = styled.button`
  background-color: ${backgroundColor};
`;

// Button.propTypes = {
//   kind: PropTypes.oneOf(["default", "primary", ...]),
// };

Button.defaultProps = {
  kind: "default",
};
```

Theming can sometimes happen across multiple dimensions:

- Light vs Dark mode
- Cosy vs Compact spacing
- Accessibility modes

This is why the first parameter to `theme() `and `theme.variants()` exists.

```javascript
theme("mode", {...})
```

This matches against the object that you've passed to `<ThemeProvider>` so you can have multiple of them.

```javascript
theme("mode", { light: ..., dark: ... });
theme("size", { normal: ..., compact: ... });

<ThemeProvider theme={{ mode: 'dark', size: 'compact' }}>
```

## Links

- [React faq on styling](https://reactjs.org/docs/faq-styling.html)  
- [Classnames](https://github.com/JedWatson/classnames#readme) package  
- [styled-components](https://styled-components.com/)  
- [styled-theming](https://github.com/styled-components/styled-theming#readme)  
- [styled-theming blogpost](https://jamie.build/styled-theming.html)  
- [styled-components docs on styled-theming](https://styled-components.com/docs/tooling#styled-theming)

