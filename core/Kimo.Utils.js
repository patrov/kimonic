define([], function() {
    var Utils = {
        generateId: (function() {
            var genPrefix = "Item_";
            var current = 0;
            return function(prefix) {
                var currentPrefix = prefix || genPrefix;
                var currentTime = new Date().getTime();
                return currentPrefix + '_' + currentTime + '_' + current++;
            }
        })()
    }

Kimo.Utils = Utils;
return Utils;
});


/*Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};*/