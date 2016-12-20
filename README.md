# SimplyThread
[![Build Status](https://travis-ci.org/danielkalen/simplythread.svg?branch=master)](https://travis-ci.org/danielkalen/simplythread)
[![Coverage](.config/badges/coverage.png?raw=true)](https://github.com/danielkalen/simplythread)
[![Code Climate](https://codeclimate.com/github/danielkalen/simplythread/badges/gpa.svg)](https://codeclimate.com/github/danielkalen/simplythread)

Execute arbitrary functions in immediatly-spawned browser threads with an async Promise workflow. Relies on worker technology for threads and uses fallback methods for unsupported browsers.

## Installation
`npm install simplythread --save`

#### Require (commonJS)
```javascript
var SimplyThread = require('simplythread');
```

#### `<script>` tag
```html
<script src="node_modules/simplythread/dist/simplythread.js"></script>
```



## Example Usage
```javascript
var thread = SimplyThread(function(a,b){
    return a+b;
});

thread.run(5, 10).then(function(result){ // Returns a promise
    console.log(result); // logs 15;
});



thread.setFn(function(a,b){ // Set a new function for the thread
    return (a+b)*b;
});

thread.run(5, 10).then(function(result){
    console.log(result); // logs 150;
});

thread.kill(); // Destroy thread.
```


## API
### `SimplyThread.create([function])`
Creates a new browser thread and returns a thread interface instance.

Arguments:
  - `function` (optional) - The function to set as the thread's main function that will be executed when calling `thread.run()`.


### `SimplyThread.list()`
Returns an array listing all active threads.


### `SimplyThread.killAll()`
Convinence method that kills all active threads.


### `thread.run([arg1[, arg2[, ...]]])`
Execute the function provided to the thread (either through `SimplyThread.create(fn)` or `thread.setFn(fn)`) with the provided arguments. Returns a promise which will either resolve with the result or reject upon error. If a function wasn't provided during thread creation or wasn't later set via thread.setFn the returned promise will be immediatly rejected.


### `thread.on(eventName, callback)`
Registers the provided callback to be invoked when `threadEmit(eventName)` is called from inside the thread's main function.

Example:
```javascript
var thread = SimplyThread.create(function(number){
    setTimeout(function(){
        threadEmit('myEvent', number*10);

        setTimeout(function(){
            threadEmit('myEvent', number*100);
        }, 50);
    }, 100);
});
thread.on('myEvent', (payload)=> console.log(payload)) // Logs '50' after 100ms, '500' after 150ms
thread.run(5);
```

Arguments:
  - `eventName` - the name of the event to register the callback with.
  - `callback` - the callback to invoke with the payload when `threadEmit(eventName)` is invoked from the thread.


### `thread.setFn(function[, context])`
Sets the provided function as the main function that will be executed when invoking thread.run().

Arguments:
  - `function` - the function to set as the thread's main function.
  - `context` (optional) - an object which will be the context that the provided function will run under (i.e. the value of `this` in the function body).


### `thread.setContext(context)`
Assigns the provided context as the thread's function's `this` value.

Arguments:
  - `context` - an object which will be the context that the thread's function will run under (i.e. the value of `this` in the function body).


### `thread.setScripts(scriptsArray)`
Loads each external script provided in the `scriptsArray` on the thread's global scope. The scripts will be loaded asynchronously and the thread will wait for all scripts to be loaded before running any following .run() calls. If one of the scripts fail to load (i.e. they have a status code >= 400), any following .run() calls will be immediatly rejected with the script load error.

Example:
```javascript
var thread = SimplyThread.create();
thread.setScripts(['https://code.jquery.com/jquery-3.1.1.js', 'MODULE:lodash']); // jQuery and Lodash will now be available on the thread's global scope.

thread.setScripts([function(){
    self.globalVariable = 'abc123';
}]) // globalVariable will now be available on the thread's global scope.
```

Arguments:
  - `scriptsArray` - array of scripts that the thread should attempt to load under its global scope. Possible values for scripts:
      - *URL path* - absolute path of a javascript file.
      - *Module path* - a string representing the name of an NPM package that'll be loaded via [Browserify](http://wzrd.in), preceded by a 'MODULE:' prefix. By default a module will be loaded on the thread's global scope under the package's name, but a custom name can be specified via 'MODULE:packageName#customName' syntax e.g. 'MODULE:lodash#_'.
      - *Function* - A function that'll be run on the thread's global scope (i.e. the `this` keyword will resolve to the thread's global scope). If the function returns a promise, the thread will await until it is resolved before running any .run() calls.


### `thread.setGlobals(object)`
Sets/assigns each key:value from the provided object on the thread's global scope.

Example:
```javascript
var thread = SimplyThread.create(function(){
    return typeof myVariable;
});

thread.run().then(function(result){ console.log(result);}) // Logs 'undefined'

thread.setGlobals({myVariable: 'someValue'});
thread.run().then(function(result){ console.log(result);}) // Logs 'string'
```

Arguments:
  - `object` - an object containing key:value pairs which will be set on the thread's global scope. The key will represent the name of the global variable that'll be assigned to its associated value.


### `thread.kill()`
Destroys the thread and its interface if it hasn't already been destroyed.



## Things to consider
You should generally delegate heavy/expensive computations to threads and avoid running tiny computations because transferring data between threads also takes a certain amount of time (depending on what you are transferring).






