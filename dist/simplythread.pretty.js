// Generated by CoffeeScript 1.10.0
var slice = [].slice;

(function() {
  var SimplyThread, Thread, ThreadInterface, promisePolyfill, supports, workerScript;
  supports = {
    'workers': !!window.Worker && !!window.Blob && !!window.URL,
    'promises': !!window.Promise
  };
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
      threads.forEach(function(thread) {
        return thread.kill();
      });
      return this.list();
    };
    return this;
  };
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
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (typeof _this.fn === 'function') {
          return _this.thread.sendCommand('run', args).then(resolve, reject);
        } else {
          return reject(new Error('No function was set for this thread.'));
        }
      };
    })(this));
  };
  ThreadInterface.prototype.setFn = function(fn, context) {
    if (typeof fn === 'function') {
      this.fn = fn;
      this.fnString = fn.toString();
      this.thread.sendCommand('setFn', this.fnString);
      this.setContext(context);
    }
    return this;
  };
  ThreadInterface.prototype.setContext = function(context) {
    this.thread.sendCommand('setContext', context);
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
  Thread = function(fn1, fnString1) {
    this.fn = fn1;
    this.fnString = fnString1;
    this.worker = this.init();
    if (this.fn) {
      this.sendCommand('setFn', this.fnString);
    }
    return this;
  };
  Thread.prototype.init = function() {
    if (!supports.workers) {
      return false;
    } else {
      return new Worker(this.createURI());
    }
  };
  Thread.prototype.createURI = function() {
    var blob, workerScriptContents;
    workerScriptContents = workerScript.toString().match(/^\s*function\s*?\(\)\{(.+)\}\s*$/)[1];
    if (!supports.promises) {
      workerScriptContents += promisePolyfill;
    }
    blob = new Blob([workerScriptContents], {
      type: 'application/javascript'
    });
    return URL.createObjectURL(blob);
  };
  Thread.prototype.sendCommand = function(command, payload) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var handleMessage;
        if (_this.worker) {
          handleMessage = function(e) {
            switch (e.data.status) {
              case 'resolve':
                resolve(e.data.payload);
                break;
              case 'reject':
                reject(e.data.payload);
            }
            return _this.worker.removeEventListener('message', handleMessage);
          };
          if (command === 'run') {
            _this.worker.addEventListener('message', handleMessage);
          }
          return _this.worker.postMessage({
            command: command,
            payload: payload
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
                return _this.fn = payload;
              }
              break;
            case 'setContext':
              return _this.context = payload;
          }
        }
      };
    })(this));
  };
  workerScript = function() {
    var fnContext, fnToExecute, onmessage, run, setContext, setFn;
    fnToExecute = function() {};
    fnContext = null;
    onmessage = function(e) {
      var command, payload;
      command = e.data.command;
      payload = e.data.payload;
      switch (command) {
        case 'setContext':
          return setContext(payload);
        case 'setFn':
          return setFn(payload);
        case 'run':
          return run(payload);
      }
    };
    setContext = function(context) {
      return fnContext = context;
    };
    setFn = function(fnString) {
      return eval("fnToExecute = " + fnString);
    };
    run = function(args) {
      var err, error, hasError, result;
      if (args == null) {
        args = [];
      }
      try {
        result = fnToExecute.apply(fnContext, args);
      } catch (error) {
        err = error;
        postMessage({
          status: 'reject',
          payload: err.name + ": " + err.message
        });
        hasError = true;
      }
      if (!hasError) {
        if (result && result.then) {
          result.then(function(result) {
            return postMessage({
              'status': 'resolve',
              'payload': result
            });
          });
          return result["catch"](function(result) {
            return postMessage({
              'status': 'reject',
              'payload': result
            });
          });
        } else {
          return postMessage({
            'status': 'resolve',
            'payload': result
          });
        }
      }
    };
  };
  promisePolyfill = '(function(){"use strict";var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}} function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})}; function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};window.Promise||(window.Promise=n,window.Promise.resolve=u,window.Promise.reject=t,window.Promise.race=x,window.Promise.all=w,window.Promise.prototype.then=n.prototype.c,window.Promise.prototype["catch"]=n.prototype.g);}());';
  return window.SimplyThread = SimplyThread;
})();
