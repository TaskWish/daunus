import { runAction } from "../../run_action";
import { $action } from "../../daunus_action";
import {
  type DaunusActionWithOptions,
  type DaunusWorkflowAction
} from "../../types";

const loop = $action(
  { type: "loop", skipParse: true },
  ({ ctx }) =>
    async <T>({
      list,
      action,
      itemName = "item"
    }: {
      list: Array<any>;
      /**
       * Action
       * @ref https://taskwish.vercel.app/schema/action.json
       */
      action: DaunusWorkflowAction<T> | DaunusActionWithOptions<T, unknown, {}>;
      itemName?: string;
    }) => {
      const res = list.map(async (value, index) => {
        ctx.set(itemName, { value, index });

        const res =
          "run" in action
            ? await action.run(ctx)
            : await runAction(ctx, action);

        if (res.exception) {
          return res.exception;
        }

        return res.data;
      });

      return (await Promise.all(res)) as Array<T>;
    }
);

export default loop;
