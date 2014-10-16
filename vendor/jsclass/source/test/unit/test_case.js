Test.Unit.extend({
  TestCase: new JS.Class({
    include: Test.Unit.Assertions,

    extend: {
      STARTED:  'Test.Unit.TestCase.STARTED',
      FINISHED: 'Test.Unit.TestCase.FINISHED',

      reports:   [],
      handlers:  [],

      clear: function() {
        this.testCases = [];
      },

      inherited: function(klass) {
        if (!this.testCases) this.testCases = [];
        this.testCases.push(klass);
      },

      pushErrorCathcer: function(handler, push) {
        if (!handler) return;
        this.popErrorCathcer(false);

        if (Console.NODE)
          process.addListener('uncaughtException', handler);
        else if (Console.BROWSER)
          window.onerror = handler;

        if (push !== false) this.handlers.push(handler);
        return handler;
      },

      popErrorCathcer: function(pop) {
        var handlers = this.handlers,
            handler  = handlers[handlers.length - 1];

        if (!handler) return;

        if (Console.NODE)
          process.removeListener('uncaughtException', handler);
        else if (Console.BROWSER)
          window.onerror = null;

        if (pop !== false) {
          handlers.pop();
          this.pushErrorCathcer(handlers[handlers.length - 1], false);
        }
      },

      processError: function(testCase, error) {
        if (!error) return;

        if (Test.Unit.isFailure(error))
          testCase.addFailure(error.message);
        else
          testCase.addError(error);
      },

      runWithExceptionHandlers: function(testCase, _try, _catch, _finally) {
        try {
          _try.call(testCase);
        } catch (e) {
          if (_catch) _catch.call(testCase, e);
        } finally {
          if (_finally) _finally.call(testCase);
        }
      },

      metadata: function() {
        var shortName = this.displayName,
            context   = [],
            klass     = this,
            root      = Test.Unit.TestCase;

        while (klass !== root) {
          context.unshift(klass.displayName);
          klass = klass.superclass;
        }
        context.pop();

        return {
          fullName:   this === root ? '' : context.concat(shortName).join(' '),
          shortName:  shortName,
          context:    this === root ? null : context
        };
      },

      suite: function(filter) {
        var metadata    = this.metadata(),
            root        = Test.Unit.TestCase,
            fullName    = metadata.fullName,
            methodNames = new Enumerable.Collection(this.instanceMethods(false)),
            suite       = [],
            children    = [],
            child, i, n;

        var tests = methodNames.select(function(name) {
              if (!/^test./.test(name)) return false;
              name = name.replace(/^test:\W*/ig, '');
              return this.filter(fullName + ' ' + name, filter);
            }, this).sort();

        for (i = 0, n = tests.length; i < n; i++) {
          try { suite.push(new this(tests[i])) } catch (e) {}
        }

        if (this.testCases) {
          for (i = 0, n = this.testCases.length; i < n; i++) {
            child = this.testCases[i].suite(filter);
            if (child.size() === 0) continue;
            children.push(this.testCases[i].displayName);
            suite.push(child);
          }
        }

        metadata.children = children;
        return new Test.Unit.TestSuite(metadata, suite);
      },

      filter: function(name, filter) {
        if (!filter || filter.length === 0) return true;

        var n = filter.length;
        while (n--) {
          if (name.indexOf(filter[n]) >= 0) return true;
        }
        return false;
      }
    },

    initialize: function(testMethodName) {
      if (typeof this[testMethodName] !== 'function') throw 'invalid_test';
      this._methodName = testMethodName;
      this._testPassed = true;
    },

    run: function(result, continuation, callback, context) {
      callback.call(context, this.klass.STARTED, this);
      this._result = result;

      var teardown = function(error) {
        this.klass.processError(this, error);

        this.exec('teardown', function(error) {
          this.klass.processError(this, error);

          this.exec(function() { Test.Unit.mocking.verify() }, function(error) {
            this.klass.processError(this, error);

            result.addRun();
            callback.call(context, this.klass.FINISHED, this);
            continuation();
          });
        });
      };

      this.exec('setup', function() {
        this.exec(this._methodName, teardown);
      }, teardown);
    },

    exec: function(methodName, onSuccess, onError) {
      if (!methodName) return onSuccess.call(this);

      if (!onError) onError = onSuccess;

      var arity = (typeof methodName === 'function')
                ? methodName.length
                : this.__eigen__().instanceMethod(methodName).arity,

          callable = (typeof methodName === 'function') ? methodName : this[methodName],
          timeout  = null,
          failed   = false,
          resumed  = false,
          self     = this;

      if (arity === 0)
        return this.klass.runWithExceptionHandlers(this, function() {
          callable.call(this);
          onSuccess.call(this);
        }, onError);

      var onUncaughtError = function(error) {
        failed = true;
        self.klass.popErrorCathcer();
        if (timeout) JS.ENV.clearTimeout(timeout);
        onError.call(self, error);
      };
      this.klass.pushErrorCathcer(onUncaughtError);

      this.klass.runWithExceptionHandlers(this, function() {
        callable.call(this, function(asyncResult) {
          resumed = true;
          self.klass.popErrorCathcer();
          if (timeout) JS.ENV.clearTimeout(timeout);
          if (failed) return;

          if (typeof asyncResult === 'string') asyncResult = new Error(asyncResult);

          if (typeof asyncResult === 'object' && asyncResult !== null)
            onUncaughtError(asyncResult);
          else if (typeof asyncResult === 'function')
            self.exec(asyncResult, onSuccess, onError);
          else
            self.exec(null, onSuccess, onError);
        });
      }, onError);

      if (resumed || !JS.ENV.setTimeout) return;

      timeout = JS.ENV.setTimeout(function() {
        failed = true;
        self.klass.popErrorCathcer();
        var message = 'Timed out after waiting ' + Test.asyncTimeout + ' seconds for test to resume';
        onError.call(self, new Error(message));
      }, Test.asyncTimeout * 1000);
    },

    setup: function() {},

    teardown: function() {},

    passed: function() {
      return this._testPassed;
    },

    size: function() {
      return 1;
    },

    addAssertion: function() {
      this._result.addAssertion();
    },

    addFailure: function(message) {
      this._testPassed = false;
      this._result.addFailure(new Test.Unit.Failure(this, message));
    },

    addError: function(exception) {
      this._testPassed = false;
      this._result.addError(new Test.Unit.Error(this, exception));
    },

    metadata: function() {
      var klassData = this.klass.metadata(),
          shortName = this._methodName.replace(/^test:\W*/ig, '');

      return {
        fullName:   klassData.fullName + ' ' + shortName,
        shortName:  shortName,
        context:    klassData.context.concat(klassData.shortName)
      };
    },

    toString: function() {
      return 'TestCase{' + this.metadata().fullName + '}';
    }
  })
});

