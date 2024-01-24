# Next.js deployment

See <https://nextjs.org/docs/pages/building-your-application/deploying>

## Table of Contents

<!-- toc -->

- [Build API](#build-api)
- [Using Vercel](#using-vercel)
- [Self Hosting](#self-hosting)
  * [Node.js server](#nodejs-server)
    + [Digitalocean droplet](#digitalocean-droplet)
  * [Docker Image](#docker-image)
  * [Static export](#static-export)
    + [Supported features](#supported-features)
    + [Unsupported features](#unsupported-features)
- [Other services](#other-services)
  * [Digitalocean app platform](#digitalocean-app-platform)
- [Manual graceful shutdowns](#manual-graceful-shutdowns)
- [To investigate](#to-investigate)

<!-- tocstop -->

## Build API

`next build` generates an optimized version of your application for production. The output is generated inside the `.next` folder. All JavaScript code inside `.next` has been compiled and browser bundles have been minified to help achieve the best performance and support all modern browsers.


## Using Vercel 

Vercel is made by the creators of Next.js and has first-class support for Next.js. It is incredibly easy but you pay for that ease. It is known to be **very expensive** when compared to other options. I also read there's no way to set limits on spending which is a huge red flag.

When deploying to Vercel, the platform automatically detects Next.js, runs `next build`, and optimizes the build output for you. This includes:

- Persisting cached assets across deployments if unchanged
- Immutable deployments with a unique URL for every commit
- Pages are automatically statically optimized, if possible
- Assets (JavaScript, CSS, images, fonts) are compressed and served from a Global Edge Network
- API Routes are automatically optimized as isolated Serverless Functions that can scale infinitely
- Middleware is automatically optimized as Edge Functions that have zero cold starts and boot instantly

In addition, Vercel provides features like:

- Automatic performance monitoring with Next.js Speed Insights
- Automatic HTTPS and SSL certificates
- Automatic CI/CD (through GitHub, GitLab, Bitbucket, etc.)
- Support for Environment Variables
- Support for Custom Domains
- Support for Image Optimization with next/image
- Instant global deployments via git push

Again, all this fancy stuff will cost you. I have heard that [Vercel can get very expensive at scale](https://www.youtube.com/watch?v=JiuBeLDSGR0)... were users are getting bills for thousands of dollars.


## Self Hosting

You can self-host Next.js with support for all features using Node.js or Docker. You can also do a Static HTML Export, which has some limitations.

### Node.js server

To use all of its features, Next.js can be deployed to any hosting provider that supports Node.js. This could be something like [AWS EC2](https://aws.amazon.com/ec2/) or a [DigitalOcean Droplet](https://www.digitalocean.com/products/droplets).

In your own hosting provider, run the `build` script once, which builds the production application in the .next folder.

```bash
npm run build
```

After building, the `start` script to start the Node.js server. This server supports all features of Next.js.

```bash
npm run start
```

They say that's it, but obviously there's more. The following Digitalocean guide may provide more insight:

#### Digitalocean droplet

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


### Docker Image

Next.js can be deployed to any hosting provider that supports Docker containers. See [Docker Image](https://nextjs.org/docs/app/building-your-application/deploying#docker-image).

### Static export

A [static export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports) creates a static site or SPA. These can be deployed and hosted on any web server that can serve HTML/CSS/JS static assets.

#### Supported features

The core of Next.js has been designed to support static exports. This includes:

- **Server components** (unless they consume dynamic server functions - see below)
  Server components will run during the build, similar to traditional static-site generation. The resulting component will be rendered into static HTML for the initial page load and a static payload for client navigation between routes.
- **Client components**
  The only thing they say here is that if you're doing data fetching, they want you to use `SWR` because it memoizes requests.
- **`GET` Route handlers** 
  `GET` route handlers will render to a static file during next build. Used to generate static HTML, JSON, TXT, or other files from cached or uncached data. If you need to read dynamic values from the incoming request, you *cannot use a static export*.
- **Browser APIs**
  Client Components are pre-rendered to HTML during next build. Web APIs can then be safely accessed only when running in the browser.

#### Unsupported features

Features that require a Node.js server, or dynamic logic that cannot be computed during the build process, are not supported:

- **Dynamic Routes with `dynamicParams: true`**
- **Dynamic Routes without `generateStaticParams()`**
- **Route Handlers that rely on `Request`**
- **Cookies**
- **Rewrites**
- **Redirects**
- **Headers**
- **Middleware**
- **Incremental Static Regeneration**
- **Image Optimization with the default loader** 
  If you recall the `<Image>` component does a bunch of on-demand optimizations for you on teh server. You can however using an external service by [defining a custom image loader](https://nextjs.org/docs/app/building-your-application/deploying/static-exports#image-optimization). 
- **Draft Mode**

Attempting to use any of these features with `npm run dev` will result in an error (once you've enabled static export).

#### Deploying a static export

To enable a static export, change the output mode inside `next.config.js`:

```javascript
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
 
  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,
 
  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,
 
  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
}
 
module.exports = nextConfig
```

Just run `npm run build`. Next.js will produce an `out` folder which contains the HTML/CSS/JS assets for your application.

Note if you want to test the build `next start` does not work with `output: export`, instead use: 

- `npm run build && npx serve@latest out`

The `nginx.conf` might look something like this:

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

Or...

```
server {
  listen 80;
  server_name acme.com;
 
  root /var/www/out;
 
  location / {
      try_files $uri $uri.html $uri/ =404;
  }
 
  # This is necessary when `trailingSlash: false`.
  # You can omit this when `trailingSlash: true`.
  location /blog/ {
      rewrite ^/blog/(.*)$ /blog/$1.html break;
  }
 
  error_page 404 /404.html;
  location = /404.html {
      internal;
  }
}
```


## Other services 

[Other services](https://nextjs.org/docs/app/building-your-application/deploying#other-services) to deploy your app/site can be broken into three categories: 

- Managed Server
- Static Only
- Serverless

**Managed Server**

A Managed Server refers to a service that provides a server environment and is managed by the service provider. It's meant to be easy.

- AWS Copilot
- Digital Ocean App Platform
- Google Cloud Run
- Heroku
- Railway
- Render

**Static Only**

You can manually deploy the output from `output: 'export'` to any static hosting provider. The following services only support deploying Next.js using output: 'export'.

- GitHub Pages

**Serverless**

Serverless refers to a cloud computing execution model where the cloud provider dynamically manages the allocation and provisioning of servers. Your Next.js application runs in "stateless compute containers that are event-triggered, ephemeral, and fully managed by the cloud provider". Whatever the f* that means.

- AWS Amplify
- Azure Static Web Apps
- Cloudflare Pages
- Firebase
- Netlify
- Terraform
- SST

### Digitalocean app platform 

Using the App Platform is very similar to Vercel. It does most of the work for you. 

You have two options for Next.js apps:

1. [Static export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports): to deploy a static site or app. Can be deployed with the **Starter plan $0/month**.

2. [Custom server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server): to deploy a Node server that can serve pages dynamically or statically. Can be deployed with the **Basic plan $5/month**.

See [Deploy a Next.js App to App Platform](https://docs.digitalocean.com/tutorials/app-nextjs-deploy/) for instructions.

Note that for static exports, you no longer need to run the `export` command as shown in the above tutorial. You only need to `npm run build`. The `output: 'export'` config option should be set in `next.config.js`.


## Streaming and Suspense

The Next.js App Router supports streaming responses when self-hosting. If you are using Nginx or a similar proxy, you will need to configure it to disable buffering to enable streaming.

For example, you can disable buffering in Nginx by setting X-Accel-Buffering to no:
next.config.js

```
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
        ],
      },
    ]
  },
}
```

## To investigate

- [Deploying Next.js with Flask](https://blog.logrocket.com/deploying-next-js-flask/)
