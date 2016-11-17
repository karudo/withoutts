import {bindActionCreators} from 'redux';
import _ from 'lodash';

import {dataReducers, metaReducers} from './collections/base';

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
    this.result = {actions};
  }

  run(fullState, props): TSelectResult {
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

function createActions(actionCreators, dispatch) {
  return _.mapValues(actionCreators, actions => bindActionCreators(actions, dispatch));
}

function createCollectionConnector(actionCreators, pickData) {
  return function createSelector(dispatch) {
    const actions = createActions(actionCreators, dispatch);
    return new Selector(pickData, actions);
  };
}

export function connCollection(convertData = (x) => x) {
  let slice = {};
  let converted = {};
  return createCollectionConnector({push: (q) => ({type: 'push', payload: q}) }, function (fullState, props) {
    const nextSlice = fullState['collection'];
    if (nextSlice !== slice) {
      slice = nextSlice;
      converted = {
        ...slice,
        data: slice.data && convertData(slice.data, props)
      };
    }
    return converted;
  });
}
