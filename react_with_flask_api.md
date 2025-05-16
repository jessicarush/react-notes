# React + Flask API 

## Table of contents

<!-- toc -->

- [Directory structure](#directory-structure)
- [CORS](#cors)
  * [Frontend and backend will be served together (same origin)](#frontend-and-backend-will-be-served-together-same-origin)
  * [Frontend and backend will be served separately (different origins)](#frontend-and-backend-will-be-served-separately-different-origins)
    + [Simple usage (allow everything)](#simple-usage-allow-everything)
    + [Resource specific usage](#resource-specific-usage)
    + [Route specific usage](#route-specific-usage)
- [Notes](#notes)

<!-- tocstop -->

## Directory structure

```text
.
├─ flask_api
│  ├─ app
│  ├─ logs
│  ├─ venv
│  ├─ .env
│  ├─ .gitignore
│  ├─ config.py
│  ├─ README.md
│  ├─ requirements.txt
│  └─ run.py
└─ react_ui
   ├─ build
   ├─ node_modules
   ├─ public
   ├─ src
   ├─ .gitignore
   ├─ package-lock.json
   ├─ package.json
   └─ README.md
```

## CORS 

[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources. 

CORS is specifically a browser security mechanism—it is implemented and enforced by web browsers. If we have a Flask backend and a traditional client-side React frontend, since the `fetch` requests will be coming from the client-side (browser) going to the backend, we will need to set up CORS. If our frontend was instead something like Next.js 15 and all of our `fetch` requests were in server components and server actions then these would be server-to-server calls, and are therefor not subject to CORS.

Our approach to handling `CORS` will depend on how we intend on serving the frontend and backend:

1. The frontend and backend will be served from the same domain and port by configuring Nginx as a reverse proxy (example below).
2. The frontend and backend will be served separately (different domain and/or different ports)

### Frontend and backend will be served together (same origin)

When developing, the Flask backend will be running on one port (e.g. http://localhost:5000/) and the React backend will be running on another (e.g. http://localhost:3000/). Out-of-the-box, if you want to make an API call to the backend, you would have to use the full URL since they are not the same origin:

```javascript
fetch('http://localhost:5000/api/color', options);
// or 
axios.get('http://localhost:5000/api/color', config);
```

Note that anyone can make a `GET` request without worrying about CORS. But, if the server is configured to send back some json data, we then need to consider the following:

- if the requester is from the same origin (same domain and port), we have no CORS issues 
- if the requester is from a different origin (e.g. in our case, a different port), then the **server** needs to explicitly allow code from other origins to access the resource. This can be done quickly with the `'Access-Control-Allow-Origin'` header using the `*` wildcard. This allows **any** origin to access the resource

```Python
    # ...
    response = jsonify(data)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
```

As soon as we try to do a `POST` though, we will run into the same problem again. The Flask backend needs to identify if origins other than its own are allowed to `POST`. This is easiest done using [flask-cors](https://flask-cors.readthedocs.io/en/latest/) and is described in the next section.

But for this example, we are assuming that in production we intend to serve the React frontend from the **same domain and port** as the Flask backend.

In the meantime, if using *create-react-app* we can configure a [proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/) in the `package.json` file of the React project. This allows the app to "pretend" it's making requests from the same port as the backend, thereby avoiding all CORS issues.

```json
  "proxy": "http://127.0.0.1:5000",
```

This tells the React development server to proxy any unknown requests to your backend API server. Side note: for some reason you cannot use `http://localhost:5000`. Once we add this proxy pointing to our backend, we can change all our API calls to just the endpoint path:

```javascript
fetch('/api/color', options);
```

> Vite's development server also provides a proxy configuration option similar to the one in Create React App. Vite handles proxying through its vite.config.js (or vite.config.ts) file.

With the proxy set, we no longer need the headers for any responses on the server, since it thinks the request is from the same origin:

```Python
    # ...
    response = jsonify(data)
    # We only need this header for public APIs.
    # response.headers['Access-Control-Allow-Origin'] = '*'
    return response
```

**This proxy is only applicable to the React development server.** When we deploy the frontend and backend together, we would [configure nginx](https://blog.miguelgrinberg.com/post/how-to-deploy-a-react--flask-project) to serve the frontend, then act as a reverse-proxy for the backend API which will be running as a service. In other words, we don't need to change anything in our front or backend code when we deploy this.

nginx example:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Route API requests to Flask backend
    location /api/ {
        proxy_pass http://localhost:5000;  # Flask running locally on port 5000
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Route all other requests to Next.js frontend
    location / {
        proxy_pass http://localhost:3000;  # Next.js running locally on port 3000
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> Nginx only handles requests coming from the client-side (browers). If I have a Flask backend and a Next.js frontend and all my fetch requests to the backend are happening in server components or server actions, then these all need to use the full internal URL of the backend (e.g., http://flask-service:5000 if using service discovery, or http://192.168.1.10:5000 if using an internal IP).

### Frontend and backend will be served separately (different origins)

See: <https://flask-cors.readthedocs.io/en/latest/>

```bash
pip install flask-cors 
```

#### Simple usage (allow everything)

In the simplest case, you can initialize the Flask-Cors extension with default arguments. This will allow CORS for **all domains on all routes**.

```Python
# ...
from flask_cors import CORS

app = Flask(__name__)
# Allow all origins access to all resources:
CORS(app) 
```

That's it. Our front end can now access resources and `POST` to our backend APIs using the full URL:

```javascript
fetch('http://localhost:5000/api/color', options)
// or
axios.post('http://localhost:5000/api/color', data, headers);
```

:warning: Obviously the base URL would need to be updated to the actual domain name when deployed. 

#### Resource specific usage 

Rather than allowing all origins access to everything, you will likely want to specify which origins have access to what resources:

```Python
# Allow some origins access to some resources:
cors = CORS(app, resources={r'/api/*': {'origins': ['http://localhost:3000']}})
```

Any other routes in the Flask app that don't match the `/api/*` pattern cannot be accessed from different origins.

:warning: Both the frontend URL here and the backend url used in the API requests will need to be updated with the actual domain when deployed. 

#### Route specific usage 

In lieu of initializing `CORS()`, you can use decorators to allow access directly on the endpoints:

```Python
# ...
from flask_cors import cross_origin

@app.route('/api/demo', methods=['GET'])
@cross_origin(origins=['http://localhost:3000'])
def api_demo():
    return 'example'
```

:warning: Both the frontend URL here and the backend url used in the API requests will need to be updated with the actual domain name when deployed.


## Notes 

It is a very good idea to prefix API endpoints with /api so that:

- they do not get mixed with any possible routes used by the React side. 
- they can be easily targeted with CORS rules as shown above

Flask-cors allows for total granular control beyond what is shown here, for example you can pass parameters saying which methods are allowed and more. [See the API docs](https://flask-cors.readthedocs.io/en/latest/api.html).