define(["jquery", "Kimo.Observable", "nanoscroller"], function (jquery, Observable, nanoScroller) {
    var $ = jquery, _template, _itemRenderer,
    DataView = function (settings) {
        _template = "<div class='kimo ui datalist'>"
        +"<div class='datalist-header'>"
        +"<div class='toolbar btn-group'></div>"
        +"</div>"
        +"<div class='contentwrapper nano'><div class='itemcontainer nano-content'></div></div>"
        +"<div class='footer'></div>"
        +"</div>";
        _itemRenderer = "",
        this._settings = {
            title: "",
            data: {},
            idKey: "_cid",
            itemCls: "item",
            itemContainerClass: ".itemcontainer",
            toolbarContainerClass: ".toolbar",
            selectorCls: "itemSelected",
            pagination: {
                enable: 1,
                type: "scroll | paginate"
            },
            width: 500,
            appendToTop: false,
            height: 520,
            autoGrow: true,
            allowMultipleSelection: false,
            showHeader: true,
            showFooter: false,
            data: [] //data should be a repository
        };
        this._init = function (settings) {
            var observableMixin = $.extend(true, {}, Observable);
            $.extend(this, observableMixin);
            this._settings = $.extend(true, this._settings, settings);
            this.template = this._createTemplate();
            this.data = (typeof this._settings.data === "object") ? this._settings.data : {};
            this.itemContainer = this.template.find(".itemcontainer").eq(0);
            this.contentWrapper = this.template.find(".contentwrapper").eq(0);
            this.itemRenderer = this._settings.itemRenderer;
            this.emptyItemRenderer = this._settings.emptyItemRenderer;

            if (typeof this.emptyItemRenderer !=="function") {
                this.emptyItemRenderer = this._settings.emptyItemRenderer;
            }
            this.headerZone = this. template.find(".datalist-header").eq(0);
            this.toolbarContainer = this.template.find(this._settings.toolbarContainerClass).eq(0);
            this._buildToolbar(this._settings.buttons);
            this.registerEvents(["mouseOnItem", "itemSelected", "mouseLeaveItem", "itemEdited", "itemDeleted", "afterRender"]);
            this.selections = {};
            this.dataMap = {};
            this.selected = null;
            if (this._settings.loadingMsg) {
                $(this._settings.loadingMsg).addClass("kimo-loading-msg");
            }
            this.headerZone.hide();
            this._bindEvents();
            /* repository events */
            this._bindRepositoryEvents();
        }
        this._bindEvents = function () {
            var self = this;
            var itemClass = "." + this._settings.itemCls;
            $(this.itemContainer).delegate(itemClass, "click", function () {
                $(self.selected).removeClass(self._settings.selectorCls);
                $(this).addClass(self._settings.selectorCls);
                var itemId = $(this).data("item-uid");
                /* selected item */
                if (typeof self._settings.allowMultipleSelection === "boolean" && !self._settings.allowMultipleSelection) {
                    self.selections = {};
                }
                self.selections[itemId] = this;
                self.selected = this;
                self.trigger("itemSelected", {
                    data: self.selected
                });
            });
            $(this.itemContainer).delegate(itemClass, "mouseenter", function (e) {
                self.trigger("mouseOnItem", {
                    data: e.currentTarget,
                    dataItem: self.getDataByHtml(e.currentTarget)
                });
            });
            $(this.itemContainer).delegate(itemClass, "mouseleave", function (e) {
                self.trigger("mouseLeaveItem", {
                    data: e.currentTarget,
                    dataItem: self.getDataByHtml(e.currentTarget)
                });
            });

            /* show scroll use nano scroller if available*/
            $(this.itemContainer).bind("mouseenter", function () {
                $(this).css("overflow-y","auto");
            });

        /* $(this.itemContainer).bind("mouseleave",function(){
         $(this).css("overflow-y","hidden");
         });*/
        };
        this._bindRepositoryEvents = function () {
        /*  this.data.on("change",function(reason,entity){
         });
         */
        };
        this._buildToolbar = function (buttonInfos) {
            var toolbars = document.createDocumentFragment();
            for (var i in buttonInfos) {
                var btnConf = buttonInfos[i];
                var btn_span = $("<button/>").clone();
                btn_span.addClass("action");
                btn_span.addClass("btn btn-link btn-small pull-right");
                $(btn_span).text(" " + btnConf["text"]);
                $(btn_span).bind("click", $.proxy(btnConf["onclick"], this));
                /*handle ico*/
                if (typeof btnConf["ico"] === "string") {
                    var ico = $("<i/>").addClass(btnConf["ico"]);
                    $(btn_span).prepend($(ico));
                }
                toolbars.appendChild(btn_span.get(0));
            }
            this.toolbarContainer.html($(toolbars));
        }
        this._cleanItemActions = function () {
            $(this.itemContainer).find(".items-actions").remove();
        }
        /* default actions */
        this._buildItemActions = function (buttons) {
            var self = this;
            var defaultButtons = [{
                title: "edit",
                ico: "fa-pencil",
                click: function () {
                    var currentItem = $(this).closest("." + self._settings.itemCls);
                    self.trigger("itemEdited", {
                        data: currentItem
                    });
                }
            }, {
                title: "delete",
                ico: "fa-times",
                click: function () {
                    var currentItem = $(this).closest("." + self._settings.itemCls);
                    self.trigger("itemDeleted", {
                        data: currentItem
                    });
                }
            }, ];
            defaultButtons = $.merge(defaultButtons, buttons);
            var actions = document.createDocumentFragment();
            var actionsWrapper = $("<div/>").clone().addClass("items-actions btn-group");
            actionsWrapper.css({
                position: "absolute",
                top: "10px",
                right: "0px",
                marginRigth: "0px"
            });
            for (var i in defaultButtons) {
                var button = $("<button/>").clone();
                $(button).addClass("btn-link btn-small pull-right");
                var btnConf = defaultButtons[i];
                if (typeof btnConf["ico"] == "string") {
                    var ico = $("<i/>").addClass("fa " + btnConf["ico"]);
                    $(button).prepend($(ico));
                    $(button).bind("click", btnConf["click"]);
                }
                actions.appendChild($(button).get(0));
            }
            return actionsWrapper.append($(actions));
        }

        /* dessine les éléments */
        this._createTemplate = function () {
            var template = $(_template).clone(),
            css = {
                width: this._settings.width,
                height: this._settings.height,
                overflow: "hidden"
            },
            height;

            if (this._settings.maxHeight) {
                css.height = this._settings.maxHeight;
            }

            if (this._settings.autoGrow) {
                delete css.height;
                css.maxHeight = this._settings.height;
            /*compute here. item.size > maxHeight */
            }


            $(template).css({
                width: this._settings.width,
                height: this._settings.height
            });

            /* compute container size */
            height = Math.ceil(css.maxHeight * 90 / 100);
            $(template).find(".contentwrapper").eq(0).css({
                maxHeight: height + "px"
            });

            $(template).find(this._settings.itemContainerClass).css({
                "margin-top": "2px",
                "margin-bottom": "2px"
            // width: "98%",
            //height: "99%"
            });

            $(template).css(css);
            if (this._settings.showFooter) {
                $(template).find(".footer").css({
                    height: "30px",
                    width: "100%"
                });

            }
            return template;
        }
        /* called when new data arrives */
        this._draw = function (data, render) {
            $(this.itemContainer).find(".kimo-loading-msg").remove();
            data = $.isArray(data) ? data : [data];
            var container = document.createDocumentFragment();
            for (var item in data) {
                var itemData = data[item];
                item = this.itemRenderer.call(this, itemData);
                var cid = itemData[this._settings.idKey];
                $(item).data("item-uid", cid);
                $(item).attr("data-uid", cid);
                this.dataMap[cid] = itemData;
                $(item).addClass(this._settings.itemCls);
                container.appendChild($(item).get(0));
            }
            if (render) {
                return container;
            }
            var addFunc = (this._settings.appendToTop) ? "prepend" : "append";
            this.itemContainer[addFunc]($(container));
            this.updateMarkup();
        }
        /* initialiser */
        this._init(settings);
    }

    DataView.prototype.emptyItemRenderer = function () {
        return "";
    }

    DataView.prototype.updateMarkup = function () {
        var itemContainerHeight = $(this.itemContainer).height(),
        wrapperContainerHeight = $(this.contentWrapper).height();
        console.log(itemContainerHeight, wrapperContainerHeight);
        if (itemContainerHeight > wrapperContainerHeight) {
            //$(this.contentWrapper).nanoScroller();
        }
    }

    /* prototype */
    DataView.prototype.setData = function (data, updateContent) {
        this.data = data;
        if (updateContent) {
            this.reset();
            if(Array.isArray(data) && data.length === 0) {
                var render = this.emptyItemRenderer();
                this.itemContainer.html($(render));
                return;
            }
            this.addItem(data);
        }
    }

    DataView.prototype.showLoadingMsg = function () {
        if (this._settings.loadingMsg) {
            $(this.itemContainer).html($(this._settings.loadingMsg));
        }
    }

    DataView.prototype.getDataByHtml = function (html) {
        var cid = $(html).attr("data-uid");
        return this.dataMap[cid];
    }

    DataView.prototype.setRenderer = function (callback) {}
    /**
     * Item can be one single Item or collection
     **/
    DataView.prototype.addItem = function (item) {
        if (typeof item !== "object") throw Exception("item must be an object");
        this.trigger("beforeRender", {});
        this._draw(item);
        this.trigger("afterRender", {});
    }

    DataView.prototype.reset = function () {
        this.itemContainer.css("height", "auto");
        this.itemContainer.empty();
    }
    /* logique: remove from collection --> remove from list */
    DataView.prototype.removeSelection = function (selections) {
        if (typeof selections == "object") {
            $.each(selections, function (i, item) {
                $(item).remove();
            });
        }
    }
    /* use flag */
    DataView.prototype.removeItem = function (item) {
        var cid = item[this._settings.idKey];
        this.itemContainer.find("[data-uid='" + cid + "']").remove();
        this.trigger("afterRender", {});
    }
    /**
     * updateToolbar
     *
     */
    DataView.prototype.updateToolbar = function () {
        return {}
    }
    /* Select at */
    DataView.prototype.selectItem = function () {
        alert("selector");
    }

    DataView.prototype.updateItemActions = function (item, actions) {
        if (!item) return;
        this._cleanItemActions();
        actions = this._buildItemActions(actions);
        $(item).css("position", "relative");
        $(item).append(actions);
    }
    /* update*/
    DataView.prototype.updateData = function (item, action) {
        if (action === "create") {
            this.addItem(item);
        }
        if (action === "update") {
            var itemRender = this._draw(item, true);
            var idKey = item[this._settings.idKey];
            if ($("[data-uid='" + idKey + "']").length) { //change to item uid
                $("[data-uid='" + idKey + "']").replaceWith(itemRender);
            } else {
                this.addItem(item);
            }
        }
        if (action === "remove") {
            this.removeItem(item);
        }
    }

    DataView.prototype.render = function (container) {
        this._draw(this.data);
        $(container).html(this.template);
        var self = this;
        setTimeout(function () {
            $(self.contentWrapper).nanoScroller({
                flash: true
            });
        }, 200);

        /*use polyfile to hanel*/
    }

    Kimo.DataView = DataView;
    return DataView;
});