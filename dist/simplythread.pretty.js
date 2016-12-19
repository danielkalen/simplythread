// Generated by CoffeeScript 1.10.0
var slice = [].slice;

(function() {
  var PRIMITIVE_TYPES, STRINGIFY_OPTS, SUPPORTS, SimplyThread, Thread, ThreadInterface, currentID, exposeStringifyFn, functionBodyRegEx, genTransactionID, promisePolyfill, threadEmit, workerScript;
  SimplyThread = new function() {
    var threads;
    threads = [];
    this.create = function(fn) {
      var newThread;
      newThread = new ThreadInterface(fn);
      threads.push(newThread);
      return newThread;
    };
    this.remove = function(threadInstance) {
      var threadIndex;
      threadIndex = threads.indexOf(threadInstance);
      if (threadIndex !== -1) {
        return threads.splice(threadIndex, 1);
      }
    };
    this.list = function() {
      return threads.slice();
    };
    this.killAll = function() {
      threads.slice().forEach(function(thread) {
        return thread.kill();
      });
      return true;
    };
    return this;
  };
  functionBodyRegEx = /^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/;
  SUPPORTS = {
    'workers': !!window.Worker && !!window.Blob && !!window.URL,
    'promises': !!window.Promise
  };
  PRIMITIVE_TYPES = {
    string: true,
    number: true,
    boolean: true,
    symbol: true
  };
  STRINGIFY_OPTS = {
    references: true
  };
  currentID = 0;
  genTransactionID = function() {
    return ++currentID;
  };
  exposeStringifyFn = function() {
    (function (root, stringify) {
		  
		  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		    // Node.
		    module.exports = stringify();
		  } else if (typeof define === 'function' && define.amd) {
		    // AMD, registers as an anonymous module.
		    define(function () {
		      return stringify();
		    });
		  } else {
		    // Browser global.
		    root.javascriptStringify = stringify();
		  }
		})(this, function () {
		  
		  var ESCAPABLE = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		
		  
		  var META_CHARS = {
		    '\b': '\\b',
		    '\t': '\\t',
		    '\n': '\\n',
		    '\f': '\\f',
		    '\r': '\\r',
		    "'":  "\\'",
		    '"':  '\\"',
		    '\\': '\\\\'
		  };
		
		  
		  function escapeChar (char) {
		    var meta = META_CHARS[char];
		
		    return meta || '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
		  };
		
		  
		  var RESERVED_WORDS = {};
		
		  
		  (
		    'break else new var case finally return void catch for switch while ' +
		    'continue function this with default if throw delete in try ' +
		    'do instanceof typeof abstract enum int short boolean export ' +
		    'interface static byte extends long super char final native synchronized ' +
		    'class float package throws const goto private transient debugger ' +
		    'implements protected volatile double import public let yield'
		  ).split(' ').map(function (key) {
		    RESERVED_WORDS[key] = true;
		  });
		
		  
		  var IS_VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
		
		  
		  function isValidVariableName (name) {
		    return !RESERVED_WORDS[name] && IS_VALID_IDENTIFIER.test(name);
		  }
		
		  
		  function toGlobalVariable (value) {
		    return 'Function(' + stringify('return this;') + ')()';
		  }
		
		  
		  function toPath (path) {
		    var result = '';
		
		    for (var i = 0; i < path.length; i++) {
		      if (isValidVariableName(path[i])) {
		        result += '.' + path[i];
		      } else {
		        result += '[' + stringify(path[i]) + ']';
		      }
		    }
		
		    return result;
		  }
		
		  
		  function stringifyArray (array, indent, next) {
		    // Map array values to their stringified values with correct indentation.
		    var values = array.map(function (value, index) {
		      var str = next(value, index);
		
		      if (str === undefined) {
		        return String(str);
		      }
		
		      return indent + str.split('\n').join('\n' + indent);
		    }).join(indent ? ',\n' : ',');
		
		    // Wrap the array in newlines if we have indentation set.
		    if (indent && values) {
		      return '[\n' + values + '\n]';
		    }
		
		    return '[' + values + ']';
		  }
		
		  
		  function stringifyObject (object, indent, next) {
		    // Iterate over object keys and concat string together.
		    var values = Object.keys(object).reduce(function (values, key) {
		      var value = next(object[key], key);
		
		      // Omit \`undefined\` object values.
		      if (value === undefined) {
		        return values;
		      }
		
		      // String format the key and value data.
		      key   = isValidVariableName(key) ? key : stringify(key);
		      value = String(value).split('\n').join('\n' + indent);
		
		      // Push the current object key and value into the values array.
		      values.push(indent + key + ':' + (indent ? ' ' : '') + value);
		
		      return values;
		    }, []).join(indent ? ',\n' : ',');
		
		    // Wrap the object in newlines if we have indentation set.
		    if (indent && values) {
		      return '{\n' + values + '\n}';
		    }
		
		    return '{' + values + '}';
		  }
		
		
		  function stringifySpecialObject (object) {
		    var stringified = String(object),
		        customProps = Object.keys(object),
		        propsRestore, i;
		    
		    if (i=customProps.length) {
		      propsRestore = "var x="+stringified+";";
		      while (i--) {
		        propsRestore += "x['"+customProps[i]+"']="+stringify(object[customProps[i]])+";";
		      }
		      return "(function(){"+propsRestore+"return x;}())";
		    } else {
		      return stringified;
		    }
		  }
		
		  
		  var OBJECT_TYPES = {
		    '[object Array]': stringifyArray,
		    '[object Object]': stringifyObject,
		    '[object Date]': function (date) {
		      return 'new Date(' + date.getTime() + ')';
		    },
		    '[object String]': function (string) {
		      return 'new String(' + stringify(string.toString()) + ')';
		    },
		    '[object Number]': function (number) {
		      return 'new Number(' + number + ')';
		    },
		    '[object Boolean]': function (boolean) {
		      return 'new Boolean(' + boolean + ')';
		    },
		    '[object Uint8Array]': function (array, indent) {
		      return 'new Uint8Array(' + stringifyArray(array) + ')';
		    },
		    '[object RegExp]': stringifySpecialObject,
		    '[object Function]': stringifySpecialObject,
		    '[object global]': toGlobalVariable,
		    '[object Window]': toGlobalVariable
		  };
		
		  
		  var PRIMITIVE_TYPES = {
		    'string': function (string) {
		      return "'" + string.replace(ESCAPABLE, escapeChar) + "'";
		    },
		    'number': String,
		    'object': String,
		    'boolean': String,
		    'symbol': String,
		    'undefined': String
		  };
		
		  
		  function stringify (value, indent, next) {
		    // Convert primitives into strings.
		    if (Object(value) !== value) {
		      return PRIMITIVE_TYPES[typeof value](value, indent, next);
		    }
		
		    // Handle buffer objects before recursing (node < 6 was an object, node >= 6 is a \`Uint8Array\`).
		    if (typeof Buffer === 'function' && Buffer.isBuffer(value)) {
		      return 'new Buffer(' + next(value.toString()) + ')';
		    }
		
		    // Use the internal object string to select stringification method.
		    var toString = OBJECT_TYPES[Object.prototype.toString.call(value)];
		
		    // Convert objects into strings.
		    return toString ? toString(value, indent, next) : undefined;
		  }
		
		  
		  return function (value, replacer, space, options) {
		    options = options || {}
		
		    // Convert the spaces into a string.
		    if (typeof space !== 'string') {
		      space = new Array(Math.max(0, space|0) + 1).join(' ');
		    }
		
		    var maxDepth = Number(options.maxDepth) || 100;
		    var references = !!options.references;
		    var skipUndefinedProperties = !!options.skipUndefinedProperties;
		    var valueCount = Number(options.maxValues) || 100000;
		
		    var path = [];
		    var stack = [];
		    var encountered = [];
		    var paths = [];
		    var restore = [];
		
		    
		    function next (value, key) {
		      if (skipUndefinedProperties && value === undefined) {
		        return undefined;
		      }
		
		      path.push(key);
		      var result = recurse(value, stringify);
		      path.pop();
		      return result;
		    }
		
		    
		    var recurse = references ?
		      function (value, stringify) {
		        if (value && (typeof value === 'object' || typeof value === 'function')) {
		          var seen = encountered.indexOf(value);
		
		          // Track nodes to restore later.
		          if (seen > -1) {
		            restore.push(path.slice(), paths[seen]);
		            return;
		          }
		
		          // Track encountered nodes.
		          encountered.push(value);
		          paths.push(path.slice());
		        }
		
		        // Stop when we hit the max depth.
		        if (path.length > maxDepth || valueCount-- <= 0) {
		          return;
		        }
		
		        // Stringify the value and fallback to
		        return stringify(value, space, next);
		      } :
		      function (value, stringify) {
		        var seen = stack.indexOf(value);
		
		        if (seen > -1 || path.length > maxDepth || valueCount-- <= 0) {
		          return;
		        }
		
		        stack.push(value);
		        var value = stringify(value, space, next);
		        stack.pop();
		        return value;
		      };
		
		    // If the user defined a replacer function, make the recursion function
		    // a double step process - \`recurse -> replacer -> stringify\`.
		    if (typeof replacer === 'function') {
		      var before = recurse
		
		      // Intertwine the replacer function with the regular recursion.
		      recurse = function (value, stringify) {
		        return before(value, function (value, space, next) {
		          return replacer(value, space, function (value) {
		            return stringify(value, space, next);
		          });
		        });
		      };
		    }
		
		    var result = recurse(value, stringify);
		
		    // Attempt to restore circular references.
		    if (restore.length) {
		      var sep = space ? '\n' : '';
		      var assignment = space ? ' = ' : '=';
		      var eol = ';' + sep;
		      var before = space ? '(function () {' : '(function(){'
		      var after = '}())'
		      var results = ['var x' + assignment + result];
		
		      for (var i = 0; i < restore.length; i += 2) {
		        results.push('x' + toPath(restore[i]) + assignment + 'x' + toPath(restore[i + 1]));
		      }
		
		      results.push('return x');
		
		      return before + sep + results.join(eol) + eol + after
		    }
		
		    return result;
		  };
		});
		;
  };
  promisePolyfill = '(function(){"use strict";var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}} function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})}; function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};self.Promise||(self.Promise=n,self.Promise.resolve=u,self.Promise.reject=t,self.Promise.race=x,self.Promise.all=w,self.Promise.prototype.then=n.prototype.c,self.Promise.prototype["catch"]=n.prototype.g);}());';
  ThreadInterface = function(fn1) {
    var ref, thread;
    this.fn = fn1;
    this.fnString = (ref = this.fn) != null ? ref.toString() : void 0;
    this.status = 'active';
    thread = new Thread(this.fn, this.fnString);
    Object.defineProperty(this, 'thread', {
      'enumerable': false,
      'configurable': false,
      'get': function() {
        return thread;
      }
    });
    return this;
  };
  ThreadInterface.prototype.run = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (typeof this.fn === 'function') {
      return this.thread.sendCommand('run', this._stringifyPayload(args)).then((function(_this) {
        return function(payload) {
          return _this._parsePayload(payload);
        };
      })(this))["catch"]((function(_this) {
        return function(rejection) {
          return Promise.reject(_this._parseRejection(rejection));
        };
      })(this));
    } else {
      return Promise.reject(new Error('No function was set for this thread.'));
    }
  };
  ThreadInterface.prototype.on = function(event, callback) {
    if (typeof event === 'string' && typeof callback === 'function') {
      return this.thread.socket.on(event, (function(_this) {
        return function(message) {
          return callback(_this._parsePayload(message.payload));
        };
      })(this));
    }
  };
  ThreadInterface.prototype.setFn = function(fn, context) {
    if (typeof fn === 'function') {
      this.fn = fn;
      this.fnString = fn.toString();
      this.thread.sendCommand('setFn', this.fnString);
      if (context) {
        this.setContext(context);
      }
    }
    return this;
  };
  ThreadInterface.prototype.setGlobals = function(obj) {
    this.thread.sendCommand('setGlobals', this._stringifyPayload(obj));
    return this;
  };
  ThreadInterface.prototype.setScripts = function(scripts) {
    this.thread.sendCommand('setScripts', this._stringifyPayload(scripts));
    return this;
  };
  ThreadInterface.prototype.setContext = function(context) {
    this.thread.sendCommand('setContext', this._stringifyPayload(context));
    return this;
  };
  ThreadInterface.prototype.kill = function() {
    var ref;
    if ((ref = this.thread) != null) {
      ref.worker.terminate();
    }
    this.status = 'dead';
    SimplyThread.remove(this);
    return this;
  };
  ThreadInterface.prototype._stringifyPayload = function(payload) {
    var output;
    output = {
      type: typeof payload
    };
    output.data = PRIMITIVE_TYPES[output.type] ? payload : this.javascriptStringify(payload, null, null, STRINGIFY_OPTS);
    return output;
  };
  ThreadInterface.prototype._parsePayload = function(payload) {
    if (PRIMITIVE_TYPES[payload.type]) {
      return payload.data;
    } else {
      return eval("(" + payload.data + ")");
    }
  };
  ThreadInterface.prototype._parseRejection = function(rejection) {
    var err, proxyErr;
    err = this._parsePayload(rejection);
    if (err && typeof err === 'object' && window[err.name] && window[err.name].constructor === Function) {
      proxyErr = err.name && window[err.name] ? new window[err.name](err.message) : new Error(err.message);
      proxyErr.stack = err.stack;
      return proxyErr;
    } else {
      return err;
    }
  };
  exposeStringifyFn.call(ThreadInterface.prototype);
  Thread = function(fn1, fnString1) {
    this.fn = fn1;
    this.fnString = fnString1;
    this.worker = this.init();
    this.socket = this.openSocket();
    if (this.fn) {
      this.sendCommand('setFn', this.fnString);
    }
    return this;
  };
  Thread.prototype.init = function() {
    if (!SUPPORTS.workers) {
      return false;
    } else {
      return new Worker(this.createURI());
    }
  };
  Thread.prototype.createURI = function() {
    var blob, dependencies, workerScriptContents;
    workerScriptContents = workerScript.toString().match(functionBodyRegEx)[1];
    dependencies = exposeStringifyFn.toString().match(functionBodyRegEx)[1];
    dependencies += "var PRIMITIVE_TYPES = " + (JSON.stringify(PRIMITIVE_TYPES)) + ";";
    dependencies += "var STRINGIFY_OPTS = " + (JSON.stringify(STRINGIFY_OPTS)) + ";";
    if (!SUPPORTS.promises) {
      dependencies += promisePolyfill;
    }
    blob = new Blob([dependencies + workerScriptContents], {
      type: 'application/javascript'
    });
    return URL.createObjectURL(blob);
  };
  Thread.prototype.openSocket = function() {
    if (this.worker) {
      this.worker.addEventListener('message', (function(_this) {
        return function(e) {
          if (e.data.ID && _this.socket.callbacks[e.data.ID]) {
            return _this.socket.callbacks[e.data.ID](e.data);
          }
        };
      })(this));
    }
    return {
      on: function(ID, callback) {
        return this.callbacks[ID] = callback;
      },
      callbacks: {}
    };
  };
  Thread.prototype.sendCommand = function(command, payload) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var ID;
        if (_this.worker) {
          if (command === 'run') {
            _this.socket.on(ID = genTransactionID(), function(data) {
              switch (data.status) {
                case 'resolve':
                  return resolve(data.payload);
                case 'reject':
                  return reject(data.payload);
              }
            });
          }
          return _this.worker.postMessage({
            command: command,
            payload: payload,
            ID: ID
          });
        } else {
          switch (command) {
            case 'run':
              if (_this.fn) {
                return _this.fn.apply(_this.context, payload);
              }
              break;
            case 'setFn':
              if (typeof payload === 'function') {
                return _this.fn = eval("(" + (payload.toString()) + ")");
              }
              break;
            case 'setContext':
              return _this.context = payload;
          }
        }
      };
    })(this));
  };
  threadEmit = function(event, payload) {
    var base;
    return typeof (base = this.socket.callbacks)[event] === "function" ? base[event](payload) : void 0;
  };
  workerScript = function() {
    var _parsePayload, _stringifyError, _stringifyPayload, fnContext, fnToExecute, onmessage, run, setContext, setFn, setGlobals, setScripts;
    fnToExecute = null;
    fnContext = null;
    _stringifyPayload = function(payload) {
      var output;
      output = {
        type: typeof payload
      };
      output.data = PRIMITIVE_TYPES[output.type] ? payload : javascriptStringify(payload, null, null, STRINGIFY_OPTS);
      return output;
    };
    _stringifyError = function(arg) {
      var message, name, stack;
      name = arg.name, message = arg.message, stack = arg.stack;
      return _stringifyPayload({
        name: name,
        message: message,
        stack: stack
      });
    };
    _parsePayload = function(payload) {
      if (PRIMITIVE_TYPES[payload.type]) {
        return payload.data;
      } else {
        return eval("(" + payload.data + ")");
      }
    };
    onmessage = function(e) {
      var ID, command, payload;
      command = e.data.command;
      payload = e.data.payload;
      ID = e.data.ID;
      switch (command) {
        case 'setContext':
          return setContext(_parsePayload(payload));
        case 'setGlobals':
          return setGlobals(_parsePayload(payload));
        case 'setScripts':
          return setScripts(_parsePayload(payload));
        case 'setFn':
          return setFn(payload);
        case 'run':
          return run(ID, _parsePayload(payload));
      }
    };
    setGlobals = function(obj) {
      var key, value;
      for (key in obj) {
        value = obj[key];
        self[key] = value;
      }
    };
    setScripts = function(scripts) {
      var i, len, script;
      for (i = 0, len = scripts.length; i < len; i++) {
        script = scripts[i];
        if (typeof script === 'function') {
          script.call(self);
        } else {
          importScripts(script);
        }
      }
    };
    setContext = function(context) {
      return fnContext = context;
    };
    setFn = function(fnString) {
      return eval("fnToExecute = " + fnString);
    };
    run = function(ID, args) {
      var err, error, hasError, result;
      if (args == null) {
        args = [];
      }
      try {
        result = fnToExecute.apply(fnContext, args);
      } catch (error) {
        err = error;
        postMessage({
          ID: ID,
          status: 'reject',
          payload: _stringifyError(err)
        });
        hasError = true;
      }
      if (!hasError) {
        return Promise.resolve(result).then(function(result) {
          return postMessage({
            ID: ID,
            status: 'resolve',
            payload: _stringifyPayload(result)
          });
        })["catch"](function(result) {
          return postMessage({
            ID: ID,
            status: 'reject',
            payload: _stringifyPayload(result)
          });
        });
      }
    };
    threadEmit = function(event, payload) {
      return postMessage({
        ID: event,
        payload: _stringifyPayload(payload)
      });
    };
  };
  SimplyThread.version = '1.7.0';
  if ((typeof exports !== "undefined" && exports !== null ? exports.module : void 0) != null) {
    return module.exports = SimplyThread;
  } else if (typeof define === 'function' && define.amd) {
    return define(['simplythread'], function() {
      return SimplyThread;
    });
  } else {
    return window.SimplyThread = SimplyThread;
  }
})();
