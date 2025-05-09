# Requests with Axios

> :warning: When I started learning React, it was all class components. As a result, many of the examples here use class components. I have left them in tact in case I ever have to deal with legacy code. That being said, the concepts are basically the same and when necessary, I've added function component examples as well and/or links to other notes.

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Example - GET request](#example---get-request)
- [Example - GET request with param data](#example---get-request-with-param-data)
- [Example - POST request](#example---post-request)
- [Example - axios api](#example---axios-api)
- [Example - Adding a loading animation](#example---adding-a-loading-animation)
- [Example - Using an async function](#example---using-an-async-function)
- [Multiple requests](#multiple-requests)
- [axios in functional components](#axios-in-functional-components)
- [AbortController](#abortcontroller)

<!-- tocstop -->

## Introduction

[Axios](https://github.com/axios/axios) is a promise-based HTTP client that works both in the browser and in a node js environment. It basically provides a single API for dealing with *XMLHttpRequests* and node's http interface. Besides that, it wraps the requests using a polyfill for ES6's new promise syntax.

To use Axios, you'll need to install it:

```bash
npm install axios
```

If you want to fetch data with an asynchronous request, it is **always recommended that you do this in the `componentDidMount()` method** of class components as opposed to the `constructor()`. In addition, you should also always avoid setting state in the constructor.

If working with functional components, use the `useEffect()` hook.


## Example - GET request

This example makes a request to a simple github api. First, make sure to import axios:

```javascript
import axios from 'axios';
```

Then use `axios.get().then()`. Note that the `.then()` is a method of the standard built-in `Promise` object. See [promises.md](https://github.com/jessicarush/javascript-notes/blob/master/promises.md).

```javascript
axios
  .get('/user')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });
```

A working example:

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = { data: '' };
  }

  componentDidMount() {
    const url = 'https://api.github.com/zen';
    // load data
    axios.get(url).then((response) => {
      // view the entire response object
      console.log(response);
      // view the response object keys
      console.log(Object.keys(response));
      // set state with that data
      this.setState({ data: response.data });
    });
  }

  render() {
    return (
      <div>
        <h1>{this.state.data}</h1>
      </div>
    );
  }
}
```

The response keys:

```bash
[ "data", "status", "statusText", "headers", "config", "request" ]
```

Another request:

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorName: '',
      colorHex: ''
    };
  }

  componentDidMount() {
    const url = 'https://log.zebro.id/api/demo_one';
    axios.get(url).then((response) => {
      this.setState({
        colorName: response.data.name,
        colorHex: response.data.value
      });
    });
  }

  render() {
    const style = { color: this.state.colorHex };
    return (
      <div>
        <p style={style}>
          {this.state.colorName} {this.state.colorHex}
        </p>
      </div>
    );
  }
}
```

For reference, the python flask endpoint for this api:

```python
@app.route('/api/demo_one', methods=['GET'])
def api_demo():
    '''Demo API returns a random html color'''
    name, hex = random.choice(list(colors.items()))
    response = jsonify({
      'name': name,
      'value': hex
      })
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
```

Note the `Access-Control-Allow-Origin` header. In order for requests outside the response origin to access the response, this header must be set. `*` is a wildcard allowing any site to receive the response. You should only use this for public APIs. Private APIs should never use `*`, and should instead have a specific domain or domains set. In addition, the wildcard only works for requests made with the crossorigin attribute set to anonymous, and it prevents sending credentials like cookies in requests. [See MDN for more on this](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSMissingAllowOrigin).

For more on CORS see also: [react_with_flask_api.md](react_with_flask_api.md).


## Example - GET request with param data

This example sends query parameters along with the get request:

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorName: '',
      colorHex: ''
    };
  }

  componentDidMount() {
    const url = 'http://127.0.0.1:5000/api/demo_one';
    // Equivalent to "http://127.0.0.1:5000/api/demo_one?value=rgb"
    const config = {
      params: { value: 'rgb' }
    };
    axios.get(url, config).then((response) => {
      this.setState({
         colorName: response.data.name,
        colorHex: response.data.value
      });
    });
  }

  render() {
    const style = { color: this.state.colorHex };
    return (
      <div>
        <h1 style={style}>
          {this.state.colorName} {this.state.colorHex}
        </h1>
      </div>
    );
  }
}
```

## Example - POST request

```javascript
axios
  .post('/user', {
    firstName: 'Fred',
    lastName: 'Flintstone'
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

A working example:

```javascript
function saveColor() {
  const url = '/api/demo_two';
  const data = { name: color.name, hex: color.hex };
  const config = {
    headers: {'Content-Type': 'application/json'}
  };
  axios
    .post(url, data, config)
    .then((response) => {
      console.log(response.data);
    })
    .catch((err) => {
      console.log(`something went wrong: ${err}`);
    });
}
```

## Example - axios api

Instead of using axios `.get()` and `.post()`, you can also use the axios function to pass whatever method you like. For example:

```javascript
axios({
  method: 'post',
  url: 'https://example.com/api/post',
  data: { id: '123' },
  headers: { 'Content-type': 'application/json' }
});
```

## Example - Adding a loading animation

For Ajax requests that may take some time, it's easy to add a loading animation using state.

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      data: ''
    };
  }

  componentDidMount() {
    const url = 'https://api.github.com/zen';
    axios.get(url).then((response) => {
      setTimeout(
        function () {
          this.setState({ data: response.data, isLoaded: true });
        }.bind(this), 3000
      );
    });
  }

  render() {
    return (
      <div>
        {this.state.isLoaded ? <h1>{this.state.data}</h1> : <Loader />}
      </div>
    );
  }
}
```

## Example - Using an async function

```javascript
class GithubUser extends Component {
  constructor(props) {
    super(props);
    this.state = { imgUrl: '', name: '' };
  }

  async componentDidMount() {
    const url = `https://api.github.com/users/${this.props.username}`;
    let response = await axios.get(url);
    // this code won't run until await has finished
    let data = response.data;
    this.setState({ imgUrl: data.avatar_url, name: data.name });
  }

  render() {
    return (
      <div>
        <h1>Github user info</h1>
        <img src={this.state.imgUrl} alt={this.state.name} />
        <p>{this.state.name}</p>
      </div>
    );
  }
}
```

Even better, add try {} and catch {}:

```javascript
class GithubUser extends Component {
  constructor(props) {
    super(props);
    this.state = { imgUrl: '', name: '' };
  }

  async componentDidMount() {
    const url = `https://api.github.com/users/${this.props.username}`;
    try {
      let response = await axios.get(url);
      // this code won't run until await has finished
      let data = response.data;
      this.setState({ imgUrl: data.avatar_url, name: data.name });
    } catch (err) {
      console.log(`something went wrong: ${err}`);
    }
  }

  render() {
    return (
      <div>
        <h1>Github user info</h1>
        <img src={this.state.imgUrl} alt={this.state.name} />
        <p>{this.state.name}</p>
      </div>
    );
  }
}
```

Example async post with all the extras:

```javascript
async function saveColor() {
  try {
    const url = `/api/demo_two`;
    const data = { name: color.name, hex: color.hex };
    const config = {
      headers: {'Content-Type': 'application/json'}
    };
    let response = await axios.post(url, data, config);
    console.log(response.data);
  } catch (err) {
    console.log(`something went wrong: ${err}`);
  }
}
```

## Multiple requests

You can execute multiple requests **one after the other** by chaining `.then()` methods with regular promises or by using multiple await statements in async functions:

```javascript
async function getUserData() {
  try {
    let response1 = await axios.get('/user/12345');
    let response2 = await axios.get('/user/12345/permissions');
  } catch (err) {
    console.log(`something went wrong: ${err}`);
  }
}
```

Multiple requests can be done **at the same time** with `Promise.All()`:

```javascript
function getUserAccount() {
  return axios.get('/user/12345');
}

function getUserPermissions() {
  return axios.get('/user/12345/permissions');
}

Promise.all([getUserAccount(), getUserPermissions()])
  .then(function (results) {
    const acct = results[0];
    const perm = results[1];
  });
```

with async/await:

```javascript
let [someResult, anotherResult] = await Promise.all([
  someCall(),
  anotherCall()
]);
```


## axios in functional components

See the `UseEffect API example` section in [effects.md](effects.md).

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function Demo() {
  const [zen, setZen] = useState('');

  useEffect(() => {
    console.log('I will run once when the component is first rendered.');

    async function getZen() {
      try {
        const url = 'https://api.github.com/zen';
        const config = {
          headers: { 'Content-Type': 'application/json' }
        };
        let response = await axios.get(url, config);
        handleResponse(response);
      } catch (error) {
        // console.log(`something went wrong: ${error}`);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and
          // an instance of http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      }
    }
    getZen();
  }, []);

  function handleResponse(response) {
    setZen(response.data);
  }

  return (
    <div className="Demo">
      <p>{zen}</p>
    </div>
  );
}

export default Demo;
```

To pass request args along with the get request see: *examples/axios_demo* (RandomColor.jsx).
To send a post request see: *examples/react_with_flask_api*

## AbortController

If you want to [abort the fetch call](https://axios-http.com/docs/cancellation) in the event that the component unmounts before the fetch has completed, you can implement a "cleanup" function using the AbortController Web API and `Fetching data`. See the `Fetching data` section in [effects.md](effects.md#fetching-data). 

You can also pass set a timeout signal along with request so it automatically aborts after a given amount of time. Both of these are demonstrated in examples/axios_demo.

See:

- *examples/axios_demo*
- *examples/react_with_flask_api*
