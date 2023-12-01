# Vite

[Vite.js](https://vitejs.dev/) is a build tool and development server designed for modern web development. It was created by Evan You, the creator of [Vue.js](https://vuejs.org/).

Vite.js aims to improve the development experience for web developers by providing a fast and efficient development environment. It uses a new approach to build tools called "module streaming" that allows for fast development and hot module reloading without the need for a full rebuild.

Vite.js supports a wide range of front-end technologies, including JavaScript, TypeScript, JSX, Vue.js, React, and more. It also supports a variety of plugins that can be used to add features such as CSS preprocessing, code minification, and bundling.

Vite.js can be used to generate a production build of your application. In fact, Vite.js is designed to make it easy to generate a performant and optimized production build of your application.

When you run the `npm run build` command in a Vite.js project, it will create a production-ready build of your application. Vite.js uses [esbuild](https://esbuild.github.io/) in dev and [Rollup.js](https://rollupjs.org/) in production under the hood to perform the actual bundling and code splitting (whereas CRA uses Webpack).

During the production build process, Vite.js will automatically apply various optimizations to your code, such as minification, dead code elimination, and tree shaking. This helps to reduce the size of your application and improve its performance.

Overall, Vite.js is a great choice for both development and production use. Its fast and efficient development server makes it easy to develop and test your application, while its optimized production build process ensures that your application is performant and efficient in production.

## Table of contents

<!-- toc -->

- [Start a new Vite project](#start-a-new-vite-project)
- [Set up ESlint](#set-up-eslint)
- [Working with images](#working-with-images)
- [Import SVGs as components](#import-svgs-as-components)
- [Differences to note](#differences-to-note)
- [Build](#build)
- [Resources](#resources)

<!-- tocstop -->

## Start a new Vite project 

```bash
npm create vite@latest
# answer questions when prompted 
cd project_dir
npm install 
npm run dev 
```

This will launch a development server running at `http://localhost:5173/`.

Both `npm create vite@latest` and `npm init vite` can be used to initialize a new project however, the former is the recommended method according to the Vite docs. The `create` command is part of the new npm init feature that allows you to create a new project with a specific package without needing to install it globally. 

You can also use the single line command:

```bash
npm create vite@latest my-project -- --template react
```

For steps to migrate a CRA project to Vite see: [How to migrate from CRA to Vite](https://github.com/nordcloud/pat-frontend-template/blob/master/docs/CRA_MIGRATION_GUIDE.md)

## Set up ESlint 

> UPDATE [Aug 2, 2023]: looks like Vite is now including an eslintrc.cjs file. This file type is used when running ESLint in JavaScript packages that specify `"type": "module"` in their `package.json`. It looks like it includes all the necessary react stuff. As far as I can tell, you no longer need to add the `.eslintrc` or edit the `vite.config.js` as shown below.

```bash
npm install vite-plugin-eslint --save-dev
npm install eslint --save-dev
npm install eslint-config-react-app --save-dev
touch .eslintrc
```

.eslintrc

```javascript
{
  "extends": [
    "react-app"
  ]
}
```

vite.config.js 

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
});
```

## Working with images 

Images can be placed in the public directory and referenced as normal. If you create a new folder called `img` inside your public dir, you would reference those images like:

```javascript
<img
  src="/img/img1.svg"
  alt="placeholder 1"
/>
```

Note: you should always reference public assets using root absolute path - for example, `public/icon.png` should be referenced in source code as `/icon.png`. Assets in public cannot be imported from JavaScript. When the dist build is created, those images will be left as-is in the img folder.

You can also import images from the `src` directory. In my case, `src/img/`:

```javascript
import img1 from './img/img1.svg';

// ...

<img
  src={img1}
  alt="placeholder 1"
/>
```

When the dist is built, all images will be renamed and placed flat in the assets dir.


## Import SVGs as components

If you want to use SVGs as components in your Vite project:

```jsx
import { ReactComponent as Logo } from './logo.svg'
```

Then install `vite-plugin-svgr` as a dev dependency:

```bash
npm install vite-plugin-svgr --save-dev
```

vite.config.js 
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint(),
    svgr({ svgrOptions: { icon: true } })
  ],
});
```


## Differences to note

Vite uses `.jsx` extensions instead of `.js`.

Vite has a [vite.config.js](https://vitejs.dev/config/) file.


## Build 

<https://vitejs.dev/guide/cli.html#vite-build>

```bash
vite build
# or 
npm run build
```

## Resources 

- [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) - A curated list of awesome things related to Vite.js
- [How to start a React Project in 2023](https://www.robinwieruch.de/react-starter/)
- [How to migrate from CRA to Vite](https://www.robinwieruch.de/vite-create-react-app/)