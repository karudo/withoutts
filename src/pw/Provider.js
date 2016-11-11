import {Component, PropTypes, Children} from 'react';

import storeShape from './storeShape';

class Provider extends Component<{store: any, storeKey?: string}, null> {
  static defaultProps = {
    storeKey: 'store',
  };

  static propTypes = {
    store: storeShape.isRequired,
    storeKey: PropTypes.string,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = {
    store: storeShape.isRequired,
  };

  static displayName = 'Provider';

  componentWillReceiveProps: any;

  getChildContext() {
    return {
      [this.props.storeKey]: this.props.store,
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line
  Provider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps: any) {
    if (this.store !== nextProps.store) {
      console.log('warn');
    }
  };
}

export default Provider;
