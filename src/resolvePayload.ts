import { isArray, isObject, isTineVar } from './helpers';
import { TineCtx, TinePayload, TineVar } from './types';

export const resolveTineVar = (ctx: TineCtx, tineVar: TineVar<any>) =>
  tineVar.__value(ctx);

export const resolvePayload = async <T>(
  ctx: Map<string, unknown>,
  payload: TinePayload<T>,
): Promise<T> => {
  if (isTineVar(payload)) {
    return await resolveTineVar(ctx, payload);
  }

  if (isArray(payload)) {
    const result = payload;

    for (const key in payload) {
      const value = await resolvePayload(ctx, payload[key]);

      payload[key] = value;
    }

    return result;
  }

  if (isObject(payload)) {
    const result = payload;

    for (const key of Object.keys(payload)) {
      const value = await resolvePayload(ctx, payload[key]);

      result[key] = value;
    }

    return result;
  }

  return payload;
};
