JS.Singleton = new JS.Class('Singleton', {
  initialize: function(name, parent, methods) {
    return new (new JS.Class(name, parent, methods));
  }
});

