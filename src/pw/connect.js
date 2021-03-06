import * as React from 'react';
const {Component, PropTypes} = React;
import _ from 'lodash';

import storeShape from './storeShape';

// import * as renders from './connectRenders';

import Subscription from './Subscription';

import {createSelector} from './createSelector';

let hotReloadingVersion = 0;

export function connect<TOwnProps>(connectors: TConnectorsObject, settings: TConnectSettings = {}) {
  const {
    storeKey = 'store',
    shouldHandleStateChanges = true,
  } = settings;

  const subscriptionKey = `${storeKey}Subscription`;
  const version = hotReloadingVersion++;

  // tslint:disable-next-line:only-arrow-functions
  return function wrapWithConnect(WrappedComponent: any) {
    class Connect extends Component<TOwnProps, TConnectState> {
      static contextTypes: any;
      static childContextTypes: any;

      selector: TypeSelector<TOwnProps>;
      version: number;
      // private renderCount: number = 0;
      store: TPWStore;

      subscription: Subscription;
      parentSub: Subscription;

      context: {
        [index: string]: any
      };

      constructor(props: TOwnProps, context: {}) {
        super(props, context);
        this.version = version;
        this.store = this.context[storeKey];
        this.parentSub = this.context[subscriptionKey];

        this.state = {};
        this.initSelector();
        this.initSubscription();
      }

      getChildContext() {
        return {
          [subscriptionKey]: this.subscription,
        };
      }

      componentDidMount() {
        if (!shouldHandleStateChanges) {
          return;
        }
        this.subscription.trySubscribe();
        this.runSelector(this.props);
      }

      componentWillReceiveProps(nextProps: TOwnProps) {
        if (!_.isEqual(nextProps, this.props)) {
          this.runSelector(nextProps);
        }
      }

      shouldComponentUpdate(props, state) {
        return true;
      }

      componentWillUnmount() {
        if (this.subscription) {
          this.subscription.tryUnsubscribe();
        }
        this.subscription = undefined;
        this.store = undefined;
        this.parentSub = undefined;
        this.selector = () => ({});
      }

      initSelector() {
        // const {getState, dispatch} = this.store;
        // const sourceSelector = (state: TPWState, props: TOwnProps) => {
        //   return Object.keys(connectors).map(s => connectors[s].select(state, props));
        // };
        this.selector = createSelector(connectors, this.store.dispatch);
      }

      initSubscription() {
        if (shouldHandleStateChanges) {
          const subscription = this.subscription = new Subscription(this.store, this.parentSub);
          const notifyNestedSubs = subscription.notifyNestedSubs.bind(subscription);

          subscription.setOnStateChange(() => this.runSelector(this.props, notifyNestedSubs));
        }
      }

      runSelector(props, after) {
        const nextChildProps = this.selector(this.store.getState(), props);
        const nextState = {
          haveOwnPropsChanged: !_.isEqual(props, this.props)
        };
        if (!_.isEqual(nextChildProps, this.state.childProps)) {
          nextState.childProps = nextChildProps;
          _.forEach(nextChildProps, coll => {
            if (!coll.data) {
            }
          })
        }
        this.setState(nextState, after);
      }

      render() {
        return <WrappedComponent {...this.props} {...this.state.childProps}/>;
      }
    }

    Connect.contextTypes = {
      [storeKey]: storeShape.isRequired,
      [subscriptionKey]: PropTypes.instanceOf(Subscription),
    };
    Connect.childContextTypes = {
      [subscriptionKey]: PropTypes.instanceOf(Subscription).isRequired,
    };

    if (process.env.NODE_ENV !== 'production') {
      // tslint:disable-next-line
      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
        // We are hot reloading!
        if (this.version !== version) {
          this.version = version;
          this.initSelector();

          if (this.subscription) {
            this.subscription.tryUnsubscribe();
          }

          this.initSubscription();
          if (shouldHandleStateChanges) {
            this.subscription.trySubscribe();
          }
        }
      };
    }

    return Connect;
  };
}
