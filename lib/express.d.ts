/// <reference types="node" />
import { Request, Response, RequestHandler } from 'express';
import { IncomingMessage } from 'http';
import { Connection, CookieOptions, Middleware, Status } from '.';
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
    setCookie<T>(name: string, value: string, options: CookieOptions): Connection<T>;
    clearCookie<T>(name: string, options: CookieOptions): Connection<T>;
    setHeader<T>(name: string, value: string): Connection<T>;
    setStatus<T>(status: Status): Connection<T>;
    setBody<T>(body: unknown): Connection<T>;
    endResponse<T>(): Connection<T>;
}
export declare function fromMiddleware<I, O, L>(middleware: Middleware<I, O, L, void>): RequestHandler;
export declare function toMiddleware<I, A>(requestHandler: RequestHandler, f: (req: Request) => A): Middleware<I, I, never, A>;
