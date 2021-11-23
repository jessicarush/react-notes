# Client-side Routing


Routing is the mechanism by which requests are connected to some code. Traditionally routing referred to server-side routing. With server-side routing, a user clicks something (e.g. a link) that requests a new page or content from the server, and then the server responds with the new content or document.

The main drawback of server-side routing is the time it can take to display content on a page. Often the page will have sections (e.g. header and footer) that aren't actually changing but get reloaded anyways. The server doesn’t know that we don’t have to reload sections that are already being displayed. The server will simply send a file that needs to be displayed and then call for a full refresh to display it.

Client-side routing simply runs this process in the browser using JavaScript. As the user navigates around the application or website, no full page reloads take place, even when the page's URL changes. Instead, JavaScript is used to update the URL and fetch and display new content.


## Table of Contents

<!-- toc -->

- [Pros](#pros)
- [Cons](#cons)
- [React Router](#react-router)
  * [Define Routes](#define-routes)
  * [404 Equivalent](#404-equivalent)
  * [Links](#links)
  * [Passing Props](#passing-props)
  * [URL Params](#url-params)
  * [Example: simple form for url params](#example-simple-form-for-url-params)
  * [Redirects](#redirects)
  * [Navigate](#navigate)
  * [Summary notes](#summary-notes)

<!-- tocstop -->

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

```javascript
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

```javascript
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

You can also *nest* routes inside other routes to display both parent and child. To do this, you need to render an `<Outlet />` in the parent component. The <Outlet /> is like a placeholder or marker for where the child components will be rendered. For example:

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

Nested routes build their path by adding to the parent route's path.

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

Note that Links are relative so in the DashboardMsg component:

```javascript
<Link to='.'>current route</Link>
<Link to='..'>parent route</Link>
<Link to='../about'>about route</Link>
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

```javascript
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

Route params give us a way to easily pass in properties where we want the property to be part of the URL. For example, we could create routes manually like this:

```javascript
<Route path="pics/one" element={<Pics id="one" />} />
<Route path="pics/two" element={<Pics id="two" />} />
<Route path="pics/three" element={<Pics id="three" />} />
```

Or we could pass in a URL parameter like this:

```javascript
<Route path="pics/:picId" element={<Pics />} />
```

As of react router v6, to access the parameter in the component, we need to use a *react hook*. To use a *hook* you need to be using a functional component rather than a class component. I could not find a way to get the url parameter in a class component in react router v6.

> Route children components must use react hooks to access the route context, i.e. useParams, useLocation, useNavigate, etc... and therefore must be function components.

For functional components we can use `useParams()` hook (introduced in React Router v5.1, requires React 16.8 or higher).

```javascript
import { useParams } from 'react-router-dom';


function Pics() {
  let urlParams = useParams();
  return (
    <div className="Pics">
      <h1>Pics { urlParams.picId }</h1>
    </div>
  );
}

export default Pics;
```

We can easily work with multiple URL params too. We could pass in a URL parameter like this:

```javascript
<Route path="pics/:picId/:picName" element={<Pics />} />
```

An access them like this:

```javascript
import { useParams } from 'react-router-dom';


function Pics() {
  let urlParams = useParams();
  return (
    <div className="Pics">
      <h1>Pics { urlParams.picId }, { urlParams.picName }</h1>
    </div>
  );
}

export default Pics;
```

Or you can also do this:

```javascript
import { useParams } from 'react-router-dom';


function Pics() {
  let { picId, picName } = useParams();
  return (
    <div className="Pics">
      <h1>Pics { picId }, { picName }</h1>
    </div>
  );
}

export default Pics;
```

If you are looking to have an active link (as described above in Links) for all the urls with a param, you'll need to nest the route. You do not need to add an `<Outlet />` in the component.

```javascript
<Route path="/pics" element={<Pics />}>
  <Route path=":picId/:picName" element={<Pics />} />
</Route>
```

Note if you try to use `useParams()` outside of  functional component, you will get the following error:

> React Hook "useParams" cannot be called at the top level. React Hooks must be called in a React function component or a custom React Hook function. (react-hooks/rules-of-hooks)

In addition to the `useParams()` hook, there is also `useLocation()` and `useNavigate()`. The `useLocation()` hook will give you the current pathname and `useNavigate()` (introduced in React Router v6, replacing useHistory) allows you to go previous, next pages or redirect user to a specific url (see below).

```javascript
import { useParams, useLocation, useNavigate } from 'react-router-dom';


function Pics() {
  let { picId, picName } = useParams();
  let location = useLocation();
  let navigate = useNavigate();
  console.log(location);
  console.log(navigate);
  console.log(npicId, picName);
  return (
    <div className="Pics">
    </div>
  );
}

export default Pics;
```

More on `useNavigate()` below.


### Example: simple form for url params

If we wanted to receive input to pass into the URL params above we could simple use a link and form like so:

```javascript
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class PicInput extends Component {
  constructor(props) {
    super(props);
    this.state = {picId: '', picName: ''};
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }
  render() {
    return (
      <div className="PicInput">
        <h1 className="App-header">Pics input</h1>
        <input
          type='text'
          placeholder='picId'
          name='picId'
          value={this.state.picId}
          onChange={this.handleChange}
        />
        <input
          type='text'
          placeholder='picName'
          name='picName'
          value={this.state.picName}
          onChange={this.handleChange}
        />
        {
         // Note since <Link to> paths are relative, pics/ is automatically
         // added to the start as soon as we start typing in the first field
        }
        <Link to={`${this.state.picId}/${this.state.picName}`}>Go to pic</Link>
      </div>
    );
  }
}
```


### Redirects

React router lets us mimic a traditional server-side redirect. Redirects are useful in form handling (Post/Redirect/Get pattern). That being said, React Router appears to have changed its tune somewhat on client-side redirects:

> Handling Redirects in React Router v6
>
> Our recommendation for redirecting in React Router v6 really doesn't have much to do with React or React Router at all. It is simply this: if you need to redirect, do it on the server before you render any React and send the right status code. That's it.

With server-side redirects, you get:

- better SEO for redirected URLs and
- faster responses from your web server

Read more about [react routers redirect recommendations here](https://gist.github.com/mjackson/b5748add2795ce7448a366ae8f8ae3bb).


### useNavigate, useLocation (formerly withRouter, useHistory)

`useNavigate()` is a new hook introduced in React Router v6. Essentially it allows you to:

- Go to the previous or next pages
- Redirect the user to a specific Url

`useLocation()` is another hook introduced in the 5.1 release which returns the current location object. It's useful any time you need to know the current URL.

So, this was a bit of a shit show to figure out given the changes in React Router from v4 to v6. But basically, the old method of doing something like this was to use `withRouter`... it gave you access to location, and history props by wrapping a rendered component. It seemed pretty convoluted. In v5.1 `withRouter` was deprecated and replaced with `useHistory()` and `useLocation()`. `useHistory()` was then replaced with `useNavigate()` in v6. Thankfully, `useNavigate()` actually simplifies things but of course these are hooks so you need to be using a functional component instead of a class-based component.

Here's examples of each method for comparison:

#### withRouter (deprecated in v6)

```javascript
import { withRouter } from 'react-router-dom';

class Example extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  render () {
    const { match, location, history } = this.props;
    return <p>You are at { location.pathname }</p>;
  }
}

export default withRouter(Example);
```

#### useHistory (also deprecated in v6)

```javascript
import { useHistory, useLocation } from "react-router-dom";

function Example() {
  let history = useHistory();
  let location = useLocation();

  function handleClick() {
    history.push('/home');
  }

  return (
    <div>
      <p>You are at { location.pathname }</p>
      <button onClick={ handleClick }>go home</button>
    </div>
  );
}

export default Example;
```

#### useNavigate (current in v6)

Redirect user to another page with `navigate('/path')` or to the previous page with `navigate(-1)` or next page with `navigate(1)`:

```javascript
import { useNavigate, useLocation } from "react-router-dom";

function Example() {
  let navigate = useNavigate();
  let location = useLocation();

  function handleClick() {
    // redirect to a Url
    navigate('/home');
    // go to the previous page
    // navigate(-1);
    // go to the next page
    // navigate(1);
  }
  return (
    <div>
      <p>You are at { location.pathname }</p>
      <button onClick={ handleClick }>go somewhere</button>
    </div>
  );
}

export default Example;
```


### Navigate

The new `<Navigate>` element in v6 works like a declarative version of the `useNavigate()` hook. It's particularly handy in situations where you need a React element to declare your navigation intent, like `<Route element>`. It also replaces any uses that you had for a `<Redirect>` element in v5 outside of a `<Switch>`.


... TODO


### Misc notes

All `<Route>`s and `<Link>`s inside a `<Routes>` are relative. This leads to leaner and more predictable code in `<Route path>` and `<Link to>`. This means that they automatically build on the parent route's path and URL.
