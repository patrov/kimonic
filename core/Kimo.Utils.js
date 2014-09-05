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
        })(),
        
        makeRequest :function(method, data,type) {
            var dfd = new $.Deferred();
            var params = {
                jsonrpc: "2.0",
                id: new Date().getTime(),
                params: data.params,
                method: method
            };

            var successCallback = function(response) {
                if (typeof data.success == "function") {
                    data.success(response);
                    dfd.resolve(response);
                } else {
                    dfd.resolve(response);
                }
            }

            var errorCallback = function(reason) {
                dfd.reject(reason);
            }
            
            $.ajax({
                url: "/service/gateway.php",
                data: JSON.stringify(params),
                type: "POST",
                async: (typeof data.async == "boolean") ? data.async : true,
                success: successCallback,
                error: errorCallback
            });
            return dfd.promise();
        },
        
        makeRestRequest :function(url,params) {
            var dfd = new $.Deferred();
            var successCallback = function(response) {
                if (typeof params.success == "function") {
                    params.success(response);
                    dfd.resolve(response);
                } else {
                    dfd.resolve(response);
                }
            }
            var errorCallback = function(reason) {
                dfd.reject(reason);
            }
           var defParams = {async:true, url:url, type:"GET", success:successCallback, error:errorCallback};
           defParams = $.extend(true,defParams,params); 
           console.log(defParams);
           /*remove data*/
            $.ajax(defParams);
            return dfd.promise();
        }
    }
    Kimo.Utils = Utils;
    return Utils;
});


/*Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};*/