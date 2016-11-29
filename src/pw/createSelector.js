import _ from 'lodash';

import {code as baseCode, reducers as baseReducers, actions as baseActions} from './collections/base';

type TSelectResult = {
  data: any,
  meta: {loading?: boolean},
  error?: string
};

export function createSelector(connectors, dispatch) {
  const selectors = _.mapValues(connectors, createSelector => createSelector(dispatch));
  return function selector(fullState, props) {
    return _.mapValues(selectors, conn => conn.select(fullState, props));
  }
}

class Selector {
  state: any;

  constructor(pickData, calls, actions) {
    this.pickData = pickData;
    this.calls = calls;
    this.actions = _.mapValues(actions, funcAction => (...args) => funcAction.apply(this, args));
    this.result = {actions: this.actions};
  }

  select(fullState, props): TSelectResult {
    const nextState = this.pickData(fullState, props);
    if (nextState !== this.state) {
      this.state = nextState;
      this.result = {
        actions: this.actions,
        ...this.state
      };
    }

    return this.result;
  }
}

function createCallsFromReducers(prefix, reducers, dispatch) {
  const callNames = Object.keys(reducers);
  return _.zipObject(callNames, callNames.map(actionName => {
    return params => dispatch({type: `${prefix}:${actionName}`, payload: params});
  }))
}

function createCalls(code, reducers, dispatch) {
  return _.mapValues(
    reducers,
    (subReducers, type) => createCallsFromReducers(`${code}:${type}`, subReducers, dispatch)
  );
}

function createSelectorCreator(code, reducers, actions, pickData) {
  return function createSelector(dispatch) {
    return new Selector(
      pickData,
      createCalls(code, reducers, dispatch),
      actions
    );
  };
}

function createPickCollection(code, convertData) {
  let slice = {};
  let converted = {};
  return function pickCollection(fullState, props) {
    const nextSlice = fullState[code];
    if (nextSlice !== slice) {
      slice = nextSlice;
      converted = {
        ...slice,
        data: slice.data && convertData(slice.data, props)
      };
    }
    return converted;
  };
}

function createConnectorForCollection(code, reducers, actions, convertData) {
  return createSelectorCreator(
    code,
    reducers,
    actions,
    createPickCollection(code, convertData)
  );
}

export function connCollection(convertData = x => x) {
  return createConnectorForCollection(baseCode, baseReducers, baseActions, convertData)
}
