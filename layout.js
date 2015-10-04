define([], function () {
    /*read config from Kimo.Config App instance config*/
    var normalizeName = function (name) {
        var pathInfos = name.split('.'),
            pos = pathInfos[1].search('Activity'),
            activityName = pathInfos[1].substring(0, pos);
            return pathInfos[0].toLowerCase()+'/templates/layouts/'+activityName.toLowerCase()+".html";
    };
    return {

        load: function (layoutName, req, onload, config) {
                if (layoutName === 'no-layout') {
                    onload(null);
                    return;
                }
                var templatePath = normalizeName(layoutName),
                    fullPath = 'text!'+config.baseUrl + 'apps/' + templatePath;
            req([fullPath], function (template) {
                onload(template);
            }, function (reason) {
                onload.error(reason);
            });
        }
    };




});