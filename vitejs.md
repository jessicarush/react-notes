# Vite

[Vite.js](https://vitejs.dev/) is a build tool and development server designed for modern web development. It was created by Evan You, the creator of [Vue.js](https://vuejs.org/).

Vite.js aims to improve the development experience for web developers by providing a fast and efficient development environment. It uses a new approach to build tools called "module streaming" that allows for fast development and hot module reloading without the need for a full rebuild.

Vite.js supports a wide range of front-end technologies, including JavaScript, TypeScript, JSX, Vue.js, React, and more. It also supports a variety of plugins that can be used to add features such as CSS preprocessing, code minification, and bundling.

Vite.js can be used to generate a production build of your application. In fact, Vite.js is designed to make it easy to generate a performant and optimized production build of your application.

When you run the `npm run build` command in a Vite.js project, it will create a production-ready build of your application. Vite.js uses [Rollup.js](https://rollupjs.org/) under the hood to perform the actual bundling and code splitting.

During the production build process, Vite.js will automatically apply various optimizations to your code, such as minification, dead code elimination, and tree shaking. This helps to reduce the size of your application and improve its performance.

Overall, Vite.js is a great choice for both development and production use. Its fast and efficient development server makes it easy to develop and test your application, while its optimized production build process ensures that your application is performant and efficient in production.

## Table of contents

<!-- toc -->

- [Start a new Vite project](#start-a-new-vite-project)
- [Differences to note](#differences-to-note)
- [Build](#build)

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

Both `npm create vite@latest` and `npm init vite` can be used to initialize a new project however, the former is the recommended method according to the Vite docs. The `create` command is part of teh new npm init feature that allows you to create a new project with a specific package without needing to install it globally. 

You can also use the single line command:

```bash
npm create vite@latest my-project --template react
```

Ask ChatGPT or phind for steps to migrate a CRA project to Vite. 

## Set up ESlint 

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


## Differences to note

Vite uses `.jsx` extentions instead of `.js`.

Vite has a [vite.config.js](https://vitejs.dev/config/) file.

## Build 

<https://vitejs.dev/guide/cli.html#vite-build>

```bash
vite build
# or 
npm run build
```
