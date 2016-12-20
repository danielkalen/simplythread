// Generated by CoffeeScript 1.10.0
var FN, basePath, coverageObj, coverageVar, expect, isIE9, isLocalEnv, should;

mocha.setup('tdd');

mocha.slow(400);

mocha.bail();

expect = chai.expect;

should = chai.should();

if (location.origin == null) {
  location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '');
}

basePath = location.origin + location.pathname.replace(/\/[^\/]+$/, '');

basePath = basePath.replace(/\/test$/, '');

if (window.isKarma || window.isSauce) {
  basePath += '/base';
}

isIE9 = /MSIE 9/.test(navigator.userAgent);

isLocalEnv = window.location.protocol === 'file:';

Promise.config({
  warnings: false
});

if (typeof __coverage__ !== "undefined" && __coverage__ !== null) {
  coverageVar = Object.keys(window).filter(function(varKey) {
    return varKey.slice(0, 6) === '__cov_';
  })[0];
  coverageObj = __coverage__[Object.keys(__coverage__)[0]];
  SimplyThread.threadDeps = "var " + coverageVar + " = " + (JSON.stringify(coverageObj)) + ";";
}

FN = {
  subtracter: function(a, b) {
    return a - b;
  },
  adder: function(a, b) {
    return a + b;
  },
  adderPromise: function(a, b) {
    return new Promise(function(resolve) {
      return resolve(a + b);
    });
  },
  adderPromiseFail: function(a, b) {
    return new Promise(function(resolve, reject) {
      return reject(a + b);
    });
  },
  delayedPromise: function(a, b) {
    return new Promise(function(resolve) {
      return setTimeout((function() {
        return resolve(a + b);
      }), 150 * Math.random());
    });
  },
  context: function(num) {
    return this.prop + num;
  },
  contextReturn: function() {
    return this;
  },
  globals: function(propName) {
    return eval(propName);
  },
  globalsInvoker: function(propName, arg) {
    return eval(propName)(arg);
  },
  invoker: function(a, b) {
    return a(b);
  },
  emitter: function() {
    threadEmit('someEvent', 'first');
    setTimeout(function() {
      return threadEmit('diffEvent', 'second');
    }, 20);
    setTimeout(function() {
      return threadEmit('someEvent', 'third');
    }, 35);
    return setTimeout(function() {
      return threadEmit('diffEvent', 'fourth');
    }, 45);
  }
};

suite("SimplyThread", function() {
  suite(".create()", function() {
    test("will create a new thread with a given function", function() {
      var adderThread;
      adderThread = SimplyThread.create(FN.adder);
      expect(adderThread).to.have.any.keys('fn', 'status', 'fnString', 'worker', 'socket');
      expect(adderThread.fn).to.equal(FN.adder);
      expect(adderThread.status).to.equal('active');
      return adderThread.kill();
    });
    return test("will create a new thread without a function", function() {
      var emptyThread;
      emptyThread = SimplyThread.create();
      expect(emptyThread).to.have.any.keys('fn', 'fnString', 'status');
      expect(emptyThread.fn).to.not.exist;
      return emptyThread.kill();
    });
  });
  suite(".list()", function() {
    return test("will return an array containing all running threads", function() {
      var sampleThreads;
      sampleThreads = [SimplyThread.create(), SimplyThread.create(), SimplyThread.create()];
      expect(SimplyThread.list()).to.be.an('array');
      expect(SimplyThread.list()).to.have.members(sampleThreads);
      return sampleThreads.forEach(function(thread) {
        return thread.kill();
      });
    });
  });
  suite(".killAll()", function() {
    return test("will kill all running threads", function() {
      var sampleThreads;
      expect(SimplyThread.list().length).to.equal(0);
      sampleThreads = [SimplyThread.create(), SimplyThread.create(), SimplyThread.create()];
      expect(SimplyThread.list().length).to.equal(3);
      expect(SimplyThread.killAll()).to.be["true"];
      expect(SimplyThread.list()).to.not.have.members(sampleThreads);
      return expect(SimplyThread.list().length).to.equal(0);
    });
  });
  return suite("Thread", function() {
    var adderPromiseFailThread, adderPromiseThread, adderThread, contextReturnThread, contextThread, delayedPromiseThread, emitterThread, emptyThread, globalsInvokerThread, globalsThread, invokerThread, subtracterThread;
    emptyThread = adderThread = adderPromiseThread = adderPromiseFailThread = delayedPromiseThread = subtracterThread = contextThread = contextReturnThread = globalsThread = globalsInvokerThread = invokerThread = emitterThread = null;
    suiteSetup(function() {
      emptyThread = SimplyThread.create();
      adderThread = SimplyThread.create(FN.adder);
      adderPromiseThread = SimplyThread.create(FN.adderPromise);
      adderPromiseFailThread = SimplyThread.create(FN.adderPromiseFail);
      delayedPromiseThread = SimplyThread.create(FN.delayedPromise);
      subtracterThread = SimplyThread.create(FN.subtracter);
      contextThread = SimplyThread.create(FN.context);
      contextReturnThread = SimplyThread.create(FN.contextReturn);
      globalsThread = SimplyThread.create(FN.globals);
      globalsInvokerThread = SimplyThread.create(FN.globalsInvoker);
      invokerThread = SimplyThread.create(FN.invoker);
      return emitterThread = SimplyThread.create(FN.emitter);
    });
    suite(".run()", function() {
      test("will execute the given function with given arguments and return a thenable object (promise)", function() {
        var promise;
        promise = adderThread.run(10, 20);
        expect(promise.then).to.be.a('function');
        expect(promise["catch"]).to.be.a('function');
        return promise.then(function(result) {
          return expect(result).to.equal(30);
        });
      });
      test("will execute the same way with functions that return a promise", function() {
        var promise;
        promise = adderPromiseThread.run(10, 20);
        expect(promise.then).to.be.a('function');
        expect(promise["catch"]).to.be.a('function');
        return promise.then(function(result) {
          return expect(result).to.equal(30);
        });
      });
      test("will avoid conflicts with other runs of the same thread", function() {
        return Promise.all([delayedPromiseThread.run(5, 10), delayedPromiseThread.run(25, 75), delayedPromiseThread.run(100, 12)]).then(function(results) {
          expect(results[0]).to.equal(15);
          expect(results[1]).to.equal(100);
          return expect(results[2]).to.equal(112);
        });
      });
      test("will return an error if no function was given during thread creation or manually set", function() {
        return emptyThread.run()["catch"](function(err) {
          return expect(err).to.be.an('error');
        });
      });
      test("if an error occured in the thread the run promise should be rejected", function() {
        var errThread;
        errThread = SimplyThread.create(function() {
          throw new Error('sample error');
        });
        return errThread.run()["catch"](function(err) {
          expect(err).to.be.an('error');
          return errThread.kill();
        });
      });
      test("if an error occured in the thread then an error of the same type will be thrown on the main thread (via promise reject)", function() {
        window.errThread = SimplyThread.create(function() {
          throw new Error('sample error');
        });
        return errThread.run()["catch"](function(err) {
          expect(err).to.be.an('error');
          expect(err.constructor).to.equal(Error);
          return errThread.setFn(function() {
            return someUndefinedVariable;
          }).run()["catch"](function(err) {
            expect(err).to.be.an('error');
            expect(err.constructor).to.equal(ReferenceError);
            return errThread.setFn(function() {
              throw 'Non error object';
            }).run()["catch"](function(err) {
              expect(err).to.not.be.an('error');
              expect(err.constructor).to.equal(String);
              return errThread.kill();
            });
          });
        });
      });
      test("will return a rejected promise if the given function returned a rejected promise", function() {
        return adderPromiseFailThread.run(10, 20)["catch"](function(failure) {
          return expect(failure).to.equal(30);
        });
      });
      test("can pass functions as arguments", function() {
        var promise, sampleFn;
        sampleFn = function(string) {
          return string.toUpperCase();
        };
        promise = invokerThread.run(sampleFn, 'simplythread');
        expect(promise.then).to.be.a('function');
        expect(promise["catch"]).to.be.a('function');
        return promise.then(function(result) {
          return expect(result).to.equal('SIMPLYTHREAD');
        });
      });
      test("can return functions as results", function() {
        var curryFn, promise;
        curryFn = function(string) {
          return function(string) {
            return string.toUpperCase();
          };
        };
        promise = invokerThread.run(curryFn, 'simplythread');
        expect(promise.then).to.be.a('function');
        expect(promise["catch"]).to.be.a('function');
        return promise.then(function(result) {
          expect(result).to.be.a('function');
          return expect(result('simplythread')).to.equal('SIMPLYTHREAD');
        });
      });
      return test("invoking postMessage() from inside the thread should not cause any errors in the library", function() {
        var menaceThread;
        menaceThread = SimplyThread.create(function() {
          postMessage("I'm a menace");
          return "I'm a menace";
        });
        return expect(function() {
          return menaceThread.run().then(function(result) {
            expect(result).to.be.a.string;
            return menaceThread.kill();
          });
        }).not.to["throw"]();
      });
    });
    suite(".on()", function() {
      test("Will register an event and its callback to be invoked every time threadEmit(event) is invoked from the thread's main function", function() {
        return new Promise((function(_this) {
          return function(resolve) {
            var emitCount;
            _this.slow(700);
            emitCount = {
              someEvent: 0,
              diffEvent: 0
            };
            emitterThread.on('someEvent', function(payload) {
              if (emitCount.someEvent++) {
                return expect(payload).to.equal('third');
              } else {
                return expect(payload).to.equal('first');
              }
            });
            emitterThread.on('diffEvent', function(payload) {
              if (emitCount.diffEvent++) {
                return expect(payload).to.equal('fourth');
              } else {
                return expect(payload).to.equal('second');
              }
            });
            return emitterThread.run().then(function() {
              return setTimeout(function() {
                expect(emitCount.someEvent).to.equal(2);
                expect(emitCount.diffEvent).to.equal(2);
                return resolve();
              }, 75);
            });
          };
        })(this));
      });
      return test("Will throw an error if the second argument isn't a function", function() {
        expect(function() {
          return emitterThread.on('someEvent');
        }).to["throw"]();
        return expect(function() {
          return emitterThread.on('someEvent', {});
        }).to["throw"]();
      });
    });
    suite(".setFn()", function() {
      test("will execute empty threads normally if a function was later set with .setFn", function() {
        var myEmptyThread;
        myEmptyThread = SimplyThread.create();
        return myEmptyThread.setFn(FN.adder).run(20, 40).then(function(result) {
          expect(result).to.equal(60);
          return myEmptyThread.kill();
        });
      });
      test("will replace the existing function with the one specified", function() {
        var notEmptyThread;
        notEmptyThread = SimplyThread.create(FN.adder);
        return notEmptyThread.setFn(FN.subtracter).run(100, 75).then(function(result) {
          expect(result).to.equal(25);
          return notEmptyThread.kill();
        });
      });
      test("will use the second argument, if passed, as the context of the function", function() {
        var myContextReturnThread;
        myContextReturnThread = SimplyThread.create();
        return myContextReturnThread.setFn((function() {
          return this;
        }), {
          'prop': 5
        }).run().then(function(result) {
          expect(result).to.be.an('object');
          expect(result).to.have.keys('prop');
          return expect(result.prop).to.equal(5);
        });
      });
      return test("Will throw an error if the provided argument isn't a function", function() {
        expect(function() {
          return adderThread.setFn('someEvent');
        }).to["throw"]();
        expect(function() {
          return adderThread.setFn({});
        }).to["throw"]();
        return expect(function() {
          return adderThread.setFn();
        }).to["throw"]();
      });
    });
    suite(".setGlobals()", function() {
      test("receives an object as an argument and sets all of its values to the thread's global scope", function() {
        return globalsThread.setGlobals({
          'prop': 1000
        }).run('prop').then(function(result) {
          return expect(result).to.equal(1000);
        });
      });
      test("can set functions to be set as global variables", function() {
        return globalsInvokerThread.setGlobals({
          'someFn': function(string) {
            return string.toUpperCase();
          }
        }).run('someFn', 'simplythread').then(function(result) {
          return expect(result).to.equal('SIMPLYTHREAD');
        });
      });
      return test("will only accept an argument of type object (and not null)", function() {
        expect(function() {
          return globalsThread.setGlobals();
        }).to["throw"]();
        expect(function() {
          return globalsThread.setGlobals(null);
        }).to["throw"]();
        expect(function() {
          return globalsThread.setGlobals(function() {});
        }).to["throw"]();
        return expect(function() {
          return globalsThread.setGlobals({});
        }).not.to["throw"]();
      });
    });
    suite(".setScripts()", function() {
      test("will take an array of strings that act as network paths for external scripts and loads them inside the thread's global scope", function() {
        if (isLocalEnv) {
          return this.skip();
        } else {
          return globalsThread.setScripts([basePath + "/test/samplescript.js"]).run('sampleScriptName').then(function(result) {
            return expect(result).to.equal('just a sample script');
          });
        }
      });
      test("will load an external script when provided in a non-array format value", function() {
        if (isLocalEnv) {
          return this.skip();
        } else {
          return globalsThread.setScripts(basePath + "/test/samplescript.js").run('sampleScriptName').then(function(result) {
            return expect(result).to.equal('just a sample script');
          })["catch"](function(err) {
            return console.log(err);
          });
        }
      });
      test("will reject .run() calls' promises if failed to load any of the provided scripts", function() {
        if (isLocalEnv) {
          return this.skip();
        } else {
          return globalsThread.setScripts([basePath + "/test/samplescript.js", basePath + "/test/nonexistent.js"]).run('sampleScriptName').then(function(result) {
            return expect(true).to.be["false"];
          })["catch"](function(err) {
            return expect(err).to.be.an.error;
          });
        }
      });
      test("can load an NPM module when given a module's name with a 'MODULE:' prefix", function() {
        if (isLocalEnv || isIE9) {
          return this.skip();
        } else {
          return SimplyThread.create(function(arr) {
            return lodash.join(arr, '~');
          }).setScripts("MODULE:lodash").run(['a', 'b', 'c']).then(function(result) {
            return expect(result).to.equal('a~b~c');
          });
        }
      });
      test("can load an NPM module and expose it under a different name using 'MODULE:xyz#custonName'", function() {
        if (isLocalEnv || isIE9) {
          return this.skip();
        } else {
          return SimplyThread.create(function(timeFrame) {
            return TimeUNITS[timeFrame] * 3;
          }).setScripts("MODULE:timeunits#TimeUNITS").run('hour').then(function(result) {
            return expect(result).to.equal(10800000);
          });
        }
      });
      test("can accept functions that will be invoked immediatly on the thread's global scope", function() {
        return globalsThread.setScripts([
          function() {
            return this.scriptFromFn = 'just a sample script from a function';
          }
        ]).run('scriptFromFn').then(function(result) {
          return expect(result).to.equal('just a sample script from a function');
        });
      });
      return test("if passed functions that return a promise, that promise will be followed", function() {
        return globalsThread.setScripts([
          function() {
            return new Promise((function(_this) {
              return function(resolve) {
                return setTimeout(function() {
                  return resolve(_this.scriptFromFn = 'sample script via promise');
                });
              };
            })(this));
          }
        ]).run('scriptFromFn').then(function(result) {
          return expect(result).to.equal('sample script via promise');
        });
      });
    });
    suite(".setContext()", function() {
      test("will set the thread's function's 'this' keyword to the provided argument", function() {
        return contextThread.setContext({
          'prop': 5
        }).run(8).then(function(result) {
          return expect(result).to.equal(13);
        });
      });
      test("will use contexts that have functions", function() {
        return contextReturnThread.setContext({
          'name': 'someObject',
          'fn': function() {
            return 'blabla';
          }
        }).run().then(function(result) {
          expect(result).to.be.an('object');
          should.exist(result.name);
          should.exist(result.fn);
          expect(result.name).to.equal('someObject');
          return expect(result.fn()).to.equal('blabla');
        });
      });
      return test("will use contexts that have circular references and will omit DOM objects", function() {
        var obj, sub;
        obj = {
          subA: {
            'prop1': 'prop1',
            'prop2': 'prop2',
            'prop3': 'prop3'
          },
          subB: {
            'prop1': 'prop1',
            'prop2': 'prop2',
            'prop3': 'prop3'
          },
          subC: {
            'prop1': 'prop1',
            'prop2': 'prop2',
            'prop3': 'prop3'
          }
        };
        for (sub in obj) {
          obj[sub].parent = obj;
          obj[sub].self = obj[sub];
          obj[sub].DOM = jQuery('body')[0];
          obj[sub].DOM$ = jQuery('body');
        }
        obj.self = obj;
        return contextReturnThread.setContext(obj).run().then(function(result) {
          expect(result).to.be.an('object');
          should.exist(result.self);
          expect(result.subA).to.be.an('object');
          expect(result.subB).to.be.an('object');
          expect(result.subC).to.be.an('object');
          should.exist(result.subA.prop1);
          should.exist(result.subB.prop2);
          should.exist(result.subC.prop3);
          should.exist(result.subA.self);
          should.exist(result.subB.self);
          should.exist(result.subC.self);
          should.exist(result.subA.parent);
          should.exist(result.subB.parent);
          should.exist(result.subC.parent);
          should.exist(result.subA.DOM$);
          should.exist(result.subB.DOM$);
          should.exist(result.subC.DOM$);
          if (SimplyThread.SUPPORTS.workers) {
            should.not.exist(result.subA.DOM);
          }
          if (SimplyThread.SUPPORTS.workers) {
            should.not.exist(result.subB.DOM);
          }
          if (SimplyThread.SUPPORTS.workers) {
            should.not.exist(result.subC.DOM);
          }
          expect(result.self).to.equal(result);
          expect(result.subA.parent).to.equal(result);
          expect(result.subA.self).to.equal(result.subA);
          expect(result.subB.self).to.equal(result.subB);
          return expect(result.subC.self).to.equal(result.subC);
        });
      });
    });
    suite(".kill()", function() {
      test("will terminate the thread and set its status to 'dead'", function() {
        var sampleThread;
        sampleThread = SimplyThread.create();
        expect(sampleThread.status).to.equal('active');
        sampleThread.kill();
        return expect(sampleThread.status).to.equal('dead');
      });
      return test("will cause any function runs on a killed thread to do nothing", function(done) {
        var promise, sampleThread, status;
        status = {
          'resolved': false,
          'rejected': false
        };
        sampleThread = SimplyThread.create(FN.adder);
        sampleThread.kill();
        promise = sampleThread.run(1, 2);
        promise.then(function() {
          return status.resolved = true;
        });
        promise["catch"](function() {
          return status.rejected = true;
        });
        return setTimeout(function() {
          expect(status.resolved).to.be["false"];
          expect(status.rejected).to.be["false"];
          return done();
        }, 100);
      });
    });
    return suiteTeardown(function() {
      return SimplyThread.killAll();
    });
  });
});
