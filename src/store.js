import {createStore, combineReducers} from 'redux';
import _ from 'lodash';
// import { reducers } from './reducers/index';
//declare const window: any;

import {code, reducers as baseReducers} from './pw/collections/base';

const cReducers = _.mapValues(baseReducers, (funcs, type) => {
  return Object.keys(funcs).reduce((acc, funName) => {
    acc[`${code}:${type}:${funName}`] = (state, params) => {
      return {
        ...state,
        [type]: funcs[funName](state[type], params)
      };
    };
    return acc;
  }, {})
});
let collReducers = {
  ...cReducers.data,
  ...cReducers.meta,
};

console.log(collReducers);

const uuuReducers = {
  collection: (state = {data: {}, meta: {}}, action) => {
    if (collReducers[action.type]) {
      return collReducers[action.type](state, action.payload);
    }
    return state;
  }
};

const reducers = combineReducers(uuuReducers);

const recoverState = () => ({});

export const store = createStore(
  reducers,
  recoverState(),
  window.devToolsExtension && window.devToolsExtension()
);

