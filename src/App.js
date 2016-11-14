import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Test from './test';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to New PW Panel</h2>
        </div>
        <Test awe={777}/>
      </div>
    );
  }
}

export default App;
