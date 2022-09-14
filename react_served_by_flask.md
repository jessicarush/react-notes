# Using Flask to serve React

Flask can be used to serve a static react app. This method has NOt yet been tested with react-router apps. See <https://create-react-app.dev/docs/deployment/> for information.

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

TODO...
hashrouter?
<https://create-react-app.dev/docs/deployment/>
