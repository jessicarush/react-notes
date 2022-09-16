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

[SVGR](https://github.com/gregberge/svgr) is the library that powers this ability. Setting it up could be a little hairy but thankfully many popular frameworks like Create React App support this feature out of the box.

```Javascript
import { ReactComponent as EyeIcon } from './icons/eye.svg';

// ...

<EyeIcon />
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
- wrap style decalration in `{''}` – not actually sure if this is correct but it seems to work

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

Use case: One-off graphics

-----

These notes come from this [sanity.io guide on importing svg files](https://www.sanity.io/guides/import-svg-files-in-react).
