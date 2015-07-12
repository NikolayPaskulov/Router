'use strict';

var Router = (function () {
    function Router() {
        this.routes = [];
        this.init();
    }

    Router.prototype.init = function () {
        var self = this;
        if ("onhashchange" in window) {
            window.onhashchange = function () {
                var hasURL = window.location.hash.split('#')[1];
                self.applyRoute(hasURL);
            }
        } else {
            //IE .. SHIT.. TODO
        }
    }

    Router.prototype.registerRoute = function (route, callback, paramObject) {
        var scope = (paramObject && paramObject.scope) ? paramObject.scope : {};
        return this.routes[this.routes.length] = new Route({
            route: route,
            callback: callback,
            scope: scope,
            auth: paramObject.auth
        });
    }

    Router.prototype.applyRoute = function (route) {
        if (!route || route.trim() == '') {
            this.redirectToDefaultURL();
            return;
        }
        for (var i = 0, len = this.routes.length; i < len; i++) {
            var currentRoute = this.routes[i],
                compare = currentRoute.compare(route);

            if (compare) {
                if (currentRoute.auth && !currentRoute.auth()) {
                    this.redirectToDefaultURL();
                    return;
                }
                currentRoute.callback.call(currentRoute.scope, compare);
                return;
            }
        }
        this.redirectToDefaultURL();
    }

    Router.prototype.when = function (route, config) {
        if (!route || route == '') throw new Error('No Route given!');
        if (!config || Object.prototype.toString.call(config).slice(8, -1) != 'Object') throw new Error('Config is not optional and it has to be Object!');

        this.registerRoute(route, config.callback, config);

        return this;
    }

    Router.prototype.otherwise = function (config) {
        if (Object.prototype.toString.call(config).slice(8, -1) != 'Object') throw new Error('Config is not optional and it has to be Object!');
        this.defaultRoute = config.redirectTo;
    }


    Router.prototype.changeLocationHash = function (route) {
        window.location.hash = '#' + route;
    }

    Router.prototype.redirectToDefaultURL = function() {
        if(this.defaultRoute) this.changeLocationHash(this.defaultRoute);
        else this.changeLocationHash('');
    }

    return Router
})();