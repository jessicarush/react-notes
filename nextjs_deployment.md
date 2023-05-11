# Next.js deployment

See <https://nextjs.org/docs/pages/building-your-application/deploying>

## Table of Contents

<!-- toc -->

## Deploy to Vercel 

Vercel is made by the creators of Next.js and has first-class support for Next.js. When you deploy your Next.js app to Vercel, the following happens by default:

- Pages that use Static Generation and assets (JS, CSS, images, fonts, etc) will automatically be served from the Vercel Edge Network, which is blazingly fast.
- Pages that use Server-Side Rendering and API routes will automatically become isolated Serverless Functions. This allows page rendering and API requests to scale infinitely.

They also have:

- Ability to add domains 
- Environment variables
- Automatic HTTPS: HTTPS is enabled by default (including custom domains) and doesn't require extra configuration. They auto-renew SSL certificates.
- Automatic preview deployments for pull requests on master/main
- Automatic production deployments for any new push/merge to master/main

Follow the steps for [deploying your Next.js app](https://nextjs.org/learn/basics/deploying-nextjs-app/deploy).

They recommend the **Develop, Preview, Ship** process:

- **Develop**: Code in Next.js and use the Next.js development server running to take advantage of its hot reloading feature.
- **Preview**: Push changes to a branch on GitHub, and Vercel creates a preview deployment that’s available via a URL. You can share this preview URL with others for feedback. In addition to doing code reviews, you can do deployment previews.
- **Ship**: Merged the pull request to main to ship to production.

## Deploy to another provider

You have two options, you can deploy a Next.js app as a static site (some limitations), or with a Node.js server to use all the features.

### Node.js server

To use all of its features, Next.js can be deployed to any hosting provider that supports Node.js. This could be self-hosted or DigitalOcean Droplet.

In your own hosting provider, run the `build` script once, which builds the production application in the .next folder.

```bash
npm run build
```

After building, the `start` script starts a Node.js server that supports hybrid pages, serving both statically generated and server-side rendered pages, and API Routes.

```bash
npm run start
```

They say that's it.

### Static export

A [static export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports) creates a static site or SPA. These can be deployed and hosted on any web server that can serve HTML/CSS/JS static assets.

**Static export Supported Features**

The majority of core Next.js features needed to build a static site are supported, including:

- Dynamic Routes when using getStaticPaths
- Prefetching with `next/link`
- Preloading JavaScript
- Dynamic Imports
- Any styling options (e.g. CSS Modules, styled-jsx)
- Client-side data fetching
- `getStaticProps`
- `getStaticPaths` with `fallback: false`

**Static export Unsupported Features**

Features that require a Node.js server, or dynamic logic that cannot be computed during the build process, are not supported:

- Internationalized Routing
- API Routes
- Rewrites
- Redirects
- Headers
- Middleware
- Incremental Static Regeneration
- `getStaticPaths` with `fallback: true`
- `getStaticPaths` with `fallback: 'blocking'`
- `getServerSideProps`
- Image Optimization (default loader)

Just run `npm run build`. The `nginx.conf` would look something like this:

```
server {
  listen 80;
  server_name acme.com;
 
  root /var/www;
 
  location / {
      try_files /out/index.html =404;
  }
 
  error_page 404 /out/404.html;
  location = /404.html {
      internal;
  }
}
```

### Deploy to Digitalocean 

#### App Platform 

Using the App Platform is very similar to Vercel. It does most of the work for you. 

You have to options for Next.js apps:

1. [Static export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports): to deploy a static site or SPA. Can be deployed with the **Starter plan $0/month**.

2. [Custom server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server): to deploy a Node server that can serve pages dynamically or statically. Can be deployed with the **Basoc plan $5/month**.

See [Deploy a Next.js App to App Platform](https://docs.digitalocean.com/tutorials/app-nextjs-deploy/) for instructions.

Note that for static exports, you no longer need to run the `export` command as shown in the above tutorial. You only need to `npm run build`.

#### Droplet

See [Deploying a Next.js Application on a DigitalOcean Droplet](https://docs.digitalocean.com/developer-center/deploying-a-next.js-application-on-a-digitalocean-droplet/).

Beyond the usual setup, it looks like you would need to install node, npm and nginx:

```
sudo apt install -y nodejs npm nginx
```

Then you'd configure nginx (`/etc/nginx/sites-available/nextjs`) and copy it to `/etc/nginx/sites-enabled/`.

Then you would: 

```
npm install
npm run build
npm run start
```

Then they use [PM2](https://pm2.keymetrics.io/) as the process manager to manage restarting the node server when needed.

## To investigate

- [Deploying Next.js with Flask](https://blog.logrocket.com/deploying-next-js-flask/)

