import {createStore, combineReducers} from 'redux';
import _ from 'lodash';
// import { reducers } from './reducers/index';
//declare const window: any;

import {code, reducers} from './pw/collections/base';

function flatReducers(code, reducers) {
  const collReducers = {};
  Object.keys(reducers).forEach(type => {
    const funcs = reducers[type];
    Object.keys(funcs).forEach(funName => {
      collReducers[`${code}:${type}:${funName}`] = (state, params) => {
        return {
          ...state,
          [type]: funcs[funName](state[type], params)
        };
      };
    });
  });
  return collReducers;
}


function createCollectionReducer(code, reducers) {
  const collReducers = flatReducers(code, reducers);
  return {
    [code]: (state = {data: {}, meta: {}}, action) => {
      if (collReducers[action.type]) {
        return collReducers[action.type](state, action.payload);
      }
      return state;
    }
  };
}

const allReducers = createCollectionReducer(code, reducers);

const combinedReducers = combineReducers(allReducers);

const recoverState = () => ({});

export const store = createStore(
  combinedReducers,
  recoverState(),
  window.devToolsExtension && window.devToolsExtension()
);

