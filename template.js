define([], function () {
    /*read config from Kimo.Config App instance config*/
    return {
        load: function (actionName, req, onload, config) {
                var infos = ['inferno'],
                    fullPath = 'text!'+config.baseUrl + 'apps/' + infos[0].toLowerCase() +'/templates/'+ actionName+'.html';
            req([fullPath], function (template) {
                onload(template);
            }, function (reason) {
                onload({error: true});
            });
        }
    }
    
    
    
    
});