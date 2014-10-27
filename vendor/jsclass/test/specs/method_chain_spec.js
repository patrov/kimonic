JS.require('JS.MethodChain', function(MethodChain) {

JS.ENV.MethodChainSpec = JS.Test.describe(MethodChain, function() { with(this) {
  include(JS.Test.Helpers)

  define("Widget", new JS.Class({
      initialize: function(name) {
          this.name = name;
      },
      methodNameWeHaveProbablyNotSeenBefore: function() {
          return this.name.toLowerCase();
      }
  }))

  before(function() { with(this) {
    this.list  = ["food", "bar"]
    list.call  = function() { this.called = true }
    this.langs = ["ruby", "javascript", "scheme"]
    this.chain = new MethodChain(list)
  }})

  describe("method call", function() { with(this) {
    it("returns the chain object", function() { with(this) {
      assertSame( chain, chain.sort() )
    }})

    it("recognises methods added to custom classes", function() { with(this) {
      assertSame( chain, chain.methodNameWeHaveProbablyNotSeenBefore() )
    }})
  }})

  describe("#__exec__", function() { with(this) {
    describe("with no stored calls", function() { with(this) {
      it("returns its base object unmodified", function() { with(this) {
        assertEqual( list, chain.__exec__() )
      }})

      it("returns the exec argument if given", function() { with(this) {
        assertEqual( langs, chain.__exec__(langs) )
      }})
    }})

    describe("with one stored property accessor", function() { with(this) {
      before(function() { this.chain.length() })

      it("gets the named property from the argument", function() { with(this) {
        assertEqual( 2, chain.__exec__() )
        assertEqual( 3, chain.__exec__(langs) )
      }})
    }})

    describe("with one stored method call", function() { with(this) {
      before(function() { this.chain.sort() })

      it("calls the stored method on the argument", function() { with(this) {
        assertEqual( ["bar", "food"], chain.__exec__() )
        assertEqual( ["javascript", "ruby", "scheme"], chain.__exec__(langs) )
      }})

      it("recognises methods added to custom classes", function() { with(this) {
        var chain = new MethodChain()
        chain.methodNameWeHaveProbablyNotSeenBefore()
        assertEqual( "nick", chain.__exec__(new Widget("Nick")) )
      }})
    }})

    describe("with one stored method with an argument", function() { with(this) {
      before(function() { with(this) {
        chain.sort(function(a,b) { return a.length - b.length })
      }})

      it("calls the stored method with the stored argument", function() { with(this) {
        assertEqual( ["bar", "food"], chain.__exec__() )
        assertEqual( ["ruby", "scheme", "javascript"], chain.__exec__(langs) )
      }})
    }})

    describe("with a chain of stored methods", function() { with(this) {
      before(function() { with(this) {
        this.string = "something else"
        this.chain  = new MethodChain(string)
        chain.toUpperCase().replace(/[aeiou]/ig, "_")
      }})

      it("executes the stored methods as a chain", function() { with(this) {
        assertEqual( "S_M_TH_NG _LS_", chain.__exec__() )
      }})
    }})
  }})

  describe("#__", function() { with(this) {
    describe("in MethodChain", function() { with(this) {
      describe("with an object", function() { with(this) {
        it("changes the base object for the rest of the chain", function() { with(this) {
          chain.__(["another", "list"]).sort()
          assertEqual( ["another", "list"], chain.__exec__() )
        }})

        it("does not stop previous calls going to the old base object", function() { with(this) {
          chain.call().__(["another", "list"]).sort()
          assert( !list.called )
          chain.__exec__()
          assert( list.called )
        }})
      }})

      describe("with a function", function() { with(this) {
        it("adds a function to the chain", function() { with(this) {
          chain.__(function() { return this.slice(1) })
          assertEqual( ["bar"], chain.__exec__() )
        }})

        it("adds a function with arguments to the chain", function() { with(this) {
          chain.__(function(method, arg) { return this[method](arg) }, "slice", 1)
          assertEqual( ["bar"], chain.__exec__() )
        }})

        it("uses the return value as the new base object", function() { with(this) {
          chain.__(function() { return "word" }).toUpperCase()
          assertEqual( "WORD", chain.__exec__() )
        }})
      }})
    }})

    describe("in Kernel", function() { with(this) {
      before(function() { with(this) {
        this.widget = new Widget("Nick")
      }})

      it("returns the object given to it", function() { with(this) {
        assertSame( list, widget.__(list) )
      }})

      it("applies a function to the receiver", function() { with(this) {
        assertEqual( "Nick", widget.__(function() { return this.name }) )
      }})

      it("applies a function with arguments to the receiver", function() { with(this) {
        assertEqual( "Nick and David", widget.__(function(name) { return this.name + " and " + name }, "David") )
      }})
    }})
  }})

  describe("#toFunction", function() { with(this) {
    it("returns a function that executes the chain against the argument", function() { with(this) {
      var func = chain.sort().toFunction()
      assertEqual( $w("ordered some words"), func($w("some ordered words")) )
    }})
  }})
}})

})

