import { $action } from "./daunus_action";
import { isDaunusRoute } from "./helpers";
import { DaunusRoute, RouterFactory, DaunusAction } from "./types";
import { z } from "./zod";

export const $router = <
  R extends Record<
    string,
    {
      route: DaunusRoute<any, any, any, any> | DaunusAction<any, any, any>;
      input: any;
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
  > = {},
  AI extends any | undefined = undefined,
  AR extends any | undefined = undefined
>(
  options: {
    name?: string;
    createInput?: (action: any, name: string) => any;
    parseInput?: (object: any) => any;
  } = {},
  input: Array<z.ZodAny> = [],
  defs?: R
): RouterFactory<R, AI, AR> => {
  const add = (
    name: string,
    route: DaunusRoute<any, any, any, any> | DaunusAction<any, any, any>
  ) => {
    if (isDaunusRoute(route)) {
      const newInput = options.createInput
        ? options.createInput(route, name)
        : route.meta.iSchema;

      return $router(options, [...input.filter(Boolean), newInput], {
        ...(defs || ({} as R)),
        [name]: { route, input: newInput }
      });
    }

    // Here, route is a DaunusAction
    const newInput = options.createInput
      ? options.createInput(route, name)
      : z.undefined();

    return $router(options, [...input.filter(Boolean), newInput], {
      ...(defs || ({} as R)),
      // eslint-disable-next-line object-shorthand
      [name]: { route: route, input: newInput }
    });
  };

  const get = <N extends keyof R>(name: N): R[N]["route"] => {
    return {
      ...defs![name]
    }.route;
  };

  const action = $action(
    { type: "router", ...options },
    ({ ctx }) =>
      async () => {
        const match = Object.entries(defs || {}).find(([_, item]) => {
          const { success } = item.input.safeParse(ctx.get("input"));

          return success;
        });

        if (match) {
          const inputData = options.parseInput
            ? options.parseInput(ctx.get("input"))
            : ctx.get("input");

          const res =
            "input" in match[1].route
              ? await match[1].route.input(inputData).run(ctx)
              : await match[1].route.run(ctx);

          return res.data ?? res.exception;
        }

        return undefined;
      }
  );

  const router = action(defs).createRoute(z.union([...(input as any)] as any));

  return {
    ...router,
    add,
    get,
    defs: defs as R
  } as any;
};
