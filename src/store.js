import {createStore, combineReducers} from 'redux';
// import { reducers } from './reducers/index';
//declare const window: any;

const uuuReducers = {
  collection: (state = {data: [], meta: {}}, action) => {
    console.log(state, action);
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

