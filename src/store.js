import {createStore, combineReducers} from 'redux';
import _ from 'lodash';
// import { reducers } from './reducers/index';
//declare const window: any;

import {code, reducers as baseReducers} from './pw/collections/base';

function createModelReducer(code) {

}
const collReducers = _.mapValues(baseReducers, (funcs, type) => {
  const acc = {};
  Object.keys(funcs).forEach((funName) => {
    acc[`${code}:${type}:${funName}`] = (state, params) => {
      return {
        ...state,
        [type]: funcs[funName](state[type], params)
      };
    };
  });
  return acc;
});

console.log(collReducers);

const allReducers = {
  collection: (state = {data: {}, meta: {}}, action) => {
    if (collReducers[action.type]) {
      return collReducers[action.type](state, action.payload);
    }
    return state;
  }
};

const reducers = combineReducers(allReducers);

const recoverState = () => ({});

export const store = createStore(
  reducers,
  recoverState(),
  window.devToolsExtension && window.devToolsExtension()
);

