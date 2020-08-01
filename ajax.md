# Ajax Requests with Axios

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Example](#example)

<!-- tocstop -->

## Introduction

If you want to fetch data with an Ajax request, it is **always recommended that you do this in the `componentDidMount()` method** as opposed to the `constructor()`. In addition, you should also always avoid setting state in the constructor.

[Axios](https://github.com/axios/axios) is a promise-based HTTP client that works both in the browser and in a node. js environment. It basically provides a single API for dealing with XMLHttpRequests and node's http interface. Besides that, it wraps the requests using a polyfill for ES6 new's promise syntax.

To use Axios, you'll need yo install it:

```
npm install axios
```

## Example

This example makes a request to a simple github api.

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
    )
  }
}
```

The response keys:
```
[ "data", "status", "statusText", "headers", "config", "request" ]
```
