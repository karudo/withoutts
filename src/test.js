import React, { Component } from 'react';

import {connect} from './pw/connect'
import {connCollection} from './pw/createSelector';

class Test extends Component {
  render() {
    return (
      <div className="App">
        Rabotae0?
      </div>
    );
  }
}

export default connect({
  coll: connCollection()
})(Test);
