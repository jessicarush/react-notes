# React + Flask API 

## Table of contents 

<!-- toc -->


## Directory structure

## CORS 

Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources. 

### frontend and backend will be served together (same origin)

When developing, the Flask backend will be running on one port (e.g. http://http://127.0.0.1:5000/) and the React backend will be running on another (e.g. http://127.0.0.1:3000/). Out-of-the-box, if you want to make an API call to the backend, you would have to use the full URL:

```javascript
axios.get('http://127.0.0.1:5000/api/color', headers);
```

Anyone can make a get request without worrying about CORS. But, if the server is configured to send back some json data, it would then we need to consider the following:

- if the requester is on the same origin, we have no CORS issues 
- if the requester is on a different origin (e.g. a different port), then the server needs to explicitly allow code from any origin to access the resource. This is done with the `'Access-Control-Allow-Origin'` header using the `*` wildcard.

```Python
    # ...
    response = jsonify(data)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
```

As soon as we try to do a POST though, we will run into the same problem. The Flask backend needs to identify which origins are allowed to Post. This is done using [flask-cors](https://flask-cors.readthedocs.io/en/latest/) and is described in teh next section.

But for this example, we are going to be serving the React frontend React from the same host and port as the Flask backend.

As is turns out, we can configure a [proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/) in the `package.json` file of the React project. This allows the app to "pretend" it's making requests from the same port of the server as the backend, thereby avoiding all CORS issues.

```json
  "proxy": "http://localhost:5000",
```

This tells the React development server to proxy any unknown requests to your API server. One we add this proxy to our backend, we can change all our API calls to just endpoint path:

```javascript
axios.get('/api/color', headers);
```

We also no longer need the headers for any responses on the server:

```Python
    # ...
    response = jsonify(data)
    # We only need this header for public APIs.
    # response.headers['Access-Control-Allow-Origin'] = '*'
    return response
```

This proxy is only applicable to the React development server. When we deploy the frontend and backend together, we would [configure nginx](https://blog.miguelgrinberg.com/post/how-to-deploy-a-react--flask-project) to serve the frontend, then act as a reverse-proxy for the backend API which will be running as a service. In other words, we don;t need to change anything in our front or backend code when we deploy this.
 

### frontend and backend will be served separately (different origins)

flask-cors 

```Python
CORS(app, resources={r'/*': ["http://localhost:3000"]})
```

## Notes 

- prefix API endpoints with /api so that they do not get mixed with any possible routes used by the React side. So instead of /color to /api/color.