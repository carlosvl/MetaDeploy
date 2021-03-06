import fetchMock from 'fetch-mock';

import { storeWithApi } from './../../utils';

import * as actions from 'store/org/actions';

describe('fetchOrgJobs', () => {
  describe('success', () => {
    test('GETs org from api', () => {
      const store = storeWithApi({});
      const response = {
        current_job: null,
        current_preflight: null,
      };
      fetchMock.getOnce(window.api_urls.org_list(), response);
      const started = {
        type: 'FETCH_ORG_JOBS_STARTED',
      };
      const succeeded = {
        type: 'FETCH_ORG_JOBS_SUCCEEDED',
        payload: response,
      };

      expect.assertions(1);
      return store.dispatch(actions.fetchOrgJobs()).then(() => {
        expect(store.getActions()).toEqual([started, succeeded]);
      });
    });
  });

  describe('error', () => {
    test('dispatches FETCH_ORG_JOBS_FAILED action', () => {
      const store = storeWithApi({});
      fetchMock.getOnce(window.api_urls.org_list(), 500);
      const started = {
        type: 'FETCH_ORG_JOBS_STARTED',
      };
      const failed = {
        type: 'FETCH_ORG_JOBS_FAILED',
      };

      expect.assertions(2);
      return store.dispatch(actions.fetchOrgJobs()).catch(() => {
        expect(store.getActions()).toEqual([started, failed]);
        expect(window.console.error).toHaveBeenCalled();
      });
    });
  });
});

describe('updateOrg', () => {
  test('returns ORG_CHANGED', () => {
    const expected = { type: 'ORG_CHANGED', payload: null };

    expect(actions.updateOrg(null)).toEqual(expected);
  });
});
