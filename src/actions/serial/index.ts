import { runAction } from '../workflow';

import { tineAction } from '../../tineAction';
import { TineActionOptions, TineWorkflowAction } from '../../types';
import { BASE_ACTIONS } from '../workflow/workflow-functions';

const serial = tineAction(
  { type: 'serial', skipParse: true },
  async (list: TineWorkflowAction<any>[], { ctx }: TineActionOptions) => {
    let res = [];

    for (const action of list) {
      res.push(await runAction(ctx, action, { ...BASE_ACTIONS, serial }));
    }

    return res;
  },
);

export default serial;