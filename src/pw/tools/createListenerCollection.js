export default function createListenerCollection() {
  let current = [];
  let next = [];
  let cleared = false;

  return {
    clear() {
      next = [];
      current = [];
      cleared = true;
    },

    notify() {
      const listeners = current = next;
      for (let i = 0; i < listeners.length; i++) {
        listeners[i]();
      }
    },

    subscribe(listener) {
      let isSubscribed = true;
      if (next === current) {
        next = current.slice();
      }
      if (!cleared) {
        next.push(listener);
      }

      return function unsubscribe() {
        if (!isSubscribed || cleared) {
          return;
        }
        isSubscribed = false;

        if (next === current) {
          next = current.slice();
        }
        next.splice(next.indexOf(listener), 1);
      };
    }
  };
}
