Test.extend({
  AsyncSteps: new JS.Class(JS.Module, {
    define: function(name, method) {
      this.callSuper(name, function() {
        var args = [name, method].concat(JS.array(arguments));
        this.__enqueue__(args);
      });
    },

    included: function(klass) {
      klass.include(Test.AsyncSteps.Sync);
      if (!klass.blockTransform) return;

      klass.extend({
        blockTransform: function(block) {
          return function(resume) {
            this.exec(block, function(error) {
              this.sync(function() { resume(error) });
            });
          };
        }
      });
    },

    extend: {
      Sync: new JS.Module({
        __enqueue__: function(args) {
          this.__stepQueue__ = this.__stepQueue__ || [];
          this.__stepQueue__.push(args);
          if (this.__runningSteps__) return;
          this.__runningSteps__ = true;

          var setTimeout = Test.FakeClock.REAL.setTimeout;
          setTimeout(this.method('__runNextStep__'), 1);
        },

        __runNextStep__: function(error) {
          if (typeof error === 'object' && error !== null) return this.addError(error);

          var step = this.__stepQueue__.shift(), n;

          if (!step) {
            this.__runningSteps__ = false;
            if (!this.__stepCallbacks__) return;

            n = this.__stepCallbacks__.length;
            while (n--) this.__stepCallbacks__.shift().call(this);

            return;
          }

          var methodName = step.shift(),
              method     = step.shift(),
              parameters = step.slice(),
              block      = function() { method.apply(this, parameters) };

          parameters[method.length - 1] = this.method('__runNextStep__');
          if (!this.exec) return block.call(this);
          this.exec(block, function() {}, this.method('__endSteps__'));
        },

        __endSteps__: function(error) {
          Test.Unit.TestCase.processError(this, error);
          this.__stepQueue__ = [];
          this.__runNextStep__();
        },

        addError: function() {
          this.callSuper();
          this.__endSteps__();
        },

        sync: function(callback) {
          if (!this.__runningSteps__) return callback.call(this);
          this.__stepCallbacks__ = this.__stepCallbacks__ || [];
          this.__stepCallbacks__.push(callback);
        }
      })
    }
  }),

  asyncSteps: function(methods) {
    return new this.AsyncSteps(methods);
  }
});

