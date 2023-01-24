# Responsive Notes

Normally responsiveness would be a CSS discussion, but given the fact that in React we are often working with 3rd party components like those from [Material UI](https://mui.com/), having components be responsive in the way we want them to be can often be practically impossible.

As an example, with Material UI's [drawer component](https://mui.com/components/drawers/#responsive-drawer), there is an option for a temporary drawer, persistent drawer and permanent drawer. The permanent drawer seems to be *not a drawer* at all but in fact a sidebar since it doesn't actually close. Its purpose is to provide a responsive option. The responsive option uses the temporary drawer on small screens and the permanent one on larger screens. But what if I wanted to use the persistent drawer on larger screens. Looks like we are out of luck because the code structure is completely different for these two, making it difficult to conditionally switch classes or parameters. So what can we do?


## Table of Contents

<!-- toc -->

- [Conditionally render different components](#conditionally-render-different-components)
- [React-responsive](#react-responsive)

<!-- tocstop -->

## Conditionally render different components

```javascript
import React from 'react';
import MobileLayout from './MobileLayout';
import DesktopLayout from './DesktopLayout';

function isMobile() {
  // detect if user is on a mobile device
  return true;
}

function Testing(props) {
  return (
    <div className="Testing">
      { isMobile() ? ( <MobileLayout /> ) : ( <DesktopLayout /> )}
    </div>
  );
}


export default Testing;
```

Of course the downside of this approach is that you are duplicating content. This is the exact reason why we prefer to use CSS alone to control responsiveness. That being said, if we could use variables for the actual content, it might be ok.


## React-responsive

The [react-responsive](https://github.com/yocontra/react-responsive) library allows for easy media queries.

```bash
npm install react-responsive --save
```

For example:

```javascript
import { useMediaQuery } from 'react-responsive'

const Example = () => {
  const isDesktop = useMediaQuery({query: '(min-width: 1224px)'})
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })
  const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' })

  return <div>
    <h1>Device Test!</h1>
    {isDesktop && <p>You are a desktop or laptop</p>}
    {isTabletOrMobile && <p>You are a tablet or mobile phone</p>}
    <p>Your are in {isPortrait ? 'portrait' : 'landscape'} orientation</p>
    {isRetina && <p>You have a retina display</p>}
  </div>
}
```

Another example:

```javascript
import { useMediaQuery } from 'react-responsive'

const Desktop = ({ children }) => {
  const isDesktop = useMediaQuery({ minWidth: 992 })
  return isDesktop ? children : null
}
const Tablet = ({ children }) => {
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 })
  return isTablet ? children : null
}
const Mobile = ({ children }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 })
  return isMobile ? children : null
}
const Default = ({ children }) => {
  const isNotMobile = useMediaQuery({ minWidth: 768 })
  return isNotMobile ? children : null
}

const Example = () => (
  <div>
    <Desktop>Desktop or laptop</Desktop>
    <Tablet>Tablet</Tablet>
    <Mobile>Mobile</Mobile>
    <Default>Not mobile (desktop or laptop or tablet)</Default>
  </div>
)

export default Example
```
