Test.Mocking.extend({
  Parameters: new JS.Class({
    initialize: function(params, constructor, implementation) {
      this._params      = JS.array(params);
      this._constructor = constructor;
      this._fake        = implementation;
      this._expected    = false;
      this._callsMade   = 0;
    },

    withNew: function() {
      this._constructor = true;
      return this;
    },

    on: function(target) {
      this._target = target;
      return this;
    },

    given: function() {
      this._params = JS.array(arguments);
      return this;
    },

    returns: function() {
      this._returnIndex  = 0;
      this._returnValues = arguments;
      return this;
    },

    yields: function() {
      this._yieldIndex = 0;
      this._yieldArgs  = arguments;
      return this;
    },

    raises: function(exception) {
      this._exception = exception;
      return this;
    },

    expected: function() {
      this._expected = true;
      return this;
    },

    atLeast: function(n) {
      this._expected = true;
      this._minimumCalls = n;
      return this;
    },

    atMost: function(n) {
      this._expected = true;
      this._maximumCalls = n;
      return this;
    },

    exactly: function(n) {
      this._expected = true;
      this._expectedCalls = n;
      return this;
    },

    match: function(receiver, args, isConstructor) {
      var argsCopy = JS.array(args), callback, context;

      if (this._constructor !== isConstructor) return false;

      if (this._yieldArgs) {
        if (typeof argsCopy[argsCopy.length - 2] === 'function') {
          context  = argsCopy.pop();
          callback = argsCopy.pop();
        } else if (typeof argsCopy[argsCopy.length - 1] === 'function') {
          context  = null;
          callback = argsCopy.pop();
        }
      }

      if (this._target !== undefined && !Enumerable.areEqual(this._target, receiver))
        return false;
      if (!Enumerable.areEqual(this._params, argsCopy))
        return false;

      var result = {};

      if (this._exception) { result.exception = this._exception }
      if (this._yieldArgs) { result.callback = callback; result.context = context }
      if (this._fake)      { result.fake = this._fake }

      return result;
    },

    nextReturnValue: function() {
      if (!this._returnValues) return undefined;
      var value = this._returnValues[this._returnIndex];
      this._returnIndex = (this._returnIndex + 1) % this._returnValues.length;
      return value;
    },

    nextYieldArgs: function() {
      if (!this._yieldArgs) return undefined;
      var value = this._yieldArgs[this._yieldIndex];
      this._yieldIndex = (this._yieldIndex + 1) % this._yieldArgs.length;
      return value;
    },

    ping: function() {
      this._callsMade += 1;
    },

    toArray: function() {
      var array = this._params.slice();
      if (this._yieldArgs) array.push(new Test.Mocking.InstanceOf(Function));
      return array;
    },

    verify: function(object, methodName, original) {
      if (!this._expected) return;

      var okay = true, extraMessage;

      if (this._callsMade === 0 && this._maximumCalls === undefined && this._expectedCalls === undefined) {
        okay = false;
      } else if (this._expectedCalls !== undefined && this._callsMade !== this._expectedCalls) {
        extraMessage = this._createMessage('exactly');
        okay = false;
      } else if (this._maximumCalls !== undefined && this._callsMade > this._maximumCalls) {
        extraMessage = this._createMessage('at most');
        okay = false;
      } else if (this._minimumCalls !== undefined && this._callsMade < this._minimumCalls) {
        extraMessage = this._createMessage('at least');
        okay = false;
      }
      if (okay) return;

      var target = this._target || object, message;
      if (this._constructor) {
        message = new Test.Unit.AssertionMessage('Mock expectation not met',
                      '<?> expected to be constructed with\n(?)' +
                      (extraMessage ? '\n' + extraMessage : ''),
                      [original, this.toArray()]);
      } else {
        message = new Test.Unit.AssertionMessage('Mock expectation not met',
                      '<?> expected to receive call\n' + methodName + '(?)' +
                      (extraMessage ? '\n' + extraMessage : ''),
                      [target, this.toArray()]);
      }

      throw new Test.Mocking.ExpectationError(message);
    },

    _createMessage: function(type) {
      var actual = this._callsMade,
          report = 'but ' + actual + ' call' + (actual === 1 ? ' was' : 's were') + ' made';

      var copy = {
        'exactly':   this._expectedCalls,
        'at most':   this._maximumCalls,
        'at least':  this._minimumCalls
      };
      return type + ' ' + copy[type] + ' times\n' + report;
    }
  })
});

Test.Mocking.Parameters.alias({
  raising:    'raises',
  returning:  'returns',
  yielding:   'yields'
});

