const Step = require('../../actions').Step;
const data = require('../../../db');

const exec = async (req, action) => {
  const step = new Step('checkIfWaitingAuth');
  try {
    const existingAction = await data.getPush(action.id);
    if (existingAction) {
      action = existingAction;
      if (existingAction.authorised) {
        action = existingAction;
        action.setAllowPush();
      }
    }
  } catch (e) {
    console.log(e || e.stackTrace);
    step.setError(e.toString('utf-8'));
    throw e;
  } finally {
    action.addStep(step);
    return action;
  }
};

exec.displayName = 'checkIfWaitingAuth.exec';
exports.exec = exec;
