# Client-side Routing


Routing is the mechanism by which requests are connected to some code. Traditionally routing referred to server-side routing. With server-side routing, a user clicks something (e.g. a link) that requests a new page or content from the server, and then the server responds with the new content or document.

The main drawback of server-side routing is the time it can take to display content on a page. Often the page will have sections (e.g. header and footer) that aren't actually changing but get reloaded anyways. The server doesn’t know that we don’t have to reload sections that are already being displayed. The server will simply send a file that needs to be displayed and then call for a full refresh to display it.

Client-side routing simply runs this process in the browser using JavaScript. As the user navigates around the application or website, no full page reloads take place, even when the page's URL changes. Instead, JavaScript is used to update the URL and fetch and display new content.

## Pros

- Because less data is processed, routing between views (pages) is generally faster.
- Smooth transitions and animations between views are easier to implement.

## Cons

- The initial loading time is considerably large as all the routes, components, and HTML have to be loaded when the application first mounts. In other words, the whole website or web app needs to be loaded on the first request.
- This means there is unnecessary data download time for unused views.
- It generally requires an external library, which means more code and more dependency on external packages, unlike server-side routing.
- Client-side routing and rendering converts JavaScript to HTML, making search engine crawling less optimized.

## React Router

With state and events we could simulate client-side routing by simply rendering different 'page' components, however, we would loose access to the browsers forward/backward buttons and the URL would always be the same. This means users couldn't bookmark or copy a link to a specific 'page'.

True client-side routing handles mapping between the URL and content the user is seeing. It also updates the [History Web API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) so that users can navigate backward and forward.

There are many [routing tools](https://github.com/markerikson/react-redux-links/blob/master/react-routing.md) available. [React Router](https://reactrouter.com/docs/en/v6) is one of them. To install:

```
npm install react-router-dom
```

Include and enable the Router in your index.js:

```JavaScript
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';


ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
```

Note there are [other Router types](https://reactrouter.com/docs/en/v6/api) too. For example:

- `<BrowserRouter>` is the recommended interface for running React Router in a web browser.
- `<HashRouter>` is for use in web browsers when the URL should not (or cannot) be sent to the server for some reason
- `<NativeRouter>` is the recommended interface for running React Router in a React Native app.
- `<MemoryRouter>` which stores its locations internally in an array.
- `<StaticRouter>` is used to render a React Router web app in node.

### Define Routes

Define the routes by mapping URLs to components:

```JavaScript
import './App.css';
import { Route, Routes } from 'react-router-dom';
import About from './About';


function App() {
  return (
    <div className="App">
      <h1 className="App-header">React Router demo</h1>
      <Routes>
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}
```

You can also nest routes inside other routes to display both parent and child. To do this, you need to render an `<Outlet />` in the parent component. The <Outlet /> is like a placeholder or marker for where the child components will be rendered. For example:

```javascript
import React, { Component } from 'react';
import { Outlet } from "react-router-dom";


class Dashboard extends Component {

  render() {
    return (
      <div className="Dashboard">
        <h1 className="App-header">Dashboard...</h1>
        <Outlet />
      </div>
    );
  }
}

export default Dashboard;
```

Then in App.js:

```javascript
function App() {
  return (
    <div className="App">
      <h1 className="App-header">React Router demo</h1>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="messages" element={<DashboardMsg />} />
          <Route path="tasks" element={<DashboardTasks />} />
        </Route>

      </Routes>
    </div>
  );
}
```

Now, when I navigate to */dashboard/messages* I will see both the Dashboard component and
the DashboardMsg component. Similarly, */dashboard/tasks* will display Dashboard and DashboardTasks.


### 404 Equivalent

Note that if you navigate to a nonexistent route, you will see the App component but no error. To handle (catch) all other routes do the following:

```JavaScript
<Route path="*" element={<NotFound />}/>
```

The `*` has special meaning here. It will match only when no other routes do.


### Links

The `<Link>` component acts as a replacement for the `<a>` element. This is what enables proper client-side routing instead of a GET request (which reloads the page).

```javascript
import { Route, Routes, Link } from 'react-router-dom';
// ...

function App() {
  return (
    <div className="App">
      <h1 className="App-header">React Router demo</h1>

      <nav>
        <Link to="/">Home</Link>
        <Link to="dashboard">Dashboard</Link>
        <Link to="dashboard/messages">Messages</Link>
        <Link to="dashboard/tasks">Tasks</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="messages" element={<DashboardMsg />} />
          <Route path="tasks" element={<DashboardTasks />} />
        </Route>
      </Routes>
    </div>
  );
}
```

A `<NavLink>` is a special kind of <Link> that knows whether or not it's active. By default, an `active` class is added to a` <NavLink>` component when it is active, so all you need to do is create a style for it. For example:

```css
.App-nav a.active {
  color: tomato;
}
```

```javascript
import { Route, Routes, Link, NavLink } from 'react-router-dom';

// ...

<nav className"App-nav">
  <NavLink to="/">Home</NavLink>
  <NavLink to="dashboard">Dashboard</NavLink>
  <NavLink to="dashboard/messages">Messages</NavLink>
  <NavLink to="dashboard/tasks">Tasks</NavLink>
</nav>
```

If you wanted the active links to be different, you can pass a function to className:

```javascript
<nav className="App-nav">
  <NavLink
    to="/"
    className={({ isActive }) => isActive ? 'active1' : undefined}>
    Home
  </NavLink>
  <NavLink
    to="dashboard"
    className={({ isActive }) => isActive ? 'active2' : undefined}>
    Dashboard
  </NavLink>
  <NavLink
    to="dashboard/messages"
    className={({ isActive }) => isActive ? 'active3' : undefined}>
    Messages
  </NavLink>
  <NavLink
    to="dashboard/tasks"
    className={({ isActive }) => isActive ? 'active4' : undefined}>
    Tasks
  </NavLink>
</nav>
```

You will notice that nested components will show the parent component as active too by default. If you don't want this then add the `end` property to the parent:

```JavaScript
<NavLink
  to="dashboard"
  className={({ isActive }) => isActive ? 'active2' : undefined} end>
  Dashboard
</NavLink>
```


### Passing Props

Passing props into a component is easy:

```javascript
<Route path="/about" element={<About name="13 Down"/>} />
```



Side note: Looks like React Router has hijacked the natural behaviour of `<a>` elements. If you have a number of them side by side and re-size your browser window, they won't wrap at all like inline elements should, and instead behave as if in a fixed width container. FFS!. Setting `display: inline-block;` puts them back to default.

### URL Params
