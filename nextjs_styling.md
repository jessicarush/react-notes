# Styling in Next.js 

## Table of Contents

<!-- toc -->

- [Inline styles](#inline-styles)
- [Global CSS](#global-css)
- [CSS Modules](#css-modules)
- [CSS-in-JS](#css-in-js)
- [Tailwind](#tailwind)
  * [with css variables](#with-css-variables)
- [Fonts](#fonts)

<!-- tocstop -->

## Inline styles 

You can apply css inline as usual:

```javascript
export default function Home() {
  const inlineStyle = {
    background: "#000",
    padding: ".5rem"
  };
  return (
    <main>
      <p style={inlineStyle}>Hello.</p>
    </main>
  );
}
```

## Global CSS

Global styles can be imported into any layout, page, or component inside the app directory, however it's common to place in your app directory and import it into your root layout:

```
app
 ├─about
 │  └─page.js
 ├─contact
 │  └─page.js
 ├─favicon.ico
 ├─globals.css
 ├─layout.js
 ├─page.js
 └─page.module.css
```

app/layout.js

```javascript
// These styles apply to every route in the application
import './globals.css';

// Root Layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
```


## CSS Modules 

CSS Modules locally scope CSS by automatically creating a unique class name. This allows you to use the same class name in different files without worrying about collisions. 

Files should have a `.module.css` extension and can be imported into any file inside the app directory:

```javascript
import styles from './layout.module.css';
 
export default function DashboardLayout({ children }) {
  return <section className={styles.dashboard}>{children}</section>;
}
```

Where `styles.dashboard` is a class in `layout.module.css`:

```css
.dashboard {
  padding: 24px;
}
```

> :warning: with css modules, class names with hyphens will break. The recommendation is to use camelCase instead but you can also use bracket notation instead of dot notation: `<div className={styles['nav-wrapper']}>`.


## CSS-in-JS

Warning: CSS-in-JS libraries which require runtime JavaScript are not currently supported in Server Components. 

The procedure for using `styled-components` or `styled-jsx` is a bit nutty because you have to do all this style registry shit. It seems like they would rather you do css modules.

Install:

```
npm install styled-components
```

Then create a client component "style registry" `app/_lib/registry.js`:

```javascript
'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({ children }) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
```

Then wrap your app with the style registry:

```javascript
import StyledComponentsRegistry from './lib/registry.js';
import './globals.css';

// Root Layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
```

The registry for [styled-jsx](https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-jsx) is a little different.

For me, the main advantage to using styled components is that its easy to implement transitions with [react-transition-group](https://reactcommunity.org/react-transition-group/).


## Tailwind 

Install the Tailwind packages and run the `init` command to generate both the `tailwind.config.js` and `postcss.config.js` files:

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Inside `tailwind.config.js`, add paths to the files that will use Tailwind CSS class names.

You do not need to modify `postcss.config.js`.

Add these to your global.css:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Note: all the above is done automatically if you choose `yes` to tailwind in `npx create-next-app@latest`.

Now you can use tailwind:

```javascript 
export default function Home() {
  return (
    <main>
      <p className='text-3xl font-bold underline'>Testing tailwind</p>
    </main>
  )
}
```

### with css variables

To use css variables in tailwind, set them as usual in `globals.css`:

```css
:root {
  --test-color: tomato;
}

[data-theme="dark"] {
  --test-color: gold;
}
```

Then define them in `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    // ...
  ],
  theme: {
    extend: {
      colors: {
        "test-color": "var(--test-color)",
      }
    },
  },
  plugins: [],
}
```

Then you can use them:

```javascript
export default function Home() {
  return (
    <main>
      <p className='text-test-color'>Testing tailwind</p>
      <p className='bg-test-color'>Testing tailwind</p>
    </main>
  )
}
```

See [tailwind docs on theme](https://tailwindcss.com/docs/theme).


## Fonts

Automatically self-host any Google Font. Fonts are included in the deployment and served from the same domain as your deployment. No requests are sent to Google by the browser.

```javascript
// Import the font you want to use from next/font/google as a function. 
// Next recommends using variable fonts for the performance and flexibility.
// Use an underscore (_) for font names with multiple words.
import { Montserrat, Roboto, Commissioner } from 'next/font/google';
import './globals.css';

// If loading a variable font, you don't need to specify the font weight.
// subsets reduce the size of the font file and improves performance.
// You can find a list of all subsets on the Google Fonts page for your font.
// variable lets you define a css variable name.
const main = Montserrat({ subsets: ['latin'], variable: '--font-main' });

// Some variable fonts have extra axes that can be included. By default,
// only the font weight is included to keep the file size down.
// The possible values of axes depend on the specific font.
const alt = Commissioner({ 
  subsets: ['latin'], 
  axes: ['slnt'], 
  variable: '--font-alt' });

// If you can't use a variable font, you will need to specify a weight here.
// You can specify multiple weights and/or styles by using an array.
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-roboto'
})

// Root Layout. Pass the variables to the html ot body tags.
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${main.variable} ${roboto.variable} ${alt.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
```

You can then reference your variable font names anywhere in your css:

```css
body {
  font-family: var(--font-main);
}
```

Variable font axes can be adjusted like so:

```css
.test_variable_font {
  font-family: var(--font-alt);
  font-size: 3rem;
  /* variable font axis: weight */
  font-weight: 250;
  /* variable font axis: width */
  font-stretch: 193%;
  /* variable font axis: slant */
  font-variation-settings: 'slnt' -5;
  /* variable font axis: italic */
  font-variation-settings: 'ital' -12;
  /* variable font axis: optical size */
  font-variation-settings: 'opsz' 48;
  /* variable font axis: custom */
  font-variation-settings: 'CASL' 0.15;
}
```

- See the list of [all google variable fonts and their axes](https://fonts.google.com/variablefonts#font-families)
- You can also [load local fonts](https://nextjs.org/docs/app/building-your-application/optimizing/fonts#local-fonts)
- See [fonts with tailwind](https://nextjs.org/docs/app/building-your-application/optimizing/fonts#with-tailwind-css)
- See the [Font API reference](https://nextjs.org/docs/app/api-reference/components/font)