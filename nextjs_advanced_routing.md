# Next.js advanced routing patterns 

The Nextjs App Router provides a set conventions to help you implement more advanced routing patterns. These include:

- **Parallel Routes**: Allow you to simultaneously show two or more pages in the same view that can be navigated independently. You can use them for split views that have their own sub-navigation. E.g. Dashboards.
- **Intercepting Routes**: Allow you to intercept a route and show it in the context of another route. You can use these when keeping the context for the current page is important. E.g. Seeing all tasks while editing one task or expanding a photo in a feed.