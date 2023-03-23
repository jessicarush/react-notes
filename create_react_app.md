# Create React App

> :warning: Update (March 17, 2023): As of this writing, with the release of the [new React docs](https://react.dev/learn/start-a-new-react-project), create-react-app has officially fallen out of fashion in favour of frameworks like Next.js, Remix, Gatsby and Expo (for native apps). While the community seems to be using Vite or Parcel to replace create-react-app, there's almost no mention of them in the React docs (Vite it is mentioned once, buried deep within a note where they are still recommending using a framework). 
>
> Just to be clear, I asked ChatGPT to compare Vite.js and Next.js, here's the response:
>
> Sure, I'd be happy to compare Vite.js and Next.js for you!
>
> Vite.js and Next.js are both popular JavaScript tools for modern web development, but they have some key differences in their approach and capabilities.
>
> Vite.js is primarily a build tool and development server, while Next.js is a full-fledged framework for building server-rendered React applications. Here are some of the key differences between the two:
>
> 1. Build Tool vs. Full Framework: As mentioned, Vite.js is a build tool and development server, while Next.js is a full-fledged framework for building server-rendered React applications. This means that Next.js provides many features out-of-the-box, such as server-side rendering, static site generation, API routes, and more, while Vite.js focuses on providing a fast development environment and optimized build process.
>
> 2. Configuration: Vite.js has a simpler and more flexible configuration system compared to Next.js. Vite.js uses a vite.config.js file that allows you to customize various build and development options, while Next.js has a more complex configuration system that requires modifying various files and settings.
>
> 3. Performance: Both Vite.js and Next.js are designed to be fast and performant, but Vite.js is specifically optimized for fast development and hot module reloading, while Next.js is optimized for server-side rendering and static site generation.
>
> 4. Ecosystem: Vite.js and Next.js both have large and active ecosystems, but they focus on different areas. Vite.js is primarily focused on front-end development, while Next.js has a wider focus that includes server-side development and backend integration.
>
> In summary, Vite.js and Next.js are both excellent tools for modern web development, but they have different strengths and use cases. Vite.js is a great choice for front-end development and fast development workflows, while Next.js is a full-fledged framework for building complex server-rendered React applications.

To better understand the React dev teams thought process and future plans for CRA, see [this comment in the react.dev github discussions](https://github.com/reactjs/react.dev/pull/5487#issuecomment-1409720741).


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
- [React version](#react-version)
- [create-react-app version](#create-react-app-version)
- [React scripts](#react-scripts)

<!-- tocstop -->

## Introduction

[Create-react-app](https://create-react-app.dev/docs/getting-started) is a command line utility script that creates a skeleton react project and configures it so that your JS files are run through Babel automatically. It also allows us to use some additional modern JavaScript features and makes testing and deployment much easier.

So far though, my biggest complaint/frustration is that the skeleton project created (specifically the dependency tree in the node_modules directory) is an enormous ≈ 130 MB in size. This, in my opinion, is nuts.


## Install

You need *node* installed on your local machine (it’s not required on the server) in order to install Create React App. To test that it's installed:

```bash
node -v
npm -v
```

If you need to install or upgrade node, go to <https://nodejs.org/en/> or read some of the [other methods here](https://phoenixnap.com/kb/update-node-js-version).

If you need to install or upgrade npm, run ``npm install -g npm``.

If you have npm 5.2 or higher, the library recommends you use `npx` to do the next steps but you can also use `npm`. See [the docs](https://create-react-app.dev/docs/getting-started) for more information.

```bash
npx create-react-app my-app
cd my-app
npm start
```

> NOTE: I've had the issue [described here](https://stackoverflow.com/questions/70358474/error-while-creating-new-react-app-you-are-running-create-react-app-4-0-3-w). Who knows how it happened but the steps of clearing the cache and letting it install again fixed it.

When you start the app you should be able to see it running at:

Local:                   `http://localhost:3000/`  
On your network (e.g.):  `http://10.0.0.2:3000/`  

The page will automatically reload if you make changes to the code and you will see the build errors and lint warnings in the console.

> Note that this development build is not optimized. To create a production build, use `npm run build`.


## Files & Directories

You'll end up with a structure that looks like this:

```text
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

See also: the [folder structure in create-react-app](https://create-react-app.dev/docs/folder-structure).

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
import doSomething from './extras';

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
import { doSomething, doAnother } from './extras';

doSomething();
doAnother();
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
import doSomething, { doAnother } from './extras';

doSomething();
doAnother();
```

Note that in the `... from './extras'`, the `./` indicates that the module is located in the same directory as this file. If you were to exclude the `./`, the import would be looking for the module in the `node_modules` directory which is why, for example, we see React importing from just `'react'`.

## Conventions

- each component should go in a separate file
- the file name should match the component name: e.g. `src/Message.js` should contain `function Message` or `class Message`
- css files should also be component-specific and named to match, e.g. `src/Message.css`
- file names and component names should be capitalized.
- class components should extend `Component` which is imported from `'react'`
- `App.js` should be your final top-level component and this should be imported into `index.js`


### CSS and image assets

As mentioned above, css should be component-specific and saved with the same name as the component in the `src` directory. In the component file, you then import the css like it was a module. for example:

*Message.js:*

```javascript
import React, { Component } from 'react';
import './Message.css';
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

If you want to rename the app root folder (i.e. `myapp` from `npx create-react-app my-app`), rather than renaming the folder in your os gui, use the command line `mv my-app new_name`. 

You can also manually rename the folder, then update then manually update the name in `package.json`, `package-lock.json`.


## React version

Note you can see what React version is installed by looking at the `package.json` or by running the following command:

```bash
npm view react version
```


## create-react-app version 

Note that using `npx create-react-app myapp`, will always use the latest version of create-react-app. Once run, you can see the version number by looking at the `"react-scripts": "^5.0.0",` line. You can verify the version number by going to the [CHANGELOG](https://github.com/facebook/create-react-app/blob/main/CHANGELOG.md) in the create-react-app github repo.

You can also make sure you've got the latest by running:

```
npm install react-scripts@latest
```


## React scripts

Create-react-app installs the following scripts:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

This allows us to run `npm start` for running the app during development, `npm run build` for creating the optimized build version, `npm test` for running tests in `App.test.js` and `npm run eject` is an advanced operation that allows you to customize the configuration under Create-react-app (e.g. webpack and babel).

Note you can omit 'run' from `npm start` and `npm test`.

See also: [available scripts for create-react-app](https://create-react-app.dev/docs/available-scripts)
