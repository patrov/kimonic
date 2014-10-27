JS.ENV.Test = JS.ENV.Test || {}

Test.FakeClockSpec = JS.Test.describe(JS.Test.FakeClock, function() { with(this) {
  include(JS.Test.FakeClock)

  before(function() { this.clock.stub() })
  after(function() { this.clock.reset() })

  describe("setTimeout", function() { with(this) {
    before(function() { with(this) {
      this.calls = 0
      this.timer = setTimeout(function() { calls += 1 }, 1000)
    }})

    it("runs the timeout after clock has ticked enough", function() { with(this) {
      clock.tick(1000)
      assertEqual( 1, calls )
    }})

    it("runs the timeout after time has accumulated", function() { with(this) {
      clock.tick(500)
      assertEqual( 0, calls )
      clock.tick(500)
      assertEqual( 1, calls )
    }})

    it("only runs the timeout once", function() { with(this) {
      clock.tick(1500)
      assertEqual( 1, calls )
      clock.tick(1500)
      assertEqual( 1, calls )
    }})

    it("does not run the callback if it is cleared", function() { with(this) {
      clearTimeout(timer)
      clock.tick(1000)
      assertEqual( 0, calls )
    }})
  }})

  describe("setInterval", function() { with(this) {
    before(function() { with(this) {
      this.calls = 0
      this.timer = setInterval(function() { calls += 1 }, 1000)
    }})

    it("runs the timeout after clock has ticked enough", function() { with(this) {
      clock.tick(1000)
      assertEqual( 1, calls )
    }})

    it("runs the timeout after time has accumulated", function() { with(this) {
      clock.tick(500)
      assertEqual( 0, calls )
      clock.tick(500)
      assertEqual( 1, calls )
    }})

    it("runs the timeout repeatedly", function() { with(this) {
      clock.tick(1500)
      assertEqual( 1, calls )
      clock.tick(1500)
      assertEqual( 3, calls )
    }})

    it("does not run the callback if it is cleared", function() { with(this) {
      clearInterval(timer)
      clock.tick(1000)
      assertEqual( 0, calls )
    }})
  }})

  describe("with interleaved calls", function() { with(this) {
    before(function() { with(this) {
      this.calls = []

      setTimeout(function() {
        setTimeout(function() { calls.push("third") }, 100)
        calls.push("first")
      }, 50)

      setTimeout(function() { calls.push("second") }, 50)

      setInterval(function() { calls.push("ping") }, 40)
    }})

    it("schedules chains of functions correctly", function() { with(this) {
      clock.tick(150)
      assertEqual( ["ping", "first", "second", "ping", "ping", "third"], calls )
    }})
  }})

  describe("cancelling and resetting a timeout", function() { with(this) {
    before(function() { with(this) {
      this.calls = []
      this.timer = setTimeout(function() { calls.push("done") }, 1000)
    }})

    it("prolongs the delay before the timeout", function() { with(this) {
      clock.tick(500)
      clearTimeout(timer)
      setTimeout(function() { calls.push("done") }, 1000)
      clock.tick(500)
      assertEqual( [], calls )
      clock.tick(500)
      assertEqual( ["done"], calls )
    }})
  }})

  describe(Date, function() { with(this) {
    before(function() { with(this) {
      this.a = this.b = null
      setTimeout(function() { b = new Date().getTime() }, 100)
      a = new Date().getTime()
    }})

    it("mirrors the fake time", function() { with(this) {
      clock.tick(200)
      assertEqual( 100, b - a )
    }})
  }})
}})

