# React Events

## Table of Contents

<!-- toc -->


<!-- tocstop -->

## Introduction

In React, every JSX element has built-in attributes representing every kind of browser event. They are camel-case and take callback functions as event listeners.

```javascript
<button onClick={this.handleClick}>Click me</button>
```

## Event Types

Any event that can be used in JavaScript exists in react. [See here for the complete list of supported events and related properties](https://reactjs.org/docs/events.html#supported-events).

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
onRateCha
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
    )
  }
}
```

## This binding

Because of the way event callbacks are handled by react, in order to use the `this` keyword within a callback function (for example to change state with `this.setState()`), we need to either bind `this` in the constructor or use arrow syntax and babel as discussed in [state.md](state.md).


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

You need to be using *create-react-app (babel)* to do it this way:

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

If you're not referencing `this` in the callback, you don't need to worry about binding.

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
