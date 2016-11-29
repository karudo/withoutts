// code from react-redux v5.0.0-beta.3
// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

import createListenerCollection from './tools/createListenerCollection';

import {Store} from 'redux';

type AnyStore = Store<any>;

type VoidFunction = () => void;

type ListenerCollection = {
  clear: VoidFunction;
  notify: VoidFunction;
  subscribe: (listener: VoidFunction) => VoidFunction
}

class Subscription {
  subscribe: ((arg: VoidFunction) => VoidFunction);
  unsubscribe: VoidFunction | undefined;
  onStateChange: VoidFunction;
  listeners: ListenerCollection;

  constructor(store: AnyStore, parentSub?: Subscription) {
    this.subscribe = parentSub
      ? parentSub.addNestedSub.bind(parentSub)
      : store.subscribe.bind(store);
    this.unsubscribe = undefined;
    this.listeners = createListenerCollection();
  }

  setOnStateChange(fun: VoidFunction) {
    this.onStateChange = fun;
  }

  addNestedSub(listener: VoidFunction) {
    this.trySubscribe();
    return this.listeners.subscribe(listener);
  }

  notifyNestedSubs() {
    this.listeners.notify();
  }

  isSubscribed() {
    return Boolean(this.unsubscribe);
  }

  trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.subscribe(this.onStateChange);
    }
  }

  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.listeners.clear();
    }
    this.unsubscribe = undefined;
    this.subscribe = undefined;
  }
}

export default Subscription;
