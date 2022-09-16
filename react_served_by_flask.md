# Using Flask to serve React

Flask can be used to serve a static react app. This method has also been successfully tested with react-router apps.

## Serving a static react build

1. Copy all the files from inside the build directory (created from `npm run build`) and place them inside the `static` directory of the flask app.

2. Create a route that serves a static file from the static directory:

```python
@app.route('/test', methods=['GET', 'POST'])
def test():
    '''Test view function.'''
    return app.send_static_file('index.html')
```

3. Add `static_url_path=''` to the Flask app instance initialization:

```python
app = Flask(__name__, static_url_path='')
```

Alternatively, if you'd prefer to have the react build files in their own directory within the flask static dir, you could modify the package.json to have the following line:

```json
"homepage": "/static/react",
```

...where 'static' is the flask static dir and 'react' is the new dir that we'll dump the build files into. Adding this line ensures that the react app has the proper paths. See the [create-react-app docs](https://create-react-app.dev/docs/deployment/#building-for-relative-paths) for a better explanation. According to this doc, I may be able to use `"homepage": ".",` to have relative paths. Should test this.

When we do it this way, you **don't** need to add the `static_url_path=''`.

```python
app = Flask(__name__)
```

Finally, we would need to specify the new dir in our route path:

```python
@app.route('/test', methods=['GET', 'POST'])
def test():
    '''Test view function.'''
    return app.send_static_file('react/index.html')
```

## Serving a react-router build

This setup has been tested and works with react-router v6.4.0. The only thing to keep in mind here is:

1. In your flask app, keep in mind the `app.route` endpoint you use for serving the flask app must exist as a `<Route>` endpoint in your flask app.

```python
# This /home route should exist as a <Route> in the React app
@app.route('/home', methods=['GET', 'POST'])
def home():
    '''Test static serving a react build.'''
    return app.send_static_file('react/index.html')
```

```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/home" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

2. Once you have navigated to the react app, `react-router` will then take ouver the routing, so any internal links to `'/'` will be the react `'/'` endpoint, not the flask `'/'` route. To get back to flask, you would have use an absolute url or use the browsers back button or go to the url using the address.
