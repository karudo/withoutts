import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import {store} from './store';
import Provider from './pw/Provider';


class Index extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App/>
      </Provider>
    );
  }
}


ReactDOM.render(
  <Index />,
  document.getElementById('root')
);
