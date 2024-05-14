# Using SVGs in React 

There are a few ways to use an SVG in a React app:

- Use the svg as a regular image
- Import the svg as a component via bundler magic
- Include the svg directly as JSX

## Table of Contents

<!-- toc -->

- [SVG placed as a regular image](#svg-placed-as-a-regular-image)
- [SVG imported as a component](#svg-imported-as-a-component)
- [SVG included as JSX](#svg-included-as-jsx)

<!-- tocstop -->

## SVG placed as a regular image 

SVGs can be used as an image, so we can treat them as any other image resource:

```Javascript
import eyeIcon from './icons/eye.svg';

// ...

<img src={eyeIcon} alt="SVG as an image" />
```

Use case: Simple replacement for raster images that don't need customization


## SVG imported as a component

[SVGR](https://github.com/gregberge/svgr) is the library that powers this ability. Setting it up could be a little hairy but thankfully many popular tools like Create React App support this feature out of the box.

```Javascript
import { ReactComponent as EyeIcon } from './icons/eye.svg';

// ...

<EyeIcon />
```

To do this in Next.js, we have to install a package:

```bash
npm install @svgr/webpack --save-dev
```

Conigure Next.js to use it:

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/, 
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;
```

Then import and use:

```jsx
import Logo from '@/public/logo.svg';
// Usage in JSX
<Logo />
```

Use case: A custom SVG icon library


## SVG included as JSX 

JSX supports all SVG tags. We can paste the SVG directly into our React components, but we may need to adjust some attributes to use JSX syntax (e.g stroke-width -> strokeWidth). This process may or may not be straightforward.

For example, with the following svg file:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><defs><style>.fa-secondary{opacity:.4}</style></defs><path class="fa-primary" d="M224 256C259.3 256 288 227.3 288 192C288 180.5 284.1 169.7 279.6 160.4C282.4 160.1 285.2 160 288 160C341 160 384 202.1 384 256C384 309 341 352 288 352C234.1 352 192 309 192 256C192 253.2 192.1 250.4 192.4 247.6C201.7 252.1 212.5 256 224 256z"/><path class="fa-secondary" d="M95.42 112.6C142.5 68.84 207.2 32 288 32C368.8 32 433.5 68.84 480.6 112.6C527.4 156 558.7 207.1 573.5 243.7C576.8 251.6 576.8 260.4 573.5 268.3C558.7 304 527.4 355.1 480.6 399.4C433.5 443.2 368.8 480 288 480C207.2 480 142.5 443.2 95.42 399.4C48.62 355.1 17.34 304 2.461 268.3C-.8205 260.4-.8205 251.6 2.461 243.7C17.34 207.1 48.62 156 95.42 112.6V112.6zM288 400C367.5 400 432 335.5 432 256C432 176.5 367.5 112 288 112C208.5 112 144 176.5 144 256C144 335.5 208.5 400 288 400z"/></svg>
```

To work in JSX I would have to:

- replace `<!-- -->` comments with `{/* */}`
- change `class` to `className`
- wrap style declaration in `{''}` – not actually sure if this is correct but it seems to work

```Javascript
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
  {/* Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}
  <defs>
    <style>{'.fa-secondary{opacity:.4}'}</style>
  </defs>
  <path className="fa-primary" d="M224 256C259.3 256 288 227.3 288 192C288 180.5 284.1 169.7 279.6 160.4C282.4 160.1 285.2 160 288 160C341 160 384 202.1 384 256C384 309 341 352 288 352C234.1 352 192 309 192 256C192 253.2 192.1 250.4 192.4 247.6C201.7 252.1 212.5 256 224 256z"/>
  <path className="fa-secondary" d="M95.42 112.6C142.5 68.84 207.2 32 288 32C368.8 32 433.5 68.84 480.6 112.6C527.4 156 558.7 207.1 573.5 243.7C576.8 251.6 576.8 260.4 573.5 268.3C558.7 304 527.4 355.1 480.6 399.4C433.5 443.2 368.8 480 288 480C207.2 480 142.5 443.2 95.42 399.4C48.62 355.1 17.34 304 2.461 268.3C-.8205 260.4-.8205 251.6 2.461 243.7C17.34 207.1 48.62 156 95.42 112.6V112.6zM288 400C367.5 400 432 335.5 432 256C432 176.5 367.5 112 288 112C208.5 112 144 176.5 144 256C144 335.5 208.5 400 288 400z"/>
</svg>
```

Here's another example of original svg:

```html
<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M556.01602 769.767264l453.883943-454.93226c18.798868-18.797098 18.798868-49.373591 0.008854-68.167148-9.057669-9.054127-21.159352-14.042485-34.080917-14.042485s-25.023249 4.988358-34.082688 14.044256L511.467873 687.601901 82.146769 246.561608c-8.95142-8.94965-21.054874-13.938008-33.972898-13.938008-12.919795 0-25.023249 4.988358-34.082688 14.044256-18.786473 18.791785-18.786473 49.368279 0 68.156523l452.562922 454.652473c10.723996 9.19225 25.28887 21.563095 38.55043 21.559553 1.156336 0 2.30913-0.093853 3.424737-0.279787l2.103717-0.348849 2.078925 0.462181c1.514038 0.336453 3.102451 0.504679 4.720967 0.504679 10.879827 0.001771 24.546902-7.672899 38.483139-21.607365z"  /></svg>
```

In this case I would have to convert the style attribute from a string to a mapping of properties for JSX:

```JavaScript
<svg
  className="svg-icon"
  style={{
    width: '1em',
    height: '1em',
    verticalAlign: 'middle',
    overflow: 'hidden'
  }}
  viewBox="0 0 1024 1024"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg">
  <path d="M556.01602 769.767264l453.883943-454.93226c18.798868-18.797098 18.798868-49.373591 0.008854-68.167148-9.057669-9.054127-21.159352-14.042485-34.080917-14.042485s-25.023249 4.988358-34.082688 14.044256L511.467873 687.601901 82.146769 246.561608c-8.95142-8.94965-21.054874-13.938008-33.972898-13.938008-12.919795 0-25.023249 4.988358-34.082688 14.044256-18.786473 18.791785-18.786473 49.368279 0 68.156523l452.562922 454.652473c10.723996 9.19225 25.28887 21.563095 38.55043 21.559553 1.156336 0 2.30913-0.093853 3.424737-0.279787l2.103717-0.348849 2.078925 0.462181c1.514038 0.336453 3.102451 0.504679 4.720967 0.504679 10.879827 0.001771 24.546902-7.672899 38.483139-21.607365z" />
</svg>
```

Note that I can color the above icon by adding a `fill:` to the styles or with the following css:

```css
.svg-icon path {
  fill: yellow;
}
```

You can use a tool like [SVGR](https://react-svgr.com/playground/) to automatically convert the syntax for you.

Use case: One-off graphics

-----

These notes come from this [sanity.io guide on importing svg files](https://www.sanity.io/guides/import-svg-files-in-react).
