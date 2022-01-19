# Libraries and Packages

A list of react packages/libraries that I've used.


## Table of Contents

<!-- toc -->

- [axios](#axios)
- [uuid](#uuid)
- [react-router-dom](#react-router-dom)
- [Material UI](#material-ui)
- [react-material-ui-form-validator](#react-material-ui-form-validator)
- [chroma.js](#chromajs)
- [react-copy-to-clipboard](#react-copy-to-clipboard)
- [react-form-validator-core](#react-form-validator-core)
- [react-transition-group](#react-transition-group)
- [react-jss](#react-jss)
- [React sortable](#react-sortable)
- [dnd-kit](#dnd-kit)
- [rc-slider](#rc-slider)
- [React color](#react-color)
- [Bootstrap](#bootstrap)
  * [reactstrap](#reactstrap)

<!-- tocstop -->

## axios

```bash
npm install axios
```

[Axios](https://github.com/axios/axios) is a promise-based HTTP client that works both in the browser and in a node js environment. It provides a single API for dealing with *XMLHttpRequests* and node's http interface.

Example:

```javascript
import axios from 'axios';

async axiosDemo() {
    const url = `https://api.github.com/users/${username}`;
    try {
      let response = await axios.get(url);
      // this code won't run until await has finished
      let data = response.data;
    } catch (err) {
      console.log(`Something went wrong: ${err}`);
    }
  }
```

See also: [ajax.md](ajax.md)


## uuid

[uuid](https://www.npmjs.com/package/uuid) is a package for the creation of RFC4122 UUIDs.

```bash
npm install uuid
```

Example:

```javascript
import { v4 as uuid } from 'uuid';

let todos = [
  {id: uuid(), text: 'Water plants'},
  {id: uuid(), text: 'Laundry'}
]
```


## react-router-dom

[React Router](https://reactrouter.com/docs/en/v6) is a client-side routing library that handles mapping between the URL and content the user is seeing. It also updates the [History Web API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) so that users can navigate backward and forward.

```bash
npm install react-router-dom
```

See: [client_side_routing.md](client_side_routing.md)


## Material UI

[Material UI](https://mui.com) is a library that allows you to import and use customizable, [pre-built components]((https://mui.com/components/)) in React applications.

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

Note there are additional installs for working with their svg icons. They also want you to use Roboto and link to their icon font at google fonts.

They also recommend adding the following meta tag for responsive viewport sizing. Note that if using `create-react-app`, this will already be done.

```html
<meta name="viewport" content="initial-scale=1, width=device-width" />
```

Some components are very simple (e.g. Button) and others are a little more involved in that they're modular and will require event handlers. These are pretty well documented though. Use both the [Components](https://mui.com/components/buttons/) and [Component API](https://mui.com/api/button/) sections. The first shows the examples and code, the second explains all the properties.

Things get a little more difficult when it comes to styling and most tutorials out there seem to have out-of-date information. The idea is that you work with themes and then do overrides when needed. Overall the learning curve is steep.

The simplest way to apply custom styles would appear as a one-off customization:

> The easiest way to add style overrides for a one-off situation is to use the sx prop available on all MUI components.

```javascript
<Slider
  defaultValue={30}
  sx={{
    width: 300,
    color: '#000',
  }}
/>
```

Nested components can be styled like:

```javascript
<Slider
  defaultValue={30}
  sx={{
    width: 300,
    color: '#000',
    '& .MuiSlider-thumb': {
      borderRadius: '1px',
    },
  }}
/>
```

You can also use the `className` prop available on each component to override styles.

You can also use the `styled` function:

```javascript
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const SaveButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  backgroundColor: 'rgb(56,193,114)',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: 'rgb(37,157,88)',
  },
  '&:active': {
    backgroundColor: 'rgb(37,157,88)',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
  },
}));
```

Then:

```javascript
<SaveButton size="small" variant="contained">Save</SaveButton>
```

For more information see [How to customize](https://mui.com/customization/how-to-customize/).

Side note, it looks like they are currently working on *MUI Base*, a set of [unstyled components](https://mui.com/customization/unstyled-components/). These could be used to implement a custom design system that is not based on Material Design.


## react-material-ui-form-validator

[react-material-ui-form-validator](https://github.com/NewOldMax/react-material-ui-form-validator) is a validation component for material-ui forms.

```bash
npm install react-material-ui-form-validator
```

Example:

```javascript
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
```

```javascript
<ValidatorForm
  ref="form"
  onSubmit={handleSubmit}
  onError={errors => console.log(errors)}
>
  <TextValidator
    label="Email"
    onChange={handleChange}
    name="email"
    value={email}
    validators={['required', 'isEmail']}
    errorMessages={['this field is required', 'email is not valid']}
  />
  <Button type="submit">Submit</Button>
</ValidatorForm>
```

Looks like this is built off of [react-form-validator-core](https://www.npmjs.com/package/react-form-validator-core). This link provides the list of included validation rules.



## chroma.js

[Chroma.js](https://gka.github.io/chroma.js/#chroma-contrast) is a small zero-dependency JavaScript library (13.5kB) for all kinds of color conversions and color scales.

```bash
npm install chroma-js
```

Example:

```javascript
import chroma from 'chroma-js';

let hexColor = '#eb3d30';
const darkerColor = chroma(hexColor).darken(1.75).hex();  // a30000
const rgb = chroma(hexValue).rgb();  // [235, 61, 48]
const css = chroma(hexValue).css();  // rgb(235,61,48)
```


## react-copy-to-clipboard

[react-copy-to-clipboard](https://github.com/nkbt/react-copy-to-clipboard) is a simple package exposing the copy function.

```bash
npm install react-copy-to-clipboard
```

Example:

```javascript
import {CopyToClipboard} from 'react-copy-to-clipboard';

function ColorChip(props) {
  const color = props.color.value;

  return (
    <CopyToClipboard text={ color }>
      <div className="ColorChip" style={{ background: color }}>
        {/* clicking anywhere in here will copy the color prop to clipboard */}
      </div>
    </CopyToClipboard>
  );
}
```

To additionally trigger a callback:

```javascript
import {CopyToClipboard} from 'react-copy-to-clipboard';

function ColorChip(props) {
  const color = props.color.value;

  function doSomething() {
      // doing something
  }

  return (
    <CopyToClipboard text={ color } onCopy={ doSomething }>
      <div className="ColorChip" style={{ background: color }}>
        {/* clicking anywhere in here will copy the color prop to clipboard */}
      </div>
    </CopyToClipboard>
  );
}
```


## react-form-validator-core

[react-form-validator-core](https://github.com/NewOldMax/react-form-validator-core)

```bash
npm install
```

Example:

```javascript
```


## react-transition-group

[react-transition-group](https://github.com/reactjs/react-transition-group)

```bash
npm install
```

Example:

```javascript
```


## react-jss

[react-jss](https://cssinjs.org/)

```bash
npm install
```

Example:

```javascript
```


## React sortable

[React Sortable](https://github.com/clauderic/react-sortable-hoc)

```bash
npm install
```

Example:

```javascript
```


## dnd-kit

[dnd-kit](https://github.com/clauderic/dnd-kit)

```bash
npm install
```

Example:

```javascript
```


## rc-slider

[rc-slider](https://github.com/react-component/slider) is an under-documented slider component.

```bash
npm install rc-slider
```

Example:

```javascript
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

function Demo(props) {

  return (
    <div>
      <Slider />
      <Range />
    </div>
  )
}
```

*Caution*: It looks like this package is not being maintained. There is a deprecation warning that comes up in the console regarding `findDOMNode is deprecated in StrictMode`. No movement on this open issue <https://github.com/react-component/slider/issues/613>. Also, it is very poorly documented.


## React color

[React Color](https://casesandberg.github.io/react-color/) is a collection of color pickers components like those found in Sketch, Photoshop, Chrome, Github, Twitter, Material Design & more.

```bash
npm install react-color
```

Example:

```javascript
import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

function Demo(props) {
  const [color, setColor] = useState(false);

  const handlePickerChange = (color) => {
    setColor(color.hex);
  };

  return (
    <div>
      <SketchPicker
        color={color}
        onChangeComplete={ handlePickerChange }
      />
    </div>
  )
}
```

Note: the component will not function properly until you have these set up:

1. the components color attribute is set to a state value
2. the onChangeComplete attribute is given a callback that updates said state value


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
