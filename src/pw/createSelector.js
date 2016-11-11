type TSelectResult = {
  result: any,
  loading: boolean,
  error?: string
};

function createCollectionConnector(sliceName: string, convertData) {
  return function createSelector(dispatch) {

    const actions = {
      setData(x) {
        dispatch(x);
      }
    };
    let state;
    let data;
    let meta;
    return {
      run(fullState, props): TSelectResult {
        const nextState = fullState[sliceName];
        if (nextState !== state) {
          state = nextState;
        }

      }
    };
  };
}

export function connCollection(convertData) {
  return createCollectionConnector('collection', convertData);
}
