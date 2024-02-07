# Libraries and Packages

A list of react packages/libraries that I've used.


## Table of Contents

<!-- toc -->

- [axios](#axios)
- [uuid](#uuid)
- [react-router-dom](#react-router-dom)
- [Material UI](#material-ui)
  * [CSS injection order](#css-injection-order)
- [react-material-ui-form-validator](#react-material-ui-form-validator)
- [react-form-validator-core](#react-form-validator-core)
- [chroma.js](#chromajs)
- [react-copy-to-clipboard](#react-copy-to-clipboard)
- [react-transition-group](#react-transition-group)
- [React sortable](#react-sortable)
- [dnd-kit](#dnd-kit)
- [rc-slider](#rc-slider)
- [React color](#react-color)
- [Bootstrap](#bootstrap)
  * [reactstrap](#reactstrap)
- [html2canvas](#html2canvas)
- [jspdf](#jspdf)
- [styled-components](#styled-components)
- [styled-jsx](#styled-jsx)
- [gray-matter](#gray-matter)
- [remark](#remark)
- [date-fns](#date-fns)
- [fuse.js](#fusejs)
- [heroicons](#heroicons)
- [use-debounce](#use-debounce)

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

See also: [axios.md](axios.md)


## uuid

[uuid](https://github.com/uuidjs/uuid) is a package for the creation of RFC4122 UUIDs.

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

[Material UI](https://mui.com) is a library that allows you to import and use customizable, [pre-built components](https://mui.com/components/) in React applications.

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

The simplest way to apply custom styles would appear to be as a one-off customization:

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

For more information see [How to customize](https://mui.com/customization/how-to-customize/) and [Style Library Interoperability](https://mui.com/guides/interoperability/).

Side note, it looks like they are currently working on *MUI Base*, a set of [unstyled components](https://mui.com/customization/unstyled-components/). These could be used to implement a custom design system that is not based on Material Design.

### CSS injection order

Note: Most CSS-in-JS solutions inject their styles at the bottom of the HTML <head>, which gives MUI precedence over your custom styles. To remove the need for !important, you need to change the CSS injection order. To do so, you need to have the StyledEngineProvider with the injectFirst option at the top of your component tree.

```javascript
import * as React from 'react';
import { StyledEngineProvider } from '@mui/material/styles';

export default function GlobalCssPriority() {
  return (
    <StyledEngineProvider injectFirst>
      {/* Your component tree. Now you can override MUI's styles. */}
    </StyledEngineProvider>
  );
}
```


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


## react-form-validator-core

TODO...

[react-form-validator-core](https://github.com/NewOldMax/react-form-validator-core)

```bash
npm install
```

Example:

```javascript
```


## chroma.js

[Chroma.js](https://gka.github.io/chroma.js) is a small zero-dependency JavaScript library (13.5kB) for all kinds of color conversions and color scales.

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


## react-transition-group

[react-transition-group](https://github.com/reactjs/react-transition-group) is a library that exposes simple components useful for defining entering and exiting transitions.

See [transitions.md](transitions.md).

```bash
npm install react-transition-group
```


## React sortable

[React Sortable](https://github.com/clauderic/react-sortable-hoc) is set of higher-order components to turn any list into an animated, sortable list. **Note: this library will soon be dead. Recommended replacement is [dnd-kit](#dnd-kit).**

```bash
npm install react-sortable-hoc
```


## dnd-kit

TODO...

[dnd-kit](https://github.com/clauderic/dnd-kit) is a lightweight, modular, performant, accessible and  extensible drag & drop toolkit for React.

```bash
npm install @dnd-kit/core
npm install @dnd-kit/sortable
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

Note: IMO this component is a little janky looking. Some other ones that look good:

- [react-color-palette](https://github.com/Wondermarin/react-color-palette).
- [react-colorful](https://github.com/omgovich/react-colorful)

Update: Can confirm react-colorful works well and implemented in the same way as above.


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


## html2canvas 

[html2canvas](https://html2canvas.hertzen.com/) lets you take screenshots with JavaScript.

```javascript
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import './App.css';

function App() {

  // Create a Ref to be used to declare an area in the application
  // that is downloadable
  const downloadRef = useRef();

  // Create an event handler to implement logic to download image (jpg, png)
  // Using html2canvas (npm install html2canvas) we can draw the component on a
  // canvas and transform it into an image
  const handleDownloadImage = async () => {
    const element = downloadRef.current;
    const options = {backgroundColor: '#282c34'};
    const canvas = await html2canvas(element, options);
    // const data = canvas.toDataURL('image/jpg');
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');

    if (typeof link.download === 'string') {
      link.href = data;
      // link.download = 'image.jpg';
      link.download = 'demo.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  return (
    <div className="App">

      <div>Not included in the image.</div>
      {/* Add the Ref to the downloadable area */}
      <div ref={downloadRef}>This will be in the image.</div>

      {/* Create a button with event handler */}
      <button type="button" onClick={handleDownloadImage}>
        Save as image
      </button>
    </div>
  );
}

export default App;;
```

## jspdf

[jspdf](https://github.com/parallax/jsPDF) is library to generate PDFs in JavaScript. It can be used with html2canvas shown above to save raster pdfs.

```javascript
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './App.css';

function App() {

  // Create a Ref to be used to declare an area in the application
  // that is downloadable
  const downloadRef = useRef();

  // Create an event handler to implement logic to download a PDF
  // Using html2canvas and jspdf (npm install html2canvas jspdf) we can draw the
  // component on a canvas and transform it into an image, then transform that
  // image into a PDF.
  const handleDownloadPdf = async () => {
    const element = downloadRef.current;
    const options = {backgroundColor: '#282c34'};
    const canvas = await html2canvas(element, options);
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('demo.pdf');
  };

  return (
    <div className="App">

      <div>Not included in the image.</div>
      {/* Add the Ref to the downloadable area */}
      <div ref={downloadRef}>This will be in the image.</div>

      {/* Create a button with event handler */}
      <button type="button" onClick={handleDownloadPdf}>
        Save as PDF
      </button>
    </div>
  );
}

export default App;
```

## styled-components 

[styled-components](https://styled-components.com/) is a library for writing CSS-in-JS.

See [styling.md](styling.md).


## styled-jsx 

[styled-jsx](https://github.com/vercel/styled-jsx) is a CSS-in-JS library built specifically for Next.js.

See [nextjs.md](nextjs.md)


## gray-matter 

[gray-matter](https://github.com/jonschlinkert/gray-matter) is a library for parsing YAML front-matter in documents. 

See *courses/nextjs/next_blog*.


## remark 

[remark](https://github.com/remarkjs/remark) is a tool that transforms markdown with plugins. These plugins can inspect and change your markup.

See *courses/nextjs/next_blog*.


## date-fns 

[date-fns](https://github.com/date-fns/date-fns) is a date utility library that provides a comprehensive toolset for manipulating JavaScript dates in a browser & Node.


## fuse.js 

[fuse.js](https://www.fusejs.io/) is a nice simple library (no dependencies!) for doing fuzzy search. I have a very simple example in `React/examples/next_lazy_loading`.

## heroicons 

[heroicons](https://heroicons.com/) are a set of MIT License hand-crafted SVG icons, by the makers of Tailwind CSS.

The quickest way to use these icons is to simply copy the source for the icon you need from heroicons.com and inline it directly into your HTML:

```html
<svg
  class="h-6 w-6 text-gray-500"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  stroke-width="2"
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  />
</svg>
```

Icon styles are preconfigured to be stylable by setting the color CSS property, either manually or using utility classes like text-gray-500 in a framework like Tailwind CSS.

Otherwise you can install for use with React:

```bash
npm install @heroicons/react
```

Now each icon can be imported individually as a React component:

```tsx
import { CodeBracketIcon } from '@heroicons/react/24/outline';
// import {CodeBracketIcon} from '@heroicons/react/24/solid';
// import {CodeBracketIcon} from '@heroicons/react/20/mini';
// import {CodeBracketIcon} from '@heroicons/react/16/micro';
import styles from './ExampleIcon.module.css';

function ExampleIcon() {
  return (
    <CodeBracketIcon className={styles.icon} />
  );
}
```

- 24x24 outline icons can be imported from` @heroicons/react/24/outline`
- 24x24 solid icons can be imported from `@heroicons/react/24/solid`
- 20x20 solid icons can be imported from `@heroicons/react/20/solid`
- 16x16 solid icons can be imported from `@heroicons/react/16/solid`

Icons use an upper camel case naming convention and are always suffixed with the word Icon.

- [See all icons on heroicons.com](https://heroicons.com)
- [See all the icon import names](https://unpkg.com/browse/@heroicons/react@2.1.1/24/outline/)

## use-debounce 

```bash
npm install use-debounce
```

```jsx
'use client';

import { useDebouncedCallback } from 'use-debounce';

export default function Search() {

  const handleSearch = useDebouncedCallback((term => {
    // ...
  }), 300)

  return (
    <div className="">
      <input onChange={(e => handleSearch(e.target.value))} />
    </div>
  );
}
```
