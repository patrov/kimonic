Test.Reporters.extend({
  TAP: new JS.Class({
    extend: {
      HOSTNAME: 'testling',

      create: function(options) {
        if (!JS.ENV.location) return;
        var parts = location.hostname.split('.');
        if (JS.indexOf(parts, this.HOSTNAME) >= 0) return new this(options);
      }
    },

    include: Console,

    startSuite: function(event) {
      this._testId = 0;
      this.puts('1..' + event.size);
    },

    startContext: function(event) {},

    startTest: function(event) {
      this._testPassed = true;
      this._faults = [];
    },

    addFault: function(event) {
      this._testPassed = false;
      this._faults.push(event);
    },

    endTest: function(event) {
      var line = this._testPassed ? 'ok' : 'not ok';
      line += ' ' + ++this._testId + ' - ' + this._format(event.fullName);
      this.puts(line);

      var fault, message, parts, j, m;
      for (var i = 0, n = this._faults.length; i < n; i++) {
        fault = this._faults[i];
        var message = fault.error.message;
        if (fault.error.backtrace) message += '\n' + fault.error.backtrace;
        parts = message.split(/[\r\n]/);
        for (j = 0, m = parts.length; j < m; j++)
          this.puts('    ' + parts[j]);
      }
    },

    endContext: function(event) {},

    update: function(event) {},

    endSuite: function(event) {},

    _format: function(string) {
      return string.replace(/[\s\t\r\n]+/g, ' ');
    }
  })
});

Test.Reporters.register('tap', Test.Reporters.TAP);

