define([], function () {

    var normalizeName = function (name) {
        var pos = name.search('Activity'),
            activityName = name.substring(0, pos);
            return activityName.toLowerCase()+"."+"activity";
    };

    return {
        load: function (managerName, req, onload, config) {
            var infos = managerName.split(":"),
                managerName = infos[1].toLowerCase()+".manager.js";
                fullPath = config.baseUrl + 'apps/' + infos[0].toLowerCase() +'/managers/'+ managerName;
            req([fullPath], function (manager) {
                console.log(manager);
                onload(manager);
            }, function (reason) {
                onload.error(reason);
            });
        }
    };


});