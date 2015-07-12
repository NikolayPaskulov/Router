'use strict';
var Route = (function () {
    function Route(configurationObj) {
        this.route = configurationObj.route;
        this.callback = configurationObj.callback;
        this.scope = configurationObj.scope;
        this.auth = configurationObj.auth;
        this.init();
    }

    Route.prototype.init = function () {
        var routeParts = this.route.split('/').filter(Boolean);
        this.routeKeys = [];
        for (var i = 0, len = routeParts.length; i < len; i++) {
            var isStatic = (routeParts[i].slice(0, 1) == '{' && routeParts[i].slice(-1) == '}') ? false : true;
            var route = (isStatic) ? routeParts[i] : routeParts[i].slice(1, -1);
            var key = {
                isStatic: isStatic,
                route: route
            };
            var index = route.indexOf(':');
            if (!isStatic && index >= 0) {
                key.route = route.slice(0, index);
                var options = route.slice(index).split(':').filter(Boolean);
                for (var a = 0; a < options.length; a++) {
                    if (options[a] == 'number') {
                        key.allowNumbersOnly = true;
                    } else if (options[a].indexOf('pattern') >= 0) {
                        var lbIndex = options[a].indexOf('('),
                            rbIndex = options[a].indexOf(')');
                        if (lbIndex > 0 && rbIndex > 0) {
                            var pattern = options[a].slice(lbIndex + 1, rbIndex);
                            if (pattern != '') {
                                key.pattern = new RegExp(pattern, 'g');
                            }
                        }
                    }
                }
            }
            this.routeKeys.push(key)
        }
    }

    Route.prototype.compare = function (route) {
        var partsAndFilters = route.split('?').filter(Boolean);
        var routeParts = partsAndFilters[0].split('/').filter(Boolean);
        var filters = (partsAndFilters[1]) ? partsAndFilters[1].split('&').filter(Boolean) : '';
        var routeFilters = {};
        var keys = {};

        if (this.routeKeys.length !== routeParts.length) return false;

        for (var i = 0, len = this.routeKeys.length; i < len; i++) {
            if (this.routeKeys[i].isStatic && this.routeKeys[i].route !== routeParts[i]) return false;
            if (!this.routeKeys[i].isStatic) {
                if (this.routeKeys[i].allowNumbersOnly && isNaN(routeParts[i])) return false;
                if (this.routeKeys[i].pattern && !routeParts[i].match(this.routeKeys[i].pattern)) return false;
                keys[this.routeKeys[i].route] = routeParts[i];
            }
        }

        if (filters) {
            for (var a = 0, len = filters.length; a < len; a++) {
                var currentKeyValue = filters[a].split('=').filter(Boolean);
                routeFilters[currentKeyValue[0]] = currentKeyValue[1];
            }
        }

        return {
            keys: keys,
            filters : routeFilters
        }
    }

    return Route
})();