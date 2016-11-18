import React, { Component } from 'react';

import {connect} from './pw/connect'
import {connCollection} from './pw/createSelector';

class Test extends Component {
  render() {
    console.log(this.props);
    return (
      <div className="App" onClick={() => this.props.hhh.actions.set({a: 1})}>
        Rabotae0?
      </div>
    );
  }
}

export default connect({
  hhh: connCollection()
})(Test);
