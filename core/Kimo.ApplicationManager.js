/* app instance should use they own instance of */
define(["Kimo.NavigationManager","Kimo.ActivityManager","Kimo.ViewStack"],function(NavigationManager,ActivityManager,ViewStack){
    
    var ApplicationManager = (function(e,c){
        var d = {};  //activities container
        
        
        /* Abstract App */
        AbstractApplication = function(){};
        AbstractApplication.prototype._init = function(){
            this.viewManager = new ViewStack();
            this.viewManager.configure(this.getParam("viewSettings"));
            this.router = null; // save an instance of Navigation Manager
            this.activitiesMap = [];
            this.activityManager = null; 

        };
    
        AbstractApplication.prototype.onError = function(i){
            console.log("default onError");
        };
         AbstractApplication.prototype.setActivityManager = function(activityMng){
           this.activityManager = activityMng;
        };
        
        AbstractApplication.prototype.getParam = function(key){
            var result = false;
            if(key in this._settings){
                result = this._settings[key]
            }
            return result;
        };
    
        var f = function(){
            return d
        };
    
        window.onerror = (function(appCtn){
            return function(l,k,j){
                var m = f();
                var n = m[e];
                if(typeof n!="undefined" && typeof n.onError=="function"){
                    var i={};
        
                    i.type="error";
                    i.msg=l;
                    i.line=j;
                    i.file=k;
                    n.onError(i);
                    return true;
                }
            }
        })()
    
        /* mandatory */
        var _cleanDefinition = function(){}
        var _create = function(appName,definition){
            appName = (typeof appName=="string") ? appName :"none";
        
            var appClass = function(){
                e.extend(true,this,definition);//properties and fonctions goes to object params
                this._init();
                if(typeof this.onStart=="function"){
                    this.onStart();
                }
            };
    
            appClass.prototype = new AbstractApplication();
            d[appName] = appClass ;
        
            var k=(function(m){
                m = m;
                return function(){
                    _start(m)
                }
            })(appName);
            return{
                start:k
            }
        };

        var _start = function(i){
            i = i || false;
            if(typeof d[i]!=="function"){
                throw new Error("An appname must be provided");
            }
            d[i]=new d[i]();
            var activity  = d[i].getParam("mainActivity");
            if(!activity){
                throw new Error("Activity can't be null")
            }
            /* Lancer L'activityManager pour l'application ? 
         * Activity Manager will create a context
         * where an app is bound to a context
         * 
         * chaque application a sa propre activity manager
         * ou un activity manager to rule them all?
         * 
         * */
            var activityManager = ActivityManager.init({
                appname: i,
                viewManager: d[i].viewManager 
            });
            d[i].setActivityManager(ActivityManager);
            
            var currentRoute = window.location.hash;
            /* Init Router and handle all the app routes */
            this.router = NavigationManager.init({
                activitiesManager: ActivityManager,
                viewManager: d[i].viewManager,
                appName: i,
                defaultOrErrorRoute: d[i].getParam("route")
            });
            d[i].viewManager.render(d[i].getParam("mainViewContainer")); 
            if(!currentRoute){
                this.router.navigateTo(d[i].getParam("route"));
            }
            NavigationManager.start();        
        };
    
        var g= {
            create: _create,
            start: _start
        };

        return g;
    })(jQuery,window);
    Kimo.ApplicationManager = ApplicationManager;
    return ApplicationManager;
});