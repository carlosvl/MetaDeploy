// @flow

import * as React from 'react';
import DocumentTitle from 'react-document-title';
import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { t } from 'i18next';

import routes from 'utils/routes';
import { CONSTANTS } from 'store/plans/reducer';
import { fetchPreflight, startPreflight } from 'store/plans/actions';
import { fetchVersion } from 'store/products/actions';
import { selectOrg } from 'store/org/selectors';
import { selectPlan, selectPreflight } from 'store/plans/selectors';
import {
  selectProduct,
  selectVersion,
  selectVersionLabel,
} from 'store/products/selectors';
import { selectUserState } from 'store/user/selectors';
import { getLoadingOrNotFound, shouldFetchVersion } from 'components/utils';
import { startJob } from 'store/jobs/actions';
import BackLink from 'components/backLink';
import BodyContainer from 'components/bodyContainer';
import CtaButton, { LoginBtn } from 'components/plans/ctaButton';
import Header from 'components/plans/header';
import Intro from 'components/plans/intro';
import JobResults, {
  ErrorIcon,
  WarningIcon,
} from 'components/plans/jobResults';
import PlanNotAllowed from 'components/products/notAllowed';
import ProductNotFound from 'components/products/product404';
import StepsTable from 'components/plans/stepsTable';
import Toasts from 'components/plans/toasts';
import UserInfo from 'components/plans/userInfo';
import type { AppState } from 'store';
import type { InitialProps } from 'components/utils';
import type { Org as OrgType } from 'store/org/reducer';
import type {
  Plan as PlanType,
  Preflight as PreflightType,
} from 'store/plans/reducer';
import type {
  Product as ProductType,
  Version as VersionType,
} from 'store/products/reducer';
import type { User as UserType } from 'store/user/reducer';

export type SelectedSteps = Set<string>;
type Props = {
  ...InitialProps,
  user: UserType,
  product: ProductType | null,
  version: VersionType | null,
  versionLabel: ?string,
  plan: PlanType | null,
  preflight: ?PreflightType,
  org: OrgType,
  doFetchVersion: typeof fetchVersion,
  doFetchPreflight: typeof fetchPreflight,
  doStartPreflight: typeof startPreflight,
  doStartJob: typeof startJob,
};
type State = {
  changedSteps: Map<string, boolean>,
};

const { RESULT_STATUS } = CONSTANTS;

class PlanDetail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { changedSteps: new Map() };
  }

  fetchVersionIfMissing() {
    const { product, version, versionLabel, doFetchVersion } = this.props;
    if (
      product &&
      versionLabel &&
      shouldFetchVersion({ product, version, versionLabel })
    ) {
      // Fetch version from API
      doFetchVersion({ product: product.id, label: versionLabel });
    }
  }

  fetchPreflightIfMissing() {
    const { user, plan, preflight, doFetchPreflight } = this.props;
    if (user && plan && preflight === undefined) {
      // Fetch most recent preflight result (if any exists)
      doFetchPreflight(plan.id);
    }
  }

  componentDidMount() {
    this.fetchVersionIfMissing();
    this.fetchPreflightIfMissing();
  }

  componentDidUpdate(prevProps) {
    const {
      product,
      version,
      versionLabel,
      user,
      plan,
      preflight,
    } = this.props;
    const versionChanged =
      product !== prevProps.product ||
      version !== prevProps.version ||
      versionLabel !== prevProps.versionLabel;
    const userChanged = user !== prevProps.user;
    const planChanged = plan !== prevProps.plan;
    const preflightChanged = preflight !== prevProps.preflight;
    if (versionChanged) {
      this.fetchVersionIfMissing();
    }
    if (userChanged || planChanged || preflightChanged) {
      this.fetchPreflightIfMissing();
    }
  }

  handleStepsChange = (stepId: string, checked: boolean) => {
    const changedSteps = new Map(this.state.changedSteps);
    changedSteps.set(stepId, checked);
    this.setState({ changedSteps });
  };

  getSelectedSteps(): SelectedSteps {
    const { plan, preflight } = this.props;
    const selectedSteps = new Set();
    /* istanbul ignore if */
    if (!plan || !plan.steps) {
      return selectedSteps;
    }
    const { changedSteps } = this.state;
    for (const step of plan.steps) {
      const { id } = step;
      const result = preflight && preflight.results && preflight.results[id];
      let skipped, optional;
      if (result) {
        skipped = result.find(res => res.status === RESULT_STATUS.SKIP);
        optional = result.find(res => res.status === RESULT_STATUS.OPTIONAL);
      }
      if (!skipped) {
        const required = step.is_required && !optional;
        const recommended = !required && step.is_recommended;
        const manuallyChecked = changedSteps.get(id) === true;
        const manuallyUnchecked = changedSteps.get(id) === false;
        if (
          required ||
          manuallyChecked ||
          (recommended && !manuallyUnchecked)
        ) {
          selectedSteps.add(id);
        }
      }
    }
    return selectedSteps;
  }

  getPostMessage(): React.Node {
    const { user, product, version, plan, org } = this.props;
    /* istanbul ignore if */
    if (!product || !version || !plan) {
      return null;
    }
    if (user && !user.org_type) {
      return (
        <>
          <div className="slds-p-bottom_xx-small">
            <ErrorIcon />
            <span className="slds-text-color_error">
              {t(
                'Oops! It looks like you don’t have permissions to run an installation on this org.',
              )}
            </span>
          </div>
          <p>
            {t(
              'Please contact an Admin within your org or use the button below to log in with a different org.',
            )}
          </p>
        </>
      );
    }
    if (org) {
      if (org.current_job) {
        const { product_slug, version_label, plan_slug, id } = org.current_job;
        return (
          <p>
            <WarningIcon />
            <span>
              <Trans i18nKey="installationCurrentlyRunning">
                An installation is currently running on this org.{' '}
                <Link
                  to={routes.job_detail(
                    product_slug,
                    version_label,
                    plan_slug,
                    id,
                  )}
                >
                  View the running installation
                </Link>{' '}
                to cancel it.
              </Trans>
            </span>
          </p>
        );
      }
      if (org.current_preflight) {
        return (
          <p>
            <WarningIcon />
            <span>
              {t('A pre-install validation is currently running on this org.')}
            </span>
          </p>
        );
      }
    }
    return null;
  }

  getCTA(selectedSteps: SelectedSteps): React.Node {
    const {
      history,
      user,
      product,
      version,
      plan,
      preflight,
      org,
      doStartPreflight,
      doStartJob,
    } = this.props;
    /* istanbul ignore if */
    if (!product || !version || !plan) {
      return null;
    }
    if (user && !user.org_type) {
      return (
        <LoginBtn
          id="org-not-allowed-login"
          label={t('Log in with a different org')}
        />
      );
    } else if (plan.steps && plan.steps.length) {
      return (
        <CtaButton
          history={history}
          user={user}
          productSlug={product.slug}
          clickThroughAgreement={product.click_through_agreement}
          versionLabel={version.label}
          plan={plan}
          preflight={preflight}
          selectedSteps={selectedSteps}
          preventAction={Boolean(
            org && (org.current_job || org.current_preflight),
          )}
          doStartPreflight={doStartPreflight}
          doStartJob={doStartJob}
        />
      );
    }
    return null;
  }

  render(): React.Node {
    const {
      user,
      product,
      version,
      versionLabel,
      plan,
      preflight,
    } = this.props;
    const loadingOrNotFound = getLoadingOrNotFound({
      product,
      version,
      versionLabel,
      plan,
    });
    if (loadingOrNotFound !== false) {
      return loadingOrNotFound;
    }
    // this redundant check is required to satisfy Flow:
    // https://flow.org/en/docs/lang/refinements/#toc-refinement-invalidations
    /* istanbul ignore if */
    if (!product || !version || !plan) {
      return <ProductNotFound />;
    }
    const selectedSteps = this.getSelectedSteps();
    const preflight_minutes = window.GLOBALS.PREFLIGHT_LIFETIME_MINUTES || 10;
    return (
      <DocumentTitle
        title={`${plan.title} | ${product.title} | ${window.SITE_NAME}`}
      >
        <>
          <Header
            product={product}
            version={version}
            plan={plan}
            userLoggedIn={Boolean(user && user.valid_token_for)}
            preflightStatus={preflight && preflight.status}
            preflightIsValid={Boolean(preflight && preflight.is_valid)}
            preflightIsReady={Boolean(preflight && preflight.is_ready)}
          />
          {product.is_allowed && plan.is_allowed ? (
            <BodyContainer>
              {preflight && user ? (
                <Toasts
                  preflight={preflight}
                  label={t('Pre-install validation')}
                />
              ) : null}
              <Intro
                preMessage={
                  plan.preflight_message ? (
                    // These messages are pre-cleaned by the API
                    <div
                      className="markdown"
                      dangerouslySetInnerHTML={{
                        __html: plan.preflight_message,
                      }}
                    />
                  ) : null
                }
                results={
                  preflight && user ? (
                    <JobResults
                      preflight={preflight}
                      label={t('Pre-install validation')}
                      failMessage={t(
                        'After resolving all errors, run the pre-install validation again.',
                      )}
                      successMessage={
                        <Trans
                          i18nKey="preflightValidTime"
                          count={preflight_minutes}
                        >
                          Pre-install validation will expire if install is not
                          run within {{ preflight_minutes }} minutes, and you
                          will need to run pre-install validation again.
                        </Trans>
                      }
                    />
                  ) : null
                }
                postMessage={this.getPostMessage()}
                cta={this.getCTA(selectedSteps)}
                backLink={
                  <BackLink
                    label={t('Select a different plan')}
                    url={routes.version_detail(product.slug, version.label)}
                    className="slds-p-top_small"
                  />
                }
              />
              <UserInfo user={user} />
              {plan.steps && plan.steps.length ? (
                <StepsTable
                  user={user}
                  plan={plan}
                  preflight={preflight}
                  selectedSteps={selectedSteps}
                  handleStepsChange={this.handleStepsChange}
                />
              ) : null}
            </BodyContainer>
          ) : (
            <PlanNotAllowed
              isLoggedIn={user !== null}
              message={plan.not_allowed_instructions}
              link={
                <Trans i18nKey="planNotAllowed">
                  Try{' '}
                  <Link to={routes.version_detail(product.slug, version.label)}>
                    another plan
                  </Link>{' '}
                  from that product version
                </Trans>
              }
            />
          )}
        </>
      </DocumentTitle>
    );
  }
}

const select = (appState: AppState, props: InitialProps) => ({
  user: selectUserState(appState),
  product: selectProduct(appState, props),
  version: selectVersion(appState, props),
  versionLabel: selectVersionLabel(appState, props),
  plan: selectPlan(appState, props),
  preflight: selectPreflight(appState, props),
  org: selectOrg(appState),
});

const actions = {
  doFetchVersion: fetchVersion,
  doFetchPreflight: fetchPreflight,
  doStartPreflight: startPreflight,
  doStartJob: startJob,
};

const WrappedPlanDetail: React.ComponentType<InitialProps> = connect(
  select,
  actions,
)(PlanDetail);

export default WrappedPlanDetail;
