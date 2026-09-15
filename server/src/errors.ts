export class HttpError extends Error {
  statusCode: number;
  extra: Record<string, unknown>;
  needPaywall?: boolean;

  constructor(statusCode: number, message: string, extra: Record<string, unknown> = {}) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.extra = extra;
    if (extra.needPaywall) this.needPaywall = true;
  }
}

export const unauthorized = (msg = 'unauthorized') => new HttpError(401, msg);
export const forbidden = (msg: string, extra?: Record<string, unknown>) => new HttpError(403, msg, extra);
export const notFound = (msg = 'not found') => new HttpError(404, msg);
export const badRequest = (msg: string) => new HttpError(400, msg);
