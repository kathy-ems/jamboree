## EditorConfig

Go to http://editorconfig.org/#download and install the plugin for your editor of choice.

## Node

TLDR, `nvm` is the best to run any number of Node versions seamlessly.

```
brew update && brew install nvm
nvm install 5.6
```

Start future terminal tabs for this project with `nvm use 5.6`.

## Commands

- `npm run dev` starts a Webpack dev server at 127.0.0.1:8080, with live-reload and hot module-replacement
- `npm run build` generates static Webpack bundle
- `npm run lint` lints based on .eslintrc
- `npm run test` runs tests in `./tests`

## Code

Static code and assets go in `./public`, and code goes `./src`.

## Tests

[airbnb.io/enzyme](http://airbnb.io/enzyme) with Mocha, live in `./tests`

## To start server:
- `npm install`
- tab 1: `mongod`
- tab 2: `webpack --watch --progress --color`
- tab 3: `nodemon server/server.js`
- navigate to localhost:8080
