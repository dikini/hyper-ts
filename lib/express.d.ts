/// <reference types="node" />
import { Request, RequestHandler, Response } from 'express';
import { IncomingMessage } from 'http';
import { Connection, CookieOptions, HeadersOpen, Middleware, ResponseEnded, Status } from '.';
export declare type Action = {
    type: 'setBody';
    body: unknown;
} | {
    type: 'endResponse';
} | {
    type: 'setStatus';
    status: Status;
} | {
    type: 'setHeader';
    name: string;
    value: string;
} | {
    type: 'clearCookie';
    name: string;
    options: CookieOptions;
} | {
    type: 'setCookie';
    name: string;
    value: string;
    options: CookieOptions;
};
export declare class ExpressConnection<S> implements Connection<S> {
    readonly req: Request;
    readonly res: Response;
    readonly actions: Array<Action>;
    readonly _S: S;
    constructor(req: Request, res: Response, actions?: Array<Action>);
    chain<T>(action: Action): ExpressConnection<T>;
    getRequest(): IncomingMessage;
    getBody(): unknown;
    getHeader(name: string): unknown;
    getParams(): unknown;
    getQuery(): unknown;
    getOriginalUrl(): string;
    getMethod(): string;
    setCookie(name: string, value: string, options: CookieOptions): ExpressConnection<HeadersOpen>;
    clearCookie(name: string, options: CookieOptions): ExpressConnection<HeadersOpen>;
    setHeader(name: string, value: string): ExpressConnection<HeadersOpen>;
    setStatus(status: Status): ExpressConnection<HeadersOpen>;
    setBody(body: unknown): ExpressConnection<ResponseEnded>;
    endResponse(): ExpressConnection<ResponseEnded>;
}
export declare function fromMiddleware<I, O, L>(middleware: Middleware<I, O, L, void>): RequestHandler;
export declare function toMiddleware<I, A>(requestHandler: RequestHandler, f: (req: Request) => A): Middleware<I, I, never, A>;
