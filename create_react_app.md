# Create React App

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Install](#install)
- [Files & Directories](#files--directories)
- [Webpack](#webpack)
- [Modules](#modules)
- [Conventions](#conventions)
  * [CSS and image assets](#css-and-image-assets)
- [Renaming root folder](#renaming-root-folder)

<!-- tocstop -->

## Introduction

Create-react-app is a command line utility script that creates a skeleton react project and configures it so that your JS files are run through Babel automatically. It also allows us to use some additional modern JavaScript features and makes testing and deployment much easier.

So far though, my biggest complaint/frustration is that the skeleton project created (specifically the dependency tree in the node_modules directory) is an enormous ≈ 130 MB in size. This, in my opinion, is nuts.


## Install

You need *node* installed on your local machine (it’s not required on the server) in order to install Create React App. To test that it's installed:

```
node -v
npm -v
```

If you have npm 5.2 or higher, the library recommends you use `npx` to do the next steps but you can also use `npm`. See [the docs](https://create-react-app.dev/docs/getting-started) for more information.

```
npx create-react-app my-app
cd my-app
npm start
```

When you start the app you should be able to see it running at:

Local:                 http://localhost:3000/  
On Your Network (eg):  http://10.0.0.2:3000/  

The page will automatically reload if you make changes to the code and you will see the build errors and lint warnings in the console.

> Note that this development build is not optimized. To create a production build, use `npm run build`.

## Files & Directories

You'll end up with a structure that looks like this:
```
my-app
├─ .gitignore
├─ package-lock.json
├─ package.json
├─ README.md
├─ .git
├─ node_modules
├─ public
│  ├─ favicon.ico
│  ├─ index.html
│  └─ manifest.json
└─ src
    ├─ App.css
    ├─ App.js
    ├─ App.test.js
    ├─ index.css
    ├─ index.js
    ├─ logo.svg
    └─ serviceWorker.js
```

**package-lock.json** - lock file, do not edit directly  
**package.json** - edit as you normally would  
**README.md** - contains notes on the create react app commands that you can run. Edit or delete.  
**node_modules** - contains all of the dependencies  
**src** - this is where we create all our react components and css. Note that `index.css` is meant to be your site-wide css.  
**public** - contains your main `index.html`. They've also got some icon-related files in here and a `robots.txt`  


## Webpack

Create react app is built on top of [webpack](https://webpack.js.org/) which is a JavaScript utility that does a number of things including:
- enables module importing/exporting
- packages and minifies all the css, js and images for the browser (this reduces the number of http requests for a performance boost).
- hot reloading (when you change a source file, it automatically reloads in the browser)
- enables easy testing & deployment

Normally there is a bit of a learning curve for working with webpack. There are a bunch of things to configure etc, but create react app handles most of this for us.


## Modules

Create react app allows the use of ES6 modules see [javascript-notes/modules.md](https://github.com/jessicarush/javascript-notes/blob/master/modules.md). For example:

*extras.js:*
```javascript
function doSomething() {
  console.log('Does something');
}

export default doSomething;
```

*app.js:*
```javascript
import doSomething from './extras'

doSomething();
```

You can also export multiple specific variables:

*extras.js:*
```javascript
function doSomething() {
  console.log('Does something');
}

function doOther() {
  console.log('Does other thing');
}

function doAnother() {
  console.log('Does another thing');
}

export { doSomething, doOther, doAnother };
```

*app.js:*
```javascript
import { doSomething, doAnother } from './extras'

doSomething();
doAnother()
```

Note, you can also mix the two:

*extras.js:*
```javascript
function doSomething() {
  console.log('Does something');
}

function doOther() {
  console.log('Does other thing');
}

function doAnother() {
  console.log('Does another thing');
}

export default doSomething;
export { doOther, doAnother };
```

*app.js:*
```javascript
import doSomething, { doAnother } from './extras'

doSomething();
doAnother()
```

Note that in the `... from './extras'`, the `./` indicates that the module is located in the same directory as this file. If you were to exclude the `./`, the import would be looking for the module in the `node_modules` directory which is why, for example, we see React importing from just `'react'`.

## Conventions

- each component should go in a separate file
- the file name should match the component name, e.g. `src/Message.js` should contain `function Message()` or `class Message`
- css files should also be component-specific and named to match, e.g. `src/Message.css`
- file names and component names should be capitalized.
- class components should extend `Component` which is imported from `'react'`
- `App.js` should be your final top-level component and this should be imported into `index.js`


### CSS and image assets

As mentioned above, css should be component-specific and saved with the same name as the component in the `src` directory. In the component file, you then import the css like it was a module. for example:

*Message.js:*
```javascript
import React, { Component } from 'react';
import `./Message.css`
```

It is also conventional to add a `className` that is the same as the component name to the top-level html element that is being returned. All sub-item styles should be prefixed with this name. For example:

```javascript
class Message extends Component {
  render() {
    return (
      <div className="Message">
        <h1 className="Message-header">{ this.props.title }</h1>
        <p className="Message-body">{ this.props.msg }</p>
      </div>
    );
  }
}
```

Note that when this all gets compiled by create react app, the CSS file will affect the whole app, it will not be contained to only the component where we imported it. It is our selector naming that will restrict the the classes to each component.

Images are also stored in the `src` directory. They can be in their own sub-directory obviously. Again, import them in the same way:

```javascript
import React, { Component } from 'react';
import './Message.css';
import cactus from './img/cactus.jpg';

class Message extends Component {
  render() {
    return (
      <div className="Message">
        <img src={cactus} alt="cactus plant" />
      </div>
    );
  }
}
```

## Renaming root folder

If you want to rename the apps root folder (i.e. `myapp` from `npx create-react-app my-app`) rather than renaming the folder in your os gui, use the command line `mv my-app new_name`.
