define(['vendor.handlebars'], function (HandleBars) {
   var TemplateManager = {
        error: "",
        render: function (path, params) {
            var deferred = new $.Deferred(),
                self = this,
            params = params || {};
            var placeHolder = params.placeHolder || $("<div>Loading...</div>");
            
            require(["text!" + path], function(tpl){ 
                if(typeof params.dataLoader=="function"){
                    params.dataLoader().done(function(data){
                        params.data = data;
                        self.renderer(tpl, placeHolder, params);
                    });
                }else{
                    self.renderer(tpl, placeHolder, params);
                }
            }, function(){
                self.errorRenderer();
            });
            return placeHolder;
        },
        
        renderer: function(tpl, placeHolder, params){
            tpl = HandleBars.compile(tpl);
            var html = tpl(params.data);
            var action = params.renderAction || "html";
            $(placeHolder)[action](html);
        },
        
        errorRenderer: function(placeHolder){
            $(placeHolder).html("<p>Error while loadind the template...</p>");
        }
    }; 
    Kimo.TemplateManager = TemplateManager;
    return TemplateManager;
}); 


