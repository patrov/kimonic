/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


define(["jquery" ,"Kimo.Observable"], function (jQuery, Observable) {

    /* find all */
        jQuery.extend(jQuery.expr[':'], {
            kimo: function (e) {
                return /^kimo\-/i.test(this.nodeName);
            }
    });


    var ComponentHandler = (function () {
        var settings = {
            marker: "kimo"
        },

        loadComponent = function () {

        },

        init = function (config) {
            settings = jQuery.extend({}, settings, config);
            Observable.registerEvents(["viewReady"]);
            Observable.on("viewReady", function (view) {
                //parse here
           });
        },

        parseTag = function (tags) {
            jQuery(tags);
        },

        parseTemplate = function (template) {
         var componentTags = jQuery(template).find(':kimo'),
             component;
         jQuery.each(componentTags, function (i) {
             component = componentTags[i];
             handle(component);
         });
        };

        return {
            init: init
        };
    })();
    return ComponentHandler;
    Kimo.ComponentHandler = ComponentHandler;
});