export interface XGeneric<X = any> {
    [key: string]: X;
}

export type XEvent =
    | 'charge.success'
    | 'transfer.success'
    | 'transfer.failed'
    | 'subscription.create';

export type XCommand =
    | 'subaccount'
    | 'page'
    | 'transfer'
    | 'paymentrequest'
    | 'transferrecipient'
    | 'subscription'
    | 'bulkcharge'
    | 'bank'
    | 'charge'
    | 'transaction'
    | 'plan'
    | 'customer'
    | 'refund'
    | 'integration'
    | 'balance'
    | 'settlement'
    | 'decision'
    | 'invoice'
    | 'verifications'

export interface XParam {
    arg?: boolean
    parameter: string
    required: boolean
    type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object',
    description?: string,
    data?: any
    default?: any
    options?: string[]
    paramType?: 'body' | 'query' | 'header' | 'path'
}

export interface XSchema {
    api: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    description?: string | null;
    parameters?: XGeneric;
    body?: XGeneric;
    params: XParam[]
}

export interface XAPI {
    [key: string]: XSchema[];
}

export interface XArg {
    options: XGeneric;
    flags: string[];
}

export interface XSection {
    api: string;
}