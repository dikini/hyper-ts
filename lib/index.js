"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var function_1 = require("fp-ts/lib/function");
var TaskEither_1 = require("fp-ts/lib/TaskEither");
// Adapted from https://github.com/purescript-contrib/purescript-media-types
var MediaType;
(function (MediaType) {
    MediaType["applicationFormURLEncoded"] = "application/x-www-form-urlencoded";
    MediaType["applicationJSON"] = "application/json";
    MediaType["applicationJavascript"] = "application/javascript";
    MediaType["applicationOctetStream"] = "application/octet-stream";
    MediaType["applicationXML"] = "application/xml";
    MediaType["imageGIF"] = "image/gif";
    MediaType["imageJPEG"] = "image/jpeg";
    MediaType["imagePNG"] = "image/png";
    MediaType["multipartFormData"] = "multipart/form-data";
    MediaType["textCSV"] = "text/csv";
    MediaType["textHTML"] = "text/html";
    MediaType["textPlain"] = "text/plain";
    MediaType["textXML"] = "text/xml";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
var OK = 200;
var Created = 201;
var Found = 302;
var BadRequest = 400;
var Unauthorized = 401;
var Forbidden = 403;
var NotFound = 404;
var MethodNotAllowed = 405;
var NotAcceptable = 406;
var ServerError = 500;
exports.Status = {
    OK: OK,
    Created: Created,
    Found: Found,
    BadRequest: BadRequest,
    Unauthorized: Unauthorized,
    Forbidden: Forbidden,
    NotFound: NotFound,
    MethodNotAllowed: MethodNotAllowed,
    NotAcceptable: NotAcceptable,
    ServerError: ServerError
};
function gets(f) {
    return new Middleware(function (c) { return TaskEither_1.taskEither.of(function_1.tuple(f(c), c)); });
}
exports.gets = gets;
function fromConnection(f) {
    return new Middleware(function (c) { return TaskEither_1.fromEither(f(c).map(function (a) { return function_1.tuple(a, c); })); });
}
exports.fromConnection = fromConnection;
function modifyConnection(f) {
    return new Middleware(function (c) { return TaskEither_1.taskEither.of(function_1.tuple(undefined, f(c))); });
}
exports.modifyConnection = modifyConnection;
/**
 * A middleware is an indexed monadic action transforming one `Conn` to another `Conn`. It operates
 * in the `TaskEither` monad, and is indexed by `I` and `O`, the input and output `Conn` types of the
 * middleware action.
 */
var Middleware = /** @class */ (function () {
    function Middleware(run) {
        this.run = run;
    }
    Middleware.prototype.eval = function (c) {
        return this.run(c).map(function (_a) {
            var a = _a[0];
            return a;
        });
    };
    Middleware.prototype.exec = function (c) {
        return this.run(c).map(function (_a) {
            var c = _a[1];
            return c;
        });
    };
    Middleware.prototype.map = function (f) {
        var _this = this;
        return new Middleware(function (ci) { return _this.run(ci).map(function (_a) {
            var a = _a[0], co = _a[1];
            return function_1.tuple(f(a), co);
        }); });
    };
    Middleware.prototype.ap = function (fab) {
        var _this = this;
        return new Middleware(function (c) { return fab.run(c).chain(function (_a) {
            var f = _a[0], co1 = _a[1];
            return _this.run(co1).map(function (_a) {
                var a = _a[0], co2 = _a[1];
                return function_1.tuple(f(a), co2);
            });
        }); });
    };
    Middleware.prototype.chain = function (f) {
        return this.ichain(f);
    };
    /**
     * Combine two effectful actions, keeping only the result of the first
     */
    Middleware.prototype.chainFirst = function (fb) {
        return this.chain(function (a) { return fb.map(function () { return a; }); });
    };
    /**
     * Combine two effectful actions, keeping only the result of the second
     */
    Middleware.prototype.chainSecond = function (fb) {
        return this.chain(function () { return fb; });
    };
    Middleware.prototype.ichain = function (f) {
        var _this = this;
        return new Middleware(function (ci) { return _this.run(ci).chain(function (_a) {
            var a = _a[0], co = _a[1];
            return f(a).run(co);
        }); });
    };
    Middleware.prototype.foldMiddleware = function (onLeft, onRight) {
        var _this = this;
        return new Middleware(function (c) { return _this.run(c).foldTaskEither(function (l) { return onLeft(l).run(c); }, function (_a) {
            var a = _a[0], co = _a[1];
            return onRight(a).run(co);
        }); });
    };
    Middleware.prototype.mapLeft = function (f) {
        var _this = this;
        return new Middleware(function (c) { return _this.run(c).mapLeft(f); });
    };
    Middleware.prototype.bimap = function (f, g) {
        var _this = this;
        return new Middleware(function (c) { return _this.run(c).bimap(f, function (_a) {
            var a = _a[0], c = _a[1];
            return function_1.tuple(g(a), c);
        }); });
    };
    Middleware.prototype.orElse = function (f) {
        var _this = this;
        return new Middleware(function (c) { return _this.run(c).orElse(function (l) { return f(l).run(c); }); });
    };
    Middleware.prototype.alt = function (fy) {
        var _this = this;
        return new Middleware(function (c) { return _this.run(c).alt(fy.run(c)); });
    };
    /** Returns a middleware that writes the response status */
    Middleware.prototype.status = function (s) {
        return this.ichain(function () { return status(s); });
    };
    /** Returns a middleware that writes the given headers */
    Middleware.prototype.header = function (name, value) {
        return this.ichain(function () { return header(name, value); });
    };
    /** Returns a middleware that sets the given `mediaType` */
    Middleware.prototype.contentType = function (mediaType) {
        return this.ichain(function () { return contentType(mediaType); });
    };
    /** Return a middleware that sets the cookie `name` to `value`, with the given `options` */
    Middleware.prototype.cookie = function (name, value, options) {
        return this.ichain(function () { return cookie(name, value, options); });
    };
    /** Returns a middleware that clears the cookie `name` */
    Middleware.prototype.clearCookie = function (name, options) {
        return this.ichain(function () { return clearCookie(name, options); });
    };
    /** Return a middleware that changes the connection status to `BodyOpen` */
    Middleware.prototype.closeHeaders = function () {
        return this.ichain(function () { return exports.closeHeaders; });
    };
    /** Return a middleware that sends `body` as response body */
    Middleware.prototype.send = function (body) {
        return this.ichain(function () { return send(body); });
    };
    /** Return a middleware that sends `body` as JSON */
    Middleware.prototype.json = function (body) {
        return this.ichain(function () { return json(body); });
    };
    /** Return a middleware that ends the response without sending any response body */
    Middleware.prototype.end = function () {
        return this.ichain(function () { return exports.end; });
    };
    return Middleware;
}());
exports.Middleware = Middleware;
function of(a) {
    return iof(a);
}
exports.of = of;
function iof(a) {
    return new Middleware(function (c) { return TaskEither_1.taskEither.of(function_1.tuple(a, c)); });
}
exports.iof = iof;
//
// lifting helpers
//
function tryCatch(f, onrejected) {
    return fromTaskEither(TaskEither_1.tryCatch(f, onrejected));
}
exports.tryCatch = tryCatch;
function fromTaskEither(fa) {
    return new Middleware(function (c) { return fa.map(function (a) { return function_1.tuple(a, c); }); });
}
exports.fromTaskEither = fromTaskEither;
function right(fa) {
    return fromTaskEither(TaskEither_1.right(fa));
}
exports.right = right;
function left(fl) {
    return fromTaskEither(TaskEither_1.left(fl));
}
exports.left = left;
function fromLeft(l) {
    return fromTaskEither(TaskEither_1.fromLeft(l));
}
exports.fromLeft = fromLeft;
exports.fromEither = function (fa) {
    return fromTaskEither(TaskEither_1.fromEither(fa));
};
exports.fromIO = function (fa) {
    return fromTaskEither(TaskEither_1.fromIO(fa));
};
exports.fromIOEither = function (fa) {
    return fromTaskEither(TaskEither_1.fromIOEither(fa));
};
function fromPredicate(predicate, onFalse) {
    var f = TaskEither_1.fromPredicate(predicate, onFalse);
    return function (a) { return fromTaskEither(f(a)); };
}
exports.fromPredicate = fromPredicate;
//
// primitive middlewares
//
/** Returns a middleware that writes the response status */
function status(status) {
    return modifyConnection(function (c) { return c.setStatus(status); });
}
exports.status = status;
/** Returns a middleware that writes the given header */
function header(name, value) {
    return modifyConnection(function (c) { return c.setHeader(name, value); });
}
exports.header = header;
/** Returns a middleware that sets the given `mediaType` */
function contentType(mediaType) {
    return header('Content-Type', mediaType);
}
exports.contentType = contentType;
/** Return a middleware that sets the cookie `name` to `value`, with the given `options` */
function cookie(name, value, options) {
    return modifyConnection(function (c) { return c.setCookie(name, value, options); });
}
exports.cookie = cookie;
/** Returns a middleware that clears the cookie `name` */
function clearCookie(name, options) {
    return modifyConnection(function (c) { return c.clearCookie(name, options); });
}
exports.clearCookie = clearCookie;
/** Return a middleware that changes the connection status to `BodyOpen` */
exports.closeHeaders = iof(undefined);
/** Return a middleware that sends `body` as response body */
function send(body) {
    return modifyConnection(function (c) { return c.setBody(body); });
}
exports.send = send;
/** Return a middleware that ends the response without sending any response body */
exports.end = modifyConnection(function (c) { return c.endResponse(); });
/** Return a middleware that sends `body` as JSON */
function json(body) {
    return contentType(MediaType.applicationJSON)
        .closeHeaders()
        .send(JSON.stringify(body));
}
exports.json = json;
/** Return a middleware that sends a redirect to `uri` */
function redirect(uri) {
    return status(exports.Status.Found).header('Location', uri);
}
exports.redirect = redirect;
//
// decoders
//
var isUnknownRecord = function (u) { return u !== null && typeof u === 'object'; };
/** Returns a middleware that tries to decode `connection.getParams()[name]` */
function decodeParam(name, f) {
    return fromConnection(function (c) {
        var params = c.getParams();
        return f(isUnknownRecord(params) ? params[name] : undefined);
    });
}
exports.decodeParam = decodeParam;
/** Returns a middleware that tries to decode `connection.getParams()` */
function decodeParams(f) {
    return fromConnection(function (c) { return f(c.getParams()); });
}
exports.decodeParams = decodeParams;
/** Returns a middleware that tries to decode `connection.getQuery()` */
function decodeQuery(f) {
    return fromConnection(function (c) { return f(c.getQuery()); });
}
exports.decodeQuery = decodeQuery;
/** Returns a middleware that tries to decode `connection.getBody()` */
function decodeBody(f) {
    return fromConnection(function (c) { return f(c.getBody()); });
}
exports.decodeBody = decodeBody;
/** Returns a middleware that tries to decode `connection.getMethod()` */
function decodeMethod(f) {
    return fromConnection(function (c) { return f(c.getMethod()); });
}
exports.decodeMethod = decodeMethod;
/** Returns a middleware that tries to decode `connection.getHeader(name)` */
function decodeHeader(name, f) {
    return fromConnection(function (c) { return f(c.getHeader(name)); });
}
exports.decodeHeader = decodeHeader;
//# sourceMappingURL=index.js.map