// Generated by CoffeeScript 1.10.0
var slice = [].slice;

(function() {
  var FakeWorker, PRIMITIVE_TYPES, STRINGIFY_OPTS, SUPPORTS, SimplyThread, ThreadInterface, currentID, functionBodyRegEx, helpers, promisePolyfill, workerScript;
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
      return threads.splice(threadIndex, 1);
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
  ThreadInterface = function(fn1) {
    this.fn = fn1;
    this.status = 'active';
    this.worker = (function(_this) {
      return function() {

        /* istanbul ignore if */
        if (!SUPPORTS.workers) {
          return new FakeWorker();
        } else {
          return helpers.patchWorkerMethods(new Worker(helpers.createWorkerURI()));
        }
      };
    })(this)();
    this.socket = (function(_this) {
      return function() {
        _this.worker.addEventListener('message', function(data) {
          if (data.ID && _this.socket.callbacks[data.ID]) {
            return _this.socket.callbacks[data.ID](data);
          }
        });
        return {
          on: function(ID, callback) {
            return this.callbacks[ID] = callback;
          },
          callbacks: {}
        };
      };
    })(this)();
    if (this.fn) {
      this.setFn(this.fn);
    }
    return this;
  };
  ThreadInterface.prototype.run = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (typeof this.fn === 'function') {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var ID;
          _this.socket.on(ID = helpers.genTransactionID(), function(data) {
            switch (data.status) {
              case 'resolve':
                return resolve(data.payload);
              case 'reject':
                return reject(data.payload);
            }
          });
          return _this.worker.postMessage({
            command: 'run',
            payload: args,
            ID: ID
          });
        };
      })(this));
    } else {
      return Promise.reject(new Error('No function was set for this thread.'));
    }
  };
  ThreadInterface.prototype.on = function(event, callback) {
    if (typeof callback !== 'function') {
      throw new Error("Provided callback isn't a function");
    } else {
      return this.socket.on(event, function(data) {
        return callback(data.payload);
      });
    }
  };
  ThreadInterface.prototype.setFn = function(fn, context) {
    if (typeof fn !== 'function') {
      throw new Error("Provided argument isn't a function");
    } else {
      this.fn = fn;
      this.fnString = fn.toString();
      this.worker.postMessage({
        command: 'setFn',
        payload: this.fnString
      }, false);
      if (context != null) {
        this.setContext(context);
      }
      return this;
    }
  };
  ThreadInterface.prototype.setGlobals = function(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error("Provided argument isn't an object");
    } else {
      this.worker.postMessage({
        command: 'setGlobals',
        payload: obj
      });
    }
    return this;
  };
  ThreadInterface.prototype.setScripts = function(scripts) {
    this.worker.postMessage({
      command: 'setScripts',
      payload: [].concat(scripts)
    });
    return this;
  };
  ThreadInterface.prototype.setContext = function(context) {
    this.worker.postMessage({
      command: 'setContext',
      payload: context
    });
    return this;
  };
  ThreadInterface.prototype.kill = function() {
    this.worker.terminate();
    this.status = 'dead';
    SimplyThread.remove(this);
    return this;
  };

  /* istanbul ignore next */
  workerScript = function() {
    var globalEval, threadEmit;
    globalEval = eval;
    threadEmit = function(event, payload) {
      return postMessage({
        ID: event,
        payload: helpers.stringifyPayload(payload)
      });
    };
    (function() {
      var _fnContext, _fnToExecute, _scriptsLoaded, fetchExternal, fetchModule, run, setGlobals, setScripts, stringifyError;
      _fnToExecute = null;
      _fnContext = null;
      _scriptsLoaded = Promise.resolve();
      stringifyError = function(arg) {
        var message, name, stack;
        name = arg.name, message = arg.message, stack = arg.stack;
        if (name) {
          return helpers.stringifyPayload({
            name: name,
            message: message,
            stack: stack
          });
        } else {
          return helpers.stringifyPayload(arguments[0]);
        }
      };
      fetchExternal = function(url) {
        return new Promise(function(resolve, reject) {
          var request;
          request = new XMLHttpRequest();
          request.open('GET', url, true);
          request.onerror = reject;
          request.onload = function() {
            var ref;
            if ((200 >= (ref = this.status) && ref < 400)) {
              return resolve(this.response);
            } else {
              return reject(new Error("External fetch failed (status:" + request.status + "): " + request.response));
            }
          };
          return request.send();
        });
      };
      fetchModule = function(module) {
        var moduleLabel, moduleName;
        moduleName = module.split('#')[0];
        moduleLabel = module.split('#')[1] || moduleName;
        moduleName = moduleName.replace(/\//g, '%2F');
        return fetchExternal("https://wzrd.in/bundle/" + moduleName).then(function(result) {
          var loader;
          if (result) {
            loader = globalEval(result);
            return self[moduleLabel] = loader(moduleName);
          }
        });
      };
      setGlobals = function(obj) {
        var key, value;
        for (key in obj) {
          value = obj[key];
          self[key] = value;
        }
      };
      setScripts = function(scripts) {
        return _scriptsLoaded = new Promise(function(finalResolve, finalReject) {
          var completedScripts, i, len, script, scriptPromise;
          completedScripts = 0;
          for (i = 0, len = scripts.length; i < len; i++) {
            script = scripts[i];
            scriptPromise = (function() {
              switch (typeof script) {
                case 'function':
                  return Promise.resolve(script.call(self));
                case 'string':
                  if (script.slice(0, 7) === 'MODULE:') {
                    return fetchModule(script.slice(7));
                  } else {
                    return fetchExternal(script).then(function(result) {
                      if (result) {
                        return globalEval("(" + result + ")");
                      }
                    });
                  }
                  break;
                default:
                  return Promise.resolve();
              }
            })();
            scriptPromise.then(function() {
              if (++completedScripts === scripts.length) {
                return finalResolve();
              }
            })["catch"](finalReject);
          }
        });
      };
      run = function(ID, args) {
        if (args == null) {
          args = [];
        }
        return _scriptsLoaded.then(function() {
          var err, error, hasError, result;
          try {
            result = _fnToExecute.apply(_fnContext, args);
          } catch (error) {
            err = error;
            postMessage({
              ID: ID,
              status: 'reject',
              payload: stringifyError(err)
            });
            hasError = true;
          }
          if (!hasError) {
            return Promise.resolve(result).then(function(result) {
              return postMessage({
                ID: ID,
                status: 'resolve',
                payload: helpers.stringifyPayload(result)
              });
            })["catch"](function(result) {
              return postMessage({
                ID: ID,
                status: 'reject',
                payload: helpers.stringifyPayload(result)
              });
            });
          }
        })["catch"](function(err) {
          return postMessage({
            ID: ID,
            status: 'reject',
            payload: stringifyError(err)
          });
        });
      };
      return this.onmessage = function(e) {
        var ID, command, payload;
        command = e.data.command;
        payload = e.data.payload;
        ID = e.data.ID;
        switch (command) {
          case 'setGlobals':
            return setGlobals(helpers.parsePayload(payload));
          case 'setScripts':
            return setScripts(helpers.parsePayload(payload));
          case 'setContext':
            return _fnContext = helpers.parsePayload(payload);
          case 'setFn':
            return _fnToExecute = globalEval("(" + payload + ")");
          case 'run':
            return run(ID, helpers.parsePayload(payload));
        }
      };
    })();
  };

  /* istanbul ignore next */
  FakeWorker = function() {
    var _fnContext, _fnToExecute, _globalsString, _scriptsLoaded, fetchExternal, fetchModule, postMessage, run, setFn, setGlobals, setScripts, threadEmit;
    this.isAlive = true;
    this.messageCallback = null;
    _fnToExecute = null;
    _fnContext = null;
    _globalsString = '';
    _scriptsLoaded = Promise.resolve();
    threadEmit = (function(_this) {
      return function(event, payload) {
        return postMessage({
          ID: event,
          payload: payload
        });
      };
    })(this);
    postMessage = (function(_this) {
      return function(message) {
        return _this.messageCallback(message);
      };
    })(this);
    fetchExternal = function(url) {
      return new Promise(function(resolve, reject) {
        var request;
        request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onerror = reject;
        request.onreadystatechange = function() {
          var ref;
          if (this.readyState === 4) {
            if ((200 >= (ref = this.status) && ref < 400)) {
              return resolve(this.responseText);
            } else {
              return reject(new Error("External fetch failed (status:" + this.status + "): " + this.responseText));
            }
          }
        };
        return request.send();
      });
    };
    fetchModule = function(module) {
      var moduleLabel, moduleName;
      moduleName = module.split('#')[0];
      moduleLabel = module.split('#')[1] || moduleName;
      moduleName = moduleName.replace(/\//g, '%2F');
      return fetchExternal("https://wzrd.in/bundle/" + moduleName).then(function(result) {
        if (result) {
          result = result.slice(0, -1);
          _globalsString += "var " + moduleLabel + " = (" + result + ")('" + moduleName + "');";
          return setFn();
        }
      });
    };
    setFn = function(fnString) {
      if (fnString == null) {
        fnString = _fnToExecute.toString();
      }
      return _fnToExecute = eval(_globalsString + " (" + fnString + ")");
    };
    setGlobals = function(obj) {
      _globalsString += helpers.stringifyAsGlobals(obj);
      setFn();
    };
    setScripts = function(scripts) {
      return _scriptsLoaded = new Promise((function(_this) {
        return function(finalResolve, finalReject) {
          var completedScripts, i, len, script, scriptPromise;
          completedScripts = 0;
          for (i = 0, len = scripts.length; i < len; i++) {
            script = scripts[i];
            scriptPromise = (function() {
              switch (typeof script) {
                case 'function':
                  return Promise.resolve(script.call(self));
                case 'string':
                  if (script.slice(0, 7) === 'MODULE:') {
                    return fetchModule(script.slice(7));
                  } else {
                    return fetchExternal(script).then(function(result) {
                      if (result) {
                        return eval("(" + result + ")");
                      }
                    });
                  }
                  break;
                default:
                  return Promise.resolve();
              }
            })();
            scriptPromise.then(function() {
              if (++completedScripts === scripts.length) {
                return finalResolve();
              }
            })["catch"](finalReject);
          }
        };
      })(this));
    };
    run = function(ID, args) {
      if (args == null) {
        args = [];
      }
      return _scriptsLoaded.then((function(_this) {
        return function() {
          var err, error, hasError, result;
          try {
            result = _fnToExecute.apply(_fnContext, args);
          } catch (error) {
            err = error;
            postMessage({
              ID: ID,
              status: 'reject',
              payload: err
            });
            hasError = true;
          }
          if (!hasError) {
            return Promise.resolve(result).then(function(payload) {
              return postMessage({
                ID: ID,
                status: 'resolve',
                payload: payload
              });
            })["catch"](function(payload) {
              return postMessage({
                ID: ID,
                status: 'reject',
                payload: payload
              });
            });
          }
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          return postMessage({
            ID: ID,
            status: 'reject',
            payload: err
          });
        };
      })(this));
    };
    this.onmessage = function(data) {
      var ID, command, payload;
      command = data.command;
      payload = data.payload;
      ID = data.ID;
      switch (command) {
        case 'setGlobals':
          return setGlobals(payload);
        case 'setScripts':
          return setScripts(payload);
        case 'setContext':
          return _fnContext = payload;
        case 'setFn':
          return setFn(payload);
        case 'run':
          return run(ID, payload);
      }
    };
    return this;
  };

  /* istanbul ignore next */
  FakeWorker.prototype = {
    addEventListener: function(event, callback) {
      if (this.isAlive) {
        return this.messageCallback = callback;
      }
    },
    postMessage: function(message) {
      if (this.isAlive) {
        return this.onmessage(message);
      }
    },
    terminate: function() {
      return this.isAlive = false;
    }
  };
  helpers = {};
  currentID = 0;
  helpers.genTransactionID = function() {
    return ++currentID;
  };
  helpers.extend = function(baseObj, objToInherit, keyToOmit) {
    var i, key, keys, len;
    keys = Object.keys(objToInherit);
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      if (key !== keyToOmit) {
        baseObj[key] = objToInherit[key];
      }
    }
    return baseObj;
  };
  helpers.createWorkerURI = function() {
    var blob, dependencies, workerScriptContents;
    workerScriptContents = workerScript.toString().match(functionBodyRegEx)[1];

    /* istanbul ignore next */
    dependencies = SimplyThread.threadDeps || '';
    dependencies += "var helpers=" + helpers.javascriptStringify(helpers.extend({}, helpers, 'javascriptStringify')) + '; helpers.exposeStringifyFn();';
    dependencies += "var PRIMITIVE_TYPES = " + (JSON.stringify(PRIMITIVE_TYPES)) + ";";
    dependencies += "var STRINGIFY_OPTS = " + (JSON.stringify(STRINGIFY_OPTS)) + ";";

    /* istanbul ignore next */
    if (!SUPPORTS.promises) {
      dependencies += promisePolyfill;
    }
    blob = new Blob([dependencies + workerScriptContents], {
      type: 'application/javascript'
    });

    /* istanbul ignore next */
    return (window.URL || window.webkitURL).createObjectURL(blob);
  };
  helpers.patchWorkerMethods = function(worker) {
    var origAddEventListener, origPostMessage;
    origPostMessage = worker.postMessage.bind(worker);
    worker.postMessage = function(message, shouldStringify) {
      if (shouldStringify == null) {
        shouldStringify = true;
      }
      if (shouldStringify) {
        message.payload = helpers.stringifyPayload(message.payload);
      }
      return origPostMessage(message);
    };
    origAddEventListener = worker.addEventListener.bind(worker);
    worker.addEventListener = function(event, callback) {
      return origAddEventListener(event, function(e) {
        var parseMethod;
        if (e.data.payload) {
          parseMethod = e.data.status === 'reject' ? 'parseRejection' : 'parsePayload';
          e.data.payload = helpers[parseMethod](e.data.payload);
        }
        return callback(e.data);
      });
    };
    return worker;
  };

  /* istanbul ignore next */
  helpers.stringifyAsGlobals = function(globals) {
    var globalsString, i, index, key, keys, len;
    globalsString = '';
    keys = Object.keys(globals);
    for (index = i = 0, len = keys.length; i < len; index = ++i) {
      key = keys[index];
      globalsString += key + "=" + (this.javascriptStringify(globals[key])) + (index === keys.length - 1 ? ';' : ',') + " ";
    }
    if (globalsString) {
      return "var " + globalsString;
    } else {
      return globalsString;
    }
  };
  helpers.stringifyPayload = function(payload) {
    var output;
    output = {
      type: typeof payload
    };

    /* istanbul ignore next */
    output.data = PRIMITIVE_TYPES[output.type] ? payload : this.javascriptStringify(payload, null, null, STRINGIFY_OPTS);
    return output;
  };
  helpers.parsePayload = function(payload) {
    if (PRIMITIVE_TYPES[payload.type]) {
      return payload.data;
    } else {
      return eval("(" + payload.data + ")");
    }
  };
  helpers.parseRejection = function(rejection) {
    var err, proxyErr;
    err = this.parsePayload(rejection);
    if (err && typeof err === 'object' && window[err.name] && window[err.name].constructor === Function) {
      proxyErr = new window[err.name](err.message);
      proxyErr.stack = err.stack;
      return proxyErr;
    } else {
      return err;
    }
  };

  /* istanbul ignore next */
  helpers.exposeStringifyFn = function() {
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
  helpers.exposeStringifyFn();
  functionBodyRegEx = /^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/;
  SUPPORTS = SimplyThread.SUPPORTS = {};
  SUPPORTS.promises = !!window.Promise;

  /* istanbul ignore next */
  SUPPORTS.workers = !!window.Worker && !!window.Blob && (!!window.URL || !!window.webkitURL) && (function() {
    try {
      (new Worker(helpers.createWorkerURI())).terminate();
      return true;
    } catch (undefined) {}
  })();
  PRIMITIVE_TYPES = {
    string: true,
    number: true,
    boolean: true,
    symbol: true
  };
  STRINGIFY_OPTS = {
    references: true
  };
  promisePolyfill = '(function(){"use strict";var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}} function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})}; function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};self.Promise||(self.Promise=n,self.Promise.resolve=u,self.Promise.reject=t,self.Promise.race=x,self.Promise.all=w,self.Promise.prototype.then=n.prototype.c,self.Promise.prototype["catch"]=n.prototype.g);}());';
  SimplyThread.version = '1.7.0';

  /* istanbul ignore next */
  if ((typeof exports !== "undefined" && exports !== null ? exports.module : void 0) != null) {
    return module.exports = SimplyThread;
  } else if (typeof define === 'function' && define.amd) {
    return define(['simplythread'], function() {
      return SimplyThread;
    });
  } else {
    return this.SimplyThread = SimplyThread;
  }
})();
