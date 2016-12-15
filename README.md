# SimplyThread
Execute arbitrary functions in immediatly-spawned browser threads with an async Promise workflow.

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

### `thread.setFn(function[, context])`
Sets the provided function as the main function that will be executed when invoking thread.run().

Arguments:
  - `function` - the function to set as the thread's main function.
  - `context` (optional) - an object which will be the context that the provided function will run under (i.e. the value of `this` in the function body).


### `thread.kill()`
Destroys the thread and its interface if it hasn't already been destroyed.







