// @flow

import * as React from 'react';
import SLDSProgressIndicator from '@salesforce/design-system-react/components/progress-indicator';
import { t } from 'i18next';

import { CONSTANTS } from 'store/plans/reducer';
import { getSteps } from 'components/plans/progressIndicator';
import type { Job as JobType } from 'store/jobs/reducer';

const ProgressIndicator = ({ job }: { job: JobType }) => {
  const steps = getSteps(t);
  const completedSteps =
    job.status === CONSTANTS.STATUS.COMPLETE
      ? steps.slice()
      : steps.slice(0, 2);
  const errorSteps =
    job.status === CONSTANTS.STATUS.FAILED ||
    job.status === CONSTANTS.STATUS.CANCELED
      ? steps.slice(2)
      : [];
  return (
    <SLDSProgressIndicator
      className="slds-m-top_medium"
      steps={steps}
      completedSteps={completedSteps}
      selectedStep={steps[2]}
      errorSteps={errorSteps}
    />
  );
};

export default ProgressIndicator;
