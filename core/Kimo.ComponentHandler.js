/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


define(["require", "Kimo.Utils", "jquery" ,"Kimo.Observable"], function (require, Utils, jQuery, Observable) {

    /* find all */
        jQuery.extend(jQuery.expr[':'], {
            kimo: function (node) {
                return /^kimo\-/i.test(node.nodeName);
            }
    });


    var ComponentHandler = (function () {

        var settings = {
            marker: "kimo",
            renderTimeout : 3000,
            loadingMsg: "Loading"
        },

        componentsList = {name : [],  },


        /* keep instance, know when a component is ready it's ready
         *
         * ComponentHandler.get("pager")
         * ComponentHandler.on("page:id", "selected", handler);
         *
         * */

        on = function (componentName, eventName, handler) {

        },

        handle = function (componentInfos) {
            try {
                var componentName = "component!" + componentInfos.params.application + ':' + componentInfos.component;

                Utils.requireWithPromise([componentName]).done(function (component) {
                    checkComponent(component);
                    component.init(componentInfos);
                    /* initialize */
                    handleComponentReady(component)
                    jQuery(componentInfos.node).replaceWith(component.render());

                }).fail(function (response) {
                   console.log(response);
                });

            } catch (e) {
                console.log("Error Blaze", e);
            }
        },

        handleComponentReady = function (component) {
            /* when component is ready execute execute execute message*/
        },

        checkComponent = function (component) {
            if (!component.hasOwnProperty("init")) {
                throw new Error("ComponentException. Component must provide an [init] function.");
            }
            if (!component.hasOwnProperty("render")) {
                throw new Error("ComponentException. Component must provide an [render] function.");
            }
        },

        init = function (config) {
            /* register marker here */
            settings = jQuery.extend({}, settings, config);
            Observable.registerEvents(["viewReady"]);
            Observable.on("viewReady", function (view) {
                parseTemplate(view)
           });
        },

        parseTag = function (node) {
            var tagInfos = {},
                infos = node.nodeName.split("-");
            tagInfos.params = jQuery(node).data();
            tagInfos.component = infos[1].toLowerCase();
            tagInfos.node = node;
            tagInfos.content = jQuery(node).html();
            return tagInfos;
        },

        parseTemplate = function (template) {
         var componentTags = jQuery(template).find(':kimo'),
             component;

         jQuery.each(componentTags, function (i) {
             componentTag = componentTags[i];
             handle(parseTag(componentTag));
         });
        };

        return {
            init: init
        };
    })();
    return ComponentHandler;
    Kimo.ComponentHandler = ComponentHandler;
});