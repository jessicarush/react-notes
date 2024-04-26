# Transitions with react-transition-group

[React Transition Group](https://reactcommunity.org/react-transition-group/) is a library that allows you to add animation on a component or multiple components' entrance and exit. It does NOT do the animation for you, that is it does not provide the animation. It facilitates adding the animation either through CSS classes or styles when a component enters or exits.

```bash
npm install react-transition-group
```

## Table of Contents

<!-- toc -->

- [Transition](#transition)
- [CSSTransition](#csstransition)
- [TransitionGroup](#transitiongroup)
- [Transitioning routes](#transitioning-routes)
- [Page transitions in Next.js](#page-transitions-in-nextjs)

<!-- tocstop -->

## Transition 

I could not get the [Transition](http://reactcommunity.org/react-transition-group/transition) component to work well at all. For example, you're are supposed to be able to add `unmountOnExit` 
as an option. They say:

> By default the child component stays mounted after it reaches the 'exited' state. Set unmountOnExit if you'd prefer to unmount the component after it finishes exiting.

However, when I add this flag, it breaks the opacity transition. Not sure what this is actually good for and **I would avoid**.

```javascript
import React, { useState, useRef } from 'react';
import { Transition } from 'react-transition-group';
import { Button } from './Button';


function TransitionDemo() {
  const [inProp, setInProp] = useState(false);
  const nodeRef = useRef(null);

  return (
    <>
      <Transition nodeRef={nodeRef} in={inProp} timeout={300}>
          {state => (
            <p style={{
              ...defaultStyles,
              ...transitionStyles[state]
            }}>Transition example</p>
          )}
        </Transition>

        <Button onClick={() => setInProp(!inProp)}>
          {inProp ? 'Hide' : 'Show'} element using Transition
        </Button>
    </>
  );
}

const defaultStyles = {
  transition: `opacity .3s ease-in-out`,
  opacity: 0
}

const transitionStyles = {
  entering: {
    opacity: 1
  },
  entered: {
    opacity: 1
  },
  exiting: {
    opacity: 0
  },
  exited: {
    opacity: 0
  }
};

export default TransitionDemo;
```

## CSSTransition

The [CSSTransition](http://reactcommunity.org/react-transition-group/css-transition) seems to work better for CSS transitions.

```javascript
import React, { useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Button } from './Button';
import './CSSTransitionDemo.css';


function CSSTransitionDemo() {
  const [showMessage, setShowMessage] = useState(false);
  const nodeRef = useRef(null);

  return (
    <>
      <CSSTransition
        nodeRef={nodeRef}
        in={showMessage}
        timeout={300}
        classNames="example"
        unmountOnExit
        onEnter={() => console.log('enter')}
        onEntering={() => console.log('entering')}
        onEntered={() => console.log('entered')}
        onExit={() => console.log('exit')}
        onExiting={() => console.log('exiting')}
        onExited={() => console.log('exited')}
        >
          <div ref={nodeRef}>
            <p>I'll receive example-* classes.</p>
          </div>
      </CSSTransition>

      <Button onClick={() => setShowMessage(sm => !sm)}>
        {showMessage ? 'Hide' : 'Show'} element using CSSTransition
      </Button>
    </>
  );
}

export default CSSTransitionDemo;
```

Then in my CSS:

```css
.example-enter {
  opacity: 0;
  transform: scale(.75);
}
.example-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity .3s, transform .3s;
}
.example-exit {
  opacity: 1;
}
.example-exit-active {
  opacity: 0;
  transform: scale(.75);
  transition: opacity .3s, transform .3s;
}
```

If you want to do this with `styled-components`:

```javascript
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import { Button } from './Button';
// import './CSSTransitionDemo.css';


function CSSTransitionDemo() {
  const [showMessage, setShowMessage] = useState(false);
  const nodeRef = useRef(null);

  return (
    <>
      <CSSTransition
        nodeRef={nodeRef}
        in={showMessage}
        timeout={300}
        classNames="example"
        unmountOnExit
        onEnter={() => console.log('enter')}
        onEntering={() => console.log('entering')}
        onEntered={() => console.log('entered')}
        onExit={() => console.log('exit')}
        onExiting={() => console.log('exiting')}
        onExited={() => console.log('exited')}
        >
          <Wrapper ref={nodeRef}>
            <p>I'll receive example-* classes.</p>
          </Wrapper>
      </CSSTransition>

      <Button onClick={() => setShowMessage(sm => !sm)}>
        {showMessage ? 'Hide' : 'Show'} element using CSSTransition
      </Button>
    </>
  );
}

const Wrapper = styled.div`
  border: solid 1px yellow;

  &.example-enter {
    opacity: 0;
    transform: scale(.75);
  }
  &.example-enter-active {
    opacity: 1;
    transform: scale(1);
    transition: opacity .3s, transform .3s;
  }
  &.example-exit {
    opacity: 1;
  }
  &.example-exit-active {
    opacity: 0;
    transform: scale(.75);
    transition: opacity .3s, transform .3s;
  }
`;

export default CSSTransitionDemo;
```

> *-active classes represent which styles you want to animate to, so it's important to add transition declaration only to them, otherwise transitions might not behave as intended! This might not be obvious when the transitions are symmetrical, i.e. when *-enter-active is the same as *-exit, like in the example above (minus transition), but it becomes apparent in more complex transitions.

Note if you are wrapping a `CSSTransition` around your own component, you will need to do some extra work to pass the `ref` to the outermost element in your component. Specifically, you'll need to use the [forwardRef](https://react.dev/reference/react/forwardRef) function. 

For example:

```javascript
import React, { useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Button } from './Button';
import Modal from './Modal';
import './ModalTransitionDemo.css';

function ModalTransitionDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const nodeRef = useRef(null);

  const showModal = () => {
    setModalOpen(true);
  };

  const hideModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Button onClick={showModal}>Open modal</Button>

      <CSSTransition
        nodeRef={nodeRef}
        in={modalOpen}
        timeout={300}
        classNames="Modal"
        unmountOnExit
        onEnter={() => console.log('entered')}
        onExited={() => console.log('exited')}>

        <Modal ref={nodeRef} hideModal={hideModal}>
          <p>my awesome modal</p>
        </Modal>

      </CSSTransition>
    </>
  );
}

export default ModalTransitionDemo;
```

In my Modal component:

```javascript
import React, { forwardRef } from 'react';

// ...

const Modal = forwardRef(function Modal(props, ref) {
  const { color, hideModal, children } = props;

  const handleHideModal = () => {
    hideModal();
  };

  return (
    <Wrapper ref={ref} onClick={handleHideModal}>
      {/* stopPropagation is used to prevent handleToggleModal from firing */}
      <Content onClick={(e) => e.stopPropagation()}>
        {children}
      </Content>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  // ...
`;

const Content = styled.div`
  // ...
`;

export default Modal;
```

## TransitionGroup

> The `<TransitionGroup>` component manages a set of transition components (`<Transition>` and `<CSSTransition>`) in a list. Like with the transition components, `<TransitionGroup>` is a state machine for managing the mounting and unmounting of components over time.

Basically, if you want to create a bunch of transitions dynamically using `map()`, they need to be wrapped in a `<TransitionGroup>`.

```javascript
import React, { useState, createRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuid } from 'uuid';

import { Button } from './Button';
import './TransitionGroupDemo.css'

function TransitionGroupDemo() {
  const [items, setItems] = useState(defaultItems);

  return (
    <div>
      <ul>
        <TransitionGroup>

        {items.map((item) => (
          <CSSTransition
            key={item.id}
            nodeRef={item.nodeRef}
            timeout={500}
            classNames="item"
          >
          <li key={item.id} ref={item.nodeRef}>
            <Button
              onClick={() =>
                setItems((items) => items.filter((i) => i.id !== item.id))
              }>
              ✕
            </Button>
            {item.text}
          </li>
          </CSSTransition>
        ))}

        </TransitionGroup>
      </ul>

      <Button
        onClick={() => {
          const text = prompt('Enter some text');
          if (text) {
            setItems((items) => [
              ...items,
              {
                id: uuid(),
                text,
                nodeRef: createRef(null),
              },
            ]);
          }
        }}
      >
        Add Item
      </Button>
    </div>
  );
}

const defaultItems = [
  { id: uuid(), text: 'Buy eggs', nodeRef: createRef(null) },
  { id: uuid(), text: 'Pay bills', nodeRef: createRef(null) },
  { id: uuid(), text: 'Fix thing', nodeRef: createRef(null) }
];

export default TransitionGroupDemo;
```

My css:

```css
.item-enter {
  opacity: 0;
  height: 0em;
}
.item-enter-active {
  opacity: 1;
  height: 2em;
  transition: opacity 500ms ease-in-out, height 500ms ease-in-out;
}
.item-exit {
  opacity: 1;
  height: 2em;
}
.item-exit-active {
  opacity: 0;
  height: 0em;
  transition: opacity 500ms ease-in-out, height 500ms ease-in-out;
}
```


## Transitioning routes

- See this [stackoverflow](https://stackoverflow.com/questions/61089053/animating-route-transitions-with-csstransitiongroup-and-react-router-v6)
- See this [working codesandbox](https://codesandbox.io/s/animated-routes-demo-react-router-v6-6l1li?fontsize=14&hidenavigation=1&theme=dark&file=/src/main.css:88-713)
- See [this video](https://www.youtube.com/watch?v=BZRyIOrWfHU) for debugging tips

Note that the page transition doesn't seem to work well out of the box when you are scrolled down the page at the time of transition.

Fix it by ensuring each route component is absolutely positioned like so:

```css
.page-transition-helper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
```

I just wrapped a new div with this class around the rendered content of each route-level component. This trick is also supposed to fix the temporary double vertical scroll-bars you will sometimes see between transitions. It didn't work for me though. In order to fix, I had to make sure the first container child of the page-transition-helper had the following css:

```css
.MyComponent {
  height: 100vh;
  overflow-x: hidden;
}
```

As far as the actual transitions:

```css
/*
The following class-endings: *-enter, *-enter-active, *-exit, *-exit-active,
have very specific meanings to <CSSTransition />
(see more: https://reactcommunity.org/react-transition-group/css-transition)
*/

.fade-enter {
  opacity: 0;
  z-index: 9999;
}
.fade-enter.fade-enter-active {
  opacity: 1;
  transition: opacity 400ms ease-out;
}
.fade-exit {
  opacity: 1;
}
.fade-exit.fade-exit-active {
  opacity: 0;
  transition: opacity 400ms ease-out;
}
```

Note the `z-index: 9999`. You shouldn't normally have to do this but I was working with MUI components and they use all kinds of z-index's in their stuff [as described here](https://mui.com/customization/z-index/).

Tip: to help debug and ensure components are lying on top of each other, disable the actual css transitions but increase the `CSSTransition` timeout to see how things are lining up.

```javascript
<CSSTransition key={location.key} classNames="fade" timeout={10000}>
  {/* ... */}
```

Doing this may help visualize some other things too, for example you may decide to ensure each component has a background color for smoother overall transitions.

Lastly, [this git commit](https://github.com/jessicarush/colour-app/commit/7183725387a60b24d268760cfd463601b2b7ae97) shows the changes made to implement page transitions. The commit after that one refactors the `page-transition-helper` wrapper div into its own component.

## Page transitions in Next.js

- [How to Add Page Transitions in NextJs 14](https://www.youtube.com/watch?v=jVU3JD6qOBo)