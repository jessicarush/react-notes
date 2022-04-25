# React Events

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Event Types](#event-types)
- [Event Data](#event-data)
- [this binding](#this-binding)
- [Passing arguments to handlers](#passing-arguments-to-handlers)
- [Naming event handlers](#naming-event-handlers)
- [stopPropagation](#stoppropagation)

<!-- tocstop -->

## Introduction

In React, every JSX element has built-in attributes representing every kind of browser event. They are camel-case and take callback functions as event listeners.

```javascript
<button onClick={this.handleClick}>Click me</button>
```

## Event Types

Any event that can be used in JavaScript exists in React. [See here for the complete list of supported events and related properties](https://reactjs.org/docs/events.html#supported-events).

**Clipboard Events**  
onCopy  
onCut  
onPaste  

**Composition Events**  
onCompositionEnd  
onCompositionStart  
onCompositionUpdate  

**Keyboard Events**  
onKeyDown  
onKeyPress  
onKeyUp  

**Focus Events**  
onFocus  
onBlur  

**Form Events**  
onChange  
onInput  
onInvalid  
onSubmit  

**Mouse Events**  
onClick  
onContextMenu  
onDoubleClick  
onDrag  
onDragEnd  
onDragEnter  
onDragExit  
onDragLeave  
onDragOver  
onDragStart  
onDrop  
onMouseDown  
onMouseEnter  
onMouseLeave  
onMouseMove  
onMouseOut  
onMouseOver  
onMouseUp  

**Pointer Events**  
onPointerDown  
onPointerMove  
onPointerUp  
onPointerCancel  
onGotPointerCapture  
onLostPointerCapture  
onPointerEnter  
onPointerLeave  
onPointerOver  
onPointerOut  

**Selection Events**  
onSelect  

**Touch Events**  
onTouchCancel  
onTouchEnd  
onTouchMove  
onTouchStart  

**UI Events**  
onScroll  

**Wheel Events**  
onWheel  

**Media Events**  
onAbort  
onCanPlay  
onCanPlayThrough  
onDurationChange  
onEmptied  
onEncrypted  
onEnded  
onError  
onLoadedData  
onLoadedMetadata  
onLoadStart  
onPause  
onPlay  
onPlaying  
onProgress  
onRateChanged  
onSeeking  
onStalled  
onSuspend  
onTimeUpdate  
onVolumeChange  
onWaiting  

**Image Events**  
onLoad  
onError  

**Animation Events**  
onAnimationStart  
onAnimationEnd  
onAnimationIteration  

**Transition Events**  
onTransitionEnd  

**Other Events**  
onToggle  


## Event Data

Each category/set of events has one or more [properties](https://reactjs.org/docs/events.html#supported-events) that can be accessed through the event object. For example:

```javascript
class TestComponent extends Component {
  constructor(props) {
    super(props);
  }
  handleKeyUp(e) {
    console.log('Key pressed: ', e.key);
    console.log('Key code: ', e.keyCode);
    console.log('alt key: ', e.altKey);
    console.log('ctrl key: ', e.ctrlKey);
    console.log('shift key: ', e.shiftKey);
    // Key pressed:  D
    // Key code:  68
    // alt key:  false
    // ctrl key:  false
    // shift key:  true
  }
  render() {
    const styles = {};
    return (
      <div className="TestComponent">
        <input onKeyUp={this.handleKeyUp} placeholder="type something" />
      </div>
    );
  }
}
```

You can also access the JavaScript standard `e.target`, `e.target.value`, etc.

## this binding

Because of the way event callbacks are handled by React, in order to use the `this` keyword within a callback function (for example to change state with `this.setState()`), we need to either bind `this` in the constructor or use arrow syntax and babel as discussed in [state.md](state.md).

```javascript
class Button extends Component {
  constructor(props) {
    super(props);
    // we need to bind `this`
    this.handleClick = this.handleClick.bind(this);
  }
  doSomething() {
    console.log('Doing something...');
  }
  handleClick() {
    // since we're using `this` in the callback...
    this.doSomething();
  }
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Click me</button>
      </div>
    );
  }
}
```

You need to be using *create-react-app (babel)* to do it this way. Keep in mind this is not yet a standard but considered *experimental syntax*:

```javascript
class Button extends Component {
  constructor(props) {
    super(props);
  }
  doSomething() {
    console.log('Doing something...');
  }
  // must be using babel to do it this way:
  handleClick = () => {
    this.doSomething();
  }
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Click me</button>
      </div>
    );
  }
}
```

Just to be clear, if you're not referencing `this` in the callback, you don't need to worry about binding.

```javascript
class Button extends Component {
  constructor(props) {
    super(props);
  }
  handleClick() {
    // we're NOT using `this` in the callback...
    console.log('Doing something...');
  }
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Click me</button>
      </div>
    );
  }
}
```

You can also do inline binding, but this is considered less ideal in that a new function is created with every click event. It looks like this:

```javascript
<button onClick={this.handleClick.bind(this)}>Click me</button>
```

## Passing arguments to handlers

If you need to pass arguments to the handler, one quick and dirty way is to use the last inline binding style from above:

```javascript
<button onClick={this.handleClick.bind(this, arg1, arg2)}>Click me</button>
```

If the button (or whatever) were inside a child component, we could pass the whole function as a prop then reference the prop in the child's event attribute:

*ParentComponent.js*

```javascript
<ChildComponent handleClick={this.handleChildClick.bind(this, 'tomato')}/>
```

*ChildComponent.js*

```javascript
<button onClick={this.props.handleClick}>Click me</button>
```

BUT, as mentioned above, inline binding isn't ideal for performance reasons. It's too bad, because the preferred way is a little more lengthy. Basically you have to create a new function that calls the function with the arguments so:

```javascript
class TestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {color: 'tomato'};
    this.handleSetColor1 = this.handleSetColor1.bind(this);
    this.handleSetColor2 = this.handleSetColor2.bind(this);
  }
  setColor(color) {
    this.setState({color: color});
  }
  handleSetColor1() {
    this.setColor('aquamarine');
  }
  handleSetColor2() {
    this.setColor('teal');
  }
  render() {
    const styles = {backgroundColor: this.state.color};
    return (
      <div className="TestComponent" style={styles}>
        <button onClick={this.handleSetColor1}>Click me</button>
        <button onClick={this.handleSetColor2}>Click me</button>
      </div>
    );
  }
}
```

If the event was in the child, it would be the same idea:

*ParentComponent.js*

```javascript
class TestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {color: 'tomato'};
    this.setColor = this.setColor.bind(this);
  }
  setColor(color) {
    this.setState({color: color});
  }
  render() {
    const styles = {backgroundColor: this.state.color};
    return (
      <div className="TestComponent" style={styles}>
        <TestChildComponent setColor={this.setColor} />
      </div>
    );
  }
}
```

*ChildComponent.js*

```javascript
class TestChildComponent extends Component {
  constructor(props) {
    super(props);
    this.handleSetColor = this.handleSetColor.bind(this);
  }
  handleSetColor() {
    this.props.setColor('honeydew');
  }
  render() {
    return (
      <div className="TestChildComponent">
        <button onClick={this.handleSetColor}>Click me</button>
      </div>
    );
  }
}
```

It's no wonder people prefer using inline binding despite the performance penalty.


## Functional components

Regular event handler:

```javascript
function TestComponent() {
  const [color, setColor] = useState('fff');
  const styles = {backgroundColor: color};

  const handleSetColor = () => {
    setColor('tomato');
  };

  return (
    <div className="TestComponent" style={styles}>
      <button onClick={handleSetColor}>Click me</button>
    </div>
  );
}
```

Inline event handler:

```javascript
function TestComponent() {
  const [color, setColor] = useState('fff');
  const styles = {backgroundColor: color};

  const handleSetColor = (e, color) => {
    setColor(color);
  };

  return (
    <div className="TestComponent" style={styles}>
      <button onClick={ e => handleSetColor(e, 'green')}>Click me</button>
    </div>
  );
}
```

Callback event handler:

```javascript
function TestChildComponent() {
  // Passed from parent component
  const {color, setColor} = props;
  const styles = {backgroundColor: color};

  const handleSetColor = () => {
    setColor('purple');
  };

  return (
    <div className="TestComponent" style={styles}>
      <button onClick={handleSetColor}>Click me</button>
    </div>
  );
}
```


## Naming event handlers

Know that React doesn't care how your event handling functions are named but a recommended approach for consistency reasons is this:

- name the parent function according to the action it performs e.g. `removeThing`, `setThing`, `updateThing`, etc.

- name the matching child's event handler the same thing prefixed with `handle` e.g. `handleRemoveThing`, `handleSetThing`, `handleUpdateThing`, etc.

Eventually we should get used to seeing the same patterns in our child components:

```javascript
handleUpdateThing() {
  this.props.updateThing(arg);
}
```

## stopPropagation

Sometimes you will find that you have events triggering when you don't want them to. For example, the code below uses a component from the `react-copy-to-clipboard` library. The `onCopy` event triggers a callback function. If we wanted to have something inside that element that also has an event-related action (e.g. a link), we may want to stop that event from bubbling up. This can be done with `stopPropagation()`:

```javascript
<CopyToClipboard onCopy={ updateCopied }>
  <div className="ColorChip">

    {/* content */}

    <Link to="/" className="info-more" onClick={e => e.stopPropagation()}>
      More
    </Link>
  </div>
</CopyToClipboard>
```

Note that in this particular case, without the `onClick={e => e.stopPropagation()}`, the console will actually give us a warning:

> Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.

