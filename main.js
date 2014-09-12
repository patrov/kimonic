/*require path*/
/**
 * 1. first the core
 * 2. application
 **/
var Kimo = Kimo || {};
Kimo.require = (function(r) {
    r.config({
        baseUrl: "js/",
        catchError:true,
        paths: {
            "Kimo.ActivityManager": "kimonic/core/Kimo.ActivityManager",
            "Kimo.ApplicationManager": "kimonic/core/Kimo.ApplicationManager",
            "Kimo.DataView": "kimonic/core/Kimo.DataView",
            "Kimo.ModelManager": "kimonic/core/Kimo.ModelManager",
            "Kimo.DbManager": "kimonic/core/Kimo.DbManager",
            "Kimo.EntityView": "kimonic/core/Kimo.EntityView",
            "Kimo.FormManager": "kimonic/core/Kimo.FormManager",
            "Kimo.Observable": "kimonic/core/Kimo.Observable",
            "Kimo.ModelAdapter": "kimonic/core/Kimo.ModelAdapter",
            "Kimo.restAdapter": "kimonic/core/Kimo.adapter.rest",
            "Kimo.rpcAdapter": "kimonic/core/Kimo.adapter.jsonrpc",
            "Kimo.NavigationManager": "kimonic/core/Kimo.NavigationManager",
            "Kimo.ParamsContainer": "kimonic/core/Kimo.ParamsContainer",
            "Kimo.Utils": "kimonic/core/Kimo.Utils",
            "Kimo.ViewStack": "kimonic/core/Kimo.ViewStack",
            "signals": "kimonic/vendor/crossroads/signals.min",
            "hasher": "kimonic/vendor/crossroads/hasher.min",
            "vendor.crossroads.main": "kimonic/vendor/crossroads/crossroads.min",
            "bootstrapJs": "kimonic/vendor/bootstrap/css/js/bootstrap.min",
            "vendor.dropzone": "kimonic/vendor/dropzone/dropzone.amd.module.min"
        },
        shim: {
            'Kimo': {
                exports: "Kimo"
            }
        }

    });
    return r;
})(require);

if (typeof define === "function" && define.amd && define.amd.jQuery) {
    define("jquery", [], function() {
        return jQuery;
    });
}

Kimo.requireWithPromise = function() {}

define("Kimo/core",
    ["require", "jquery",
    "Kimo.Observable",
    "Kimo.Utils",
    "Kimo.ViewStack",
    "Kimo.ActivityManager",
    "Kimo.ApplicationManager",
    "Kimo.DataView",
    "Kimo.ModelManager",
    "Kimo.DbManager",
    "Kimo.EntityView",
    "Kimo.FormManager",
    "Kimo.ModelAdapter",
    "Kimo.restAdapter",
    "Kimo.rpcAdapter",
    "Kimo.NavigationManager",
    "Kimo.ParamsContainer",
    "signals",
    "hasher",
    "vendor.crossroads.main",
    //"bootstrapJs",
    //  "Form.image"
    ], function(require, jQuery) {
        Kimo.jquery = jQuery.noConflict(true);
        $ = Kimo.jquery;
        return Kimo;
    })