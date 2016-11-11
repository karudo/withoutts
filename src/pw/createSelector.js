function createCollectionConnector(sliceName: string, convertData) {
  return function createSelector(getState, dispatch): ISelector {

    const actions = {
      setData(x) {
        dispatch(x);
      }
    };
    let state: any = getState()[sliceName];
    let data: any;
    let meta: any;
    return {
      run(state: any, props: any) {

      }
    };
  };
}

export function connCollection(convertData) {
  return createCollectionConnector('collection', convertData);
}
