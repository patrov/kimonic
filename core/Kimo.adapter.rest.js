define(["Kimo.Utils","Kimo.ModelManager","Kimo.ModelAdapter"], function(Utils,KimoModelManager,AdapterRegistry){
    var makeRestRequest = Utils.makeRestRequest;
    var restAdapter = {
        settings: {
            availableActions: ["create", "read", "update", "remove"]
        },
        invoke: function(action, model, repository, callbacks, params) {
            if (this.settings.availableActions[action] == "undefined")
                return false;
            if (typeof repository != "string")
                return false;
            var promise = this[action].call(this, model, repository, callbacks, params);
            return promise;
        },
        
        invokeRest : function(action,model,repository,callbacks,params){
            if (this.settings.availableActions[action] == "undefined") throw new "InvalidMethod";
            return this[action].call(this, model, repository,callbacks,params);  
        },
        
        create: function(model, repository, callbacks) {
            
            var data = {
                model: model.name,
                data: JSON.stringify(model.toJson(true))
            };
            
            return makeRestRequest(model.getPath(), {
                data: data,
                type: "POST",
                success: function(response) {
                    model.setUid(response.result.uid);
                    if (typeof callbacks.success == "function") {
                        callbacks.success(response.result);
                    }
                },
                error: function(response) {
                    if (typeof callbacks.error == "function") {
                        callbacks.error(response);
                    }
                }
            });
        },
        
        remove: function(model, repository, callbacks) {
            if (!model.isNew()) {
                var data = {
                    model: model.name,
                    data: model.toJson(true)
                };

                return makeRestRequest(model.getPath() + "/"+parseInt(model.getUid()), {
                    type: "DELETE",
                    success: function(response) {
                        if (typeof callbacks.success == "function") {
                            callbacks.success(response.result);
                        }
                    },
                    error: function(response) {
                        if (typeof callbacks.error == "function") {
                            callbacks.error(response);
                        }
                    }
                });
            }
        },
        update: function(model, repository, callbacks) {
            var promise = null;
            if (!model.isNew()) {
                promise = makeRestRequest(model.getPath()+"/update", {
                    data :{ data : JSON.stringify(model.toJson(true)) },
                    type: "POST",
                    success: function(response) {
                        if (typeof callbacks.success == "function") {
                            callbacks.success(response.result);
                        }
                    },
                    error: function(response) {
                        if (typeof callbacks.error == "function") {
                            callbacks.error(response);
                        }
                    }
                });
            }
            else {
                promise = this.create(model, repository, callbacks);
            }
            return promise;
        },
        /* repositoryMethod */
        find: function(repositoryName, id) {
            var repositoryInstance = Kimo.ModelManager.getRepository(repositoryName);
            var repository = repositoryName.replace(/repository/gi, "");
            return makeRestRequest(repositoryInstance.getPath()+"/"+id, {
                params: {
                    type:"GET"
                }
            });
        },
        
        findAll: function(repositoryName, options) {
            var repositoryInstance = Kimo.ModelManager.getRepository(repositoryName);
            var repository = repositoryName.replace(/repository/gi, "");
            options = options || {};
            return makeRestRequest(repositoryInstance.getPath()+"/findAll/"+repository, {
                type:"GET"
            });
           
        }
    };
    
    AdapterRegistry.register("restAdapter",restAdapter);
});