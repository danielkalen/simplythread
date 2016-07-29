// Generated by CoffeeScript 1.10.0
var FN, expect, should;

expect = chai.expect;

should = chai.should();

FN = {
  err: function() {
    throw new Error('sample error');
  },
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
  context: function(num) {
    return this.prop + num;
  },
  contextReturn: function() {
    return this;
  },
  invoker: function(a, b) {
    return a(b);
  }
};

suite("SimplyThread", function() {
  suite(".create()", function() {
    test("will create a new thread with a given function", function() {
      var adderThread;
      adderThread = SimplyThread.create(FN.adder);
      adderThread.should.have.keys('fn', 'fnString', 'status');
      adderThread.fn.should.equal(FN.adder);
      adderThread.status.should.equal('active');
      return adderThread.kill();
    });
    return test("will create a new thread without a function", function() {
      var emptyThread;
      emptyThread = SimplyThread.create();
      emptyThread.should.have.keys('fn', 'fnString', 'status');
      should.not.exist(emptyThread.fn);
      return emptyThread.kill();
    });
  });
  suite(".list()", function() {
    return test("will return an array containing all running threads", function() {
      var sampleThreads;
      sampleThreads = [SimplyThread.create(), SimplyThread.create(), SimplyThread.create()];
      SimplyThread.list().should.be.an('array');
      SimplyThread.list().should.have.members(sampleThreads);
      return sampleThreads.forEach(function(thread) {
        return thread.kill();
      });
    });
  });
  suite(".killAll()", function() {
    return test("will kill all running threads", function() {
      var sampleThreads;
      sampleThreads = [SimplyThread.create(), SimplyThread.create(), SimplyThread.create()];
      SimplyThread.killAll().should.be.an('array');
      SimplyThread.killAll().should.not.have.members(sampleThreads);
      return sampleThreads.forEach(function(thread) {
        return thread.kill();
      });
    });
  });
  return suite("Thread", function() {
    var adderPromiseFailThread, adderPromiseThread, adderThread, contextReturnThread, contextThread, emptyThread, errThread, invokerThread, subtracterThread;
    emptyThread = errThread = adderThread = adderPromiseThread = adderPromiseFailThread = subtracterThread = contextThread = contextReturnThread = invokerThread = null;
    suiteSetup(function() {
      emptyThread = SimplyThread.create();
      errThread = SimplyThread.create(FN.err);
      adderThread = SimplyThread.create(FN.adder);
      adderPromiseThread = SimplyThread.create(FN.adderPromise);
      adderPromiseFailThread = SimplyThread.create(FN.adderPromiseFail);
      subtracterThread = SimplyThread.create(FN.subtracter);
      contextThread = SimplyThread.create(FN.context);
      contextReturnThread = SimplyThread.create(FN.contextReturn);
      return invokerThread = SimplyThread.create(FN.invoker);
    });
    suite(".run()", function() {
      test("will execute the given function with given arguments and return a thenable object (promise)", function(done) {
        var promise;
        promise = adderThread.run(10, 20);
        promise.then.should.be.a('function');
        promise["catch"].should.be.a('function');
        return promise.then(function(result) {
          result.should.equal(30);
          return done();
        });
      });
      test("will execute the same way with functions that return a promise", function(done) {
        var promise;
        promise = adderPromiseThread.run(10, 20);
        promise.then.should.be.a('function');
        promise["catch"].should.be.a('function');
        return promise.then(function(result) {
          result.should.equal(30);
          return done();
        });
      });
      test("will return an error if no function was given during thread creation or manually set", function(done) {
        return emptyThread.run()["catch"](function(err) {
          err.should.be.an('error');
          return done();
        });
      });
      test("if an error occured in the thread, promise should return it in its .catch() method (in a string version)", function(done) {
        return errThread.run()["catch"](function(err) {
          err.should.be.a('string');
          err.split(':')[0].should.match(/Error/);
          return done();
        });
      });
      test("will return a rejected promise if the given function returned a rejected promise", function(done) {
        return adderPromiseFailThread.run(10, 20)["catch"](function(failure) {
          failure.should.equal(30);
          return done();
        });
      });
      return test("can pass functions as arguments", function(done) {
        var promise, sampleFn;
        sampleFn = function(string) {
          return string.toUpperCase();
        };
        promise = invokerThread.run(sampleFn, 'simplythread');
        promise.then.should.be.a('function');
        promise["catch"].should.be.a('function');
        return promise.then(function(result) {
          result.should.equal('SIMPLYTHREAD');
          return done();
        }, function(err) {
          return console.log(err);
        });
      });
    });
    suite(".setFn()", function() {
      test("will execute empty threads normally if a function was later set with .setFn", function(done) {
        var myEmptyThread;
        myEmptyThread = SimplyThread.create();
        return myEmptyThread.setFn(FN.adder).run(20, 40).then(function(result) {
          result.should.equal(60);
          myEmptyThread.kill();
          return done();
        });
      });
      test("will replace the existing function with the one specified", function(done) {
        var notEmptyThread;
        notEmptyThread = SimplyThread.create(FN.adder);
        return notEmptyThread.setFn(FN.subtracter).run(100, 75).then(function(result) {
          result.should.equal(25);
          notEmptyThread.kill();
          return done();
        });
      });
      return test("will use the second argument, if passed, as the context of the function", function(done) {
        var myContextReturnThread;
        myContextReturnThread = SimplyThread.create();
        return myContextReturnThread.setFn((function() {
          return this;
        }), {
          'prop': 5
        }).run().then(function(result) {
          result.should.be.an('object');
          result.should.have.keys('prop');
          result.prop.should.equal(5);
          return done();
        });
      });
    });
    suite(".setContext()", function() {
      test("will set the function's 'this' keyword to the given argument", function(done) {
        return contextThread.setContext({
          'prop': 5
        }).run(8).then(function(result) {
          result.should.equal(13);
          return done();
        });
      });
      test("will use contexts that have function, but will omit them", function(done) {
        return contextReturnThread.setContext({
          'name': 'someObject',
          'fn': function() {
            return 'blabla';
          }
        }).run().then(function(result) {
          result.should.be.an('object');
          should.exist(result.name);
          should.not.exist(result.fn);
          return done();
        });
      });
      return test("will use contexts that have circular references (1 level max) and will omit DOM objects", function(done) {
        var obj, sub;
        obj = {
          'subA': {
            'prop1': 'prop1',
            'prop2': 'prop2',
            'prop3': 'prop3'
          },
          'subB': {
            'prop1': 'prop1',
            'prop2': 'prop2',
            'prop3': 'prop3'
          },
          'subC': {
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
          result.should.be.an('object');
          should.exist(result.self);
          result.subA.should.be.an('object');
          result.subB.should.be.an('object');
          result.subC.should.be.an('object');
          should.exist(result.subA.prop1);
          should.exist(result.subB.prop2);
          should.exist(result.subC.prop3);
          should.not.exist(result.subA.self);
          should.not.exist(result.subB.self);
          should.not.exist(result.subC.self);
          should.exist(result.subA.parent);
          should.exist(result.subB.parent);
          should.exist(result.subC.parent);
          should.exist(result.subA.DOM$);
          should.exist(result.subB.DOM$);
          should.exist(result.subC.DOM$);
          should.exist(result.subA.DOM);
          should.exist(result.subB.DOM);
          should.exist(result.subC.DOM);
          result.subA.DOM.should.be.empty;
          result.subB.DOM.should.be.empty;
          result.subC.DOM.should.be.empty;
          result.self.should.deep.equal(result);
          result.subA.parent.should.deep.equal(result);
          return done();
        });
      });
    });
    suite(".kill()", function() {
      test("will terminate the thread and set its status to 'dead'", function() {
        var sampleThread;
        sampleThread = SimplyThread.create();
        sampleThread.status.should.equal('active');
        sampleThread.kill();
        return sampleThread.status.should.equal('dead');
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
          status.resolved.should.be["false"];
          status.rejected.should.be["false"];
          return done();
        }, 100);
      });
    });
    return suiteTeardown(function() {
      return SimplyThread.killAll();
    });
  });
});
