/*** iterator ***/
var Iterator = function (data) {

    this.data = data;
    this.cursor = 0;

    if (this.hasNext !== "function") {

        Iterator.prototype.hasNext = function () {
            return this.data.length > this.cursor;
        }
    }

    Iterator.prototype.next = function () {
        var data = this.data[this.cursor];
        this.cursor = this.cursor + 1;
        console.log("cursor : " + this.cursor);
        return data;
    }

    Iterator.prototype.rewind = function () {
        this.cursor = 0;
    }

};

Iterator.create = function (collection) {
    if (Array.isArray(collection)) {
        return new Iterator(collection);
    }

    throw "IteratorException: collection should be an array.";
}


/*** iterator ***/
var TaskQueue = function () {

    /* init */
    var settings = {};
    TaskQueue.prototype.init = function (settings) {
        this.tasks = [];
        this.waitDuration = 800;
        this.intervalID = null;
        this.isProcessing = false;
        this.processingHandler = ( typeof settings.processingHandler === "function" ) ? settings.processingHandler : function () {
            throw "processingHandlerException";
        }
    }


    if (typeof this.add !== 'function') {
        TaskQueue.prototype.add = function (task) {
            this.tasks.push(task);
        }
    }

    TaskQueue.prototype.removeTask = function (task) {}

    TaskQueue.prototype.process = function () {
        if (this.isProcessing) {
            return false;
        }
        var iterator = Iterator.create(this.tasks);
        this.intervalID = setInterval(function () {
            if (iterator.hasNext()) {
                console.log(iterator.next());
            }

        }.bind(this), this.waitDuration);
    }

    TaskQueue.prototype.stop = function () {
        clearInterval(this.intervalID);
    }

    this.init.apply(this, arguments);

}