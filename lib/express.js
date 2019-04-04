"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Task_1 = require("fp-ts/lib/Task");
var TaskEither_1 = require("fp-ts/lib/TaskEither");
var _1 = require(".");
var endResponse = { type: 'endResponse' };
var empty = [];
var ExpressConnection = /** @class */ (function () {
    function ExpressConnection(req, res, actions, ended) {
        if (actions === void 0) { actions = empty; }
        if (ended === void 0) { ended = false; }
        this.req = req;
        this.res = res;
        this.actions = actions;
        this.ended = ended;
    }
    ExpressConnection.prototype.chain = function (action, ended) {
        if (ended === void 0) { ended = false; }
        return new ExpressConnection(this.req, this.res, this.actions.concat([action]), ended);
    };
    ExpressConnection.prototype.getRequest = function () {
        return this.req;
    };
    ExpressConnection.prototype.getBody = function () {
        return this.req.body;
    };
    ExpressConnection.prototype.getHeader = function (name) {
        return this.req.header(name);
    };
    ExpressConnection.prototype.getParams = function () {
        return this.req.params;
    };
    ExpressConnection.prototype.getQuery = function () {
        return this.req.query;
    };
    ExpressConnection.prototype.getOriginalUrl = function () {
        return this.req.originalUrl;
    };
    ExpressConnection.prototype.getMethod = function () {
        return this.req.method;
    };
    ExpressConnection.prototype.setCookie = function (name, value, options) {
        return this.chain({ type: 'setCookie', name: name, value: value, options: options });
    };
    ExpressConnection.prototype.clearCookie = function (name, options) {
        return this.chain({ type: 'clearCookie', name: name, options: options });
    };
    ExpressConnection.prototype.setHeader = function (name, value) {
        return this.chain({ type: 'setHeader', name: name, value: value });
    };
    ExpressConnection.prototype.setStatus = function (status) {
        return this.chain({ type: 'setStatus', status: status });
    };
    ExpressConnection.prototype.setBody = function (body) {
        return this.chain({ type: 'setBody', body: body }, true);
    };
    ExpressConnection.prototype.endResponse = function () {
        return this.chain(endResponse, true);
    };
    return ExpressConnection;
}());
exports.ExpressConnection = ExpressConnection;
var run = function (res, action) {
    switch (action.type) {
        case 'clearCookie':
            return res.clearCookie(action.name, action.options);
        case 'endResponse':
            res.end();
            return res;
        case 'setBody':
            return res.send(action.body);
        case 'setCookie':
            return res.clearCookie(action.name, action.options);
        case 'setHeader':
            res.setHeader(action.name, action.value);
            return res;
        case 'setStatus':
            return res.status(action.status);
    }
};
var exec = function (middleware, req, res, next) {
    return middleware
        .exec(new ExpressConnection(req, res))
        .run()
        .then(function (e) {
        return e.fold(next, function (c) {
            var _a = c, actions = _a.actions, res = _a.res, ended = _a.ended;
            for (var i = 0; i < actions.length; i++) {
                run(res, actions[i]);
            }
            if (!ended) {
                next();
            }
        });
    });
};
function toRequestHandler(middleware) {
    return function (req, res, next) { return exec(middleware, req, res, next); };
}
exports.toRequestHandler = toRequestHandler;
function toErrorRequestHandler(f) {
    return function (err, req, res, next) { return exec(f(err), req, res, next); };
}
exports.toErrorRequestHandler = toErrorRequestHandler;
function fromRequestHandler(requestHandler, f) {
    return new _1.Middleware(function (c) {
        return TaskEither_1.right(new Task_1.Task(function () {
            return new Promise(function (resolve) {
                var _a = c, req = _a.req, res = _a.res;
                requestHandler(req, res, function () { return resolve([f(req), c]); });
            });
        }));
    });
}
exports.fromRequestHandler = fromRequestHandler;
//# sourceMappingURL=express.js.map