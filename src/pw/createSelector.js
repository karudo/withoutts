import _ from 'lodash';

import {reducers as baseReducers} from './collections/base';

type TSelectResult = {
  data: any,
  meta: {loading?: boolean},
  error?: string
};

export function createSelector(connectors, dispatch) {
  const selectors = _.mapValues(connectors, (createSelector) => createSelector(dispatch));
  const selects = {};
  const result = {};
  return function selector(state, props) {
    const nextSelects = _.mapValues(selectors, (conn) => conn.run(state, props));
    //if (!_.isEqual(nextSelects, selects)) {
    //
    //}
    console.log(nextSelects);
    return nextSelects;
  }
}

class Selector {
  constructor(pickData, actions) {
    this.pickData = pickData;
    this.actions = actions;
    this.result = {...actions};
  }

  run(fullState, props): TSelectResult {
    const nextState = this.pickData(fullState, props);
    if (nextState !== this.state) {
      this.state = nextState;
      this.result = {
        ...this.actions,
        ...this.state
      };
    }

    return this.result;
  }
}

function mapArrayToObj(arr, cb) {
  return arr.reduce((acc, key) => {
    acc[key] = cb(key);
    return acc;
  }, {});
}

function createActions(prefix, reducers, dispatch) {
  return {
    actions: mapArrayToObj(Object.keys(reducers.data), (actionName) => (
      (params) => dispatch({type: `${prefix}:data:${actionName}`, payload: params})
    )),
    metaActions: mapArrayToObj(Object.keys(reducers.meta), (actionName) => (
      (params) => dispatch({type: `${prefix}:meta:${actionName}`, payload: params})
    ))
  };
}

function createSelectorCreator(code, actionCreators, pickData) {
  return function createSelector(dispatch) {
    const actions = createActions(code, actionCreators, dispatch);
    return new Selector(pickData, actions);
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

function createConnectorForCollection(code, reducers, convertData) {
  return createSelectorCreator(code, reducers, createPickCollection(code, convertData));

}

export function connCollection(convertData = (x) => x) {
  return createConnectorForCollection('collection', baseReducers, convertData)
}
