# CSS Frameworks in React

## Table of Contents

<!-- toc -->

- [Bootstrap](#bootstrap)
  * [reactstrap](#reactstrap)
- [Material UI](#material-ui)

<!-- tocstop -->

## Bootstrap

<https://getbootstrap.com/docs/5.1/getting-started/introduction/>

Install bootstrap:

```bash
npm install bootstrap
```

Import bootstrap scripts and css in your *index.js:*

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
// ...
```

Then find the components or systems you want to use. If doing a copy/paste, be sure to change all instances of `class` to `className` and `for` to `htmlFor` and close any non-wrapping tags like `<input />` and `<hr />`.

For example: see their [instructions for working with CSS grid here](https://getbootstrap.com/docs/5.1/layout/grid/).


### reactstrap

The [reactstrap](https://reactstrap.github.io/) library basically lets you import pre-made react components that are styled with bootstrap.


## Material UI

Material UI is a library that allows you to import and use customizable, pre-built components in React applications.