import _ from 'lodash';

import {reducers as baseReducers} from './collections/base';

type TSelectResult = {
  data: any,
  meta: {loading?: boolean},
  error?: string
};

export function createSelector(connectors, dispatch) {
  const selectors = _.mapValues(connectors, (createSelector) => createSelector(dispatch));
  return function selector(state, props) {
    return _.mapValues(selectors, (conn) => conn.run(state, props));
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

function mapDispatchToActons(prefix, reducers, name, dispatch) {
  const actionNames = Object.keys(reducers[name]);
  return _.zipObject(actionNames, actionNames.map(actionName => {
    return (params) => dispatch({type: `${prefix}:${name}:${actionName}`, payload: params});
  }))
}

function createActions(prefix, reducers, dispatch) {
  return {
    actions: mapDispatchToActons(prefix, reducers, 'data', dispatch),
    metaActions: mapDispatchToActons(prefix, reducers, 'meta', dispatch)
  };
}

function createSelectorCreator(code, actionCreators, pickData) {
  return function createSelector(dispatch) {
    return new Selector(pickData, createActions(code, actionCreators, dispatch));
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
