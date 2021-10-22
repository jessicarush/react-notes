# Ajax Requests with Axios

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Example - Simple request to API](#example---simple-request-to-api)
- [Example - Request with data](#example---request-with-data)
- [Example - Adding a loading animation](#example---adding-a-loading-animation)
- [Example - Using an async function](#example---using-an-async-function)

<!-- tocstop -->

## Introduction

If you want to fetch data with an Ajax request, it is **always recommended that you do this in the `componentDidMount()` method** as opposed to the `constructor()`. In addition, you should also always avoid setting state in the constructor.

[Axios](https://github.com/axios/axios) is a promise-based HTTP client that works both in the browser and in a node. js environment. It basically provides a single API for dealing with *XMLHttpRequests* and node's http interface. Besides that, it wraps the requests using a polyfill for ES6's new promise syntax.

To use Axios, you'll need to install it:

```
npm install axios
```

## Example - Simple request to API

This example makes a request to a simple github api.

First, make sure to import axios:

```javascript
import axios from 'axios';
```

Then use `axios.get().then()`. Note that the `.then()` is a method of the standard built-in `Promise` object.

> It takes up to two arguments: callback functions for success and failure cases of the Promise.

Note: I can't find an example of this. In the meantime, here's a decent [discussion on error handling](https://www.intricatecloud.io/2020/03/how-to-handle-api-errors-in-your-web-app-using-axios/).

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {data: ""};
  }
  componentDidMount() {
    // load data
    axios.get("https://api.github.com/zen").then(response => {
      // view the entire response object
      console.log(response);
      // view the response object keys
      console.log(Object.keys(response));
      // set state with that data
      this.setState({data: response.data});
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
```
[ "data", "status", "statusText", "headers", "config", "request" ]
```

Add another request:

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "",
      colorName: "",
      colorHex: ""
    };
  }
  componentDidMount() {
    // load data and set state with that data
    axios.get("https://api.github.com/zen").then(response => {
      this.setState({data: response.data});
    });

    axios.get("https://log.zebro.id/api_demo_one").then(response => {
      this.setState({
        colorName: Object.keys(response.data)[0],
        colorHex: Object.values(response.data)[0]
      });
    });

  }
  render() {
    const style = {color: this.state.colorHex};
    return (
      <div>
        <h1>{this.state.data}</h1>
        <h1 style={style}>{this.state.colorName} {this.state.colorHex}</h1>
      </div>
    );
  }
}
```

For reference, the python flask endpoint for the second api looks like this:

```python
@app.route('/api_demo_one', methods=['GET'])
def api_demo():
    '''Demo API returns a random html color'''
    name, hex = random.choice(list(colors.items()))
    response = jsonify({name: hex})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
```

Note the `Access-Control-Allow-Origin` header. In order for requests outside the response origin to access the response, this header must be set. `*` is a wildcard allowing any site to receive the response. You should only use this for public APIs. Private APIs should never use `*`, and should instead have a specific domain or domains set. In addition, the wildcard only works for requests made with the crossorigin attribute set to anonymous, and it prevents sending credentials like cookies in requests. [See MDN for more on this](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSMissingAllowOrigin).


## Example - Request with data

This example sends query parameters along with the get request:

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorName: "",
      colorHex: ""
    };
  }
  componentDidMount() {
    // load data and set state with that data
    axios.get("http://127.0.0.1:5000/api_demo_one", {params: {value: 'rgb'}}).then(response => {
      this.setState({
        colorName: Object.keys(response.data)[0],
        colorHex: Object.values(response.data)[0]
      });
    });

  }
  render() {
    const style = {color: this.state.colorHex};
    return (
      <div>
        <h1 style={style}>{this.state.colorName} {this.state.colorHex}</h1>
      </div>
    );
  }
}
```

## Example - Adding a loading animation

For Ajax requests that may take some time, it's easy to add a loading animation using state.

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      data: ""
    };
  }
  componentDidMount() {
    // load data and set state with that data
    axios.get("https://api.github.com/zen").then(response => {
      setTimeout(function () {
          this.setState({data: response.data, isLoaded: true});
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
    this.state = {imgUrl: '', name: ''};
  }
  async componentDidMount() {
    const url = `https://api.github.com/users/${this.props.username}`;
    let response = await axios.get(url);
    // this code won't run until await has finished
    let data = response.data;
    this.setState({imgUrl: data.avatar_url, name: data.name});
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
