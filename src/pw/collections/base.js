export const code = 'collection';

export type dataActions = {
  set: (update: {code?: string, name?: string}) => void
}

export type metaAction = {
  set: (update: {code?: string, name?: string}) => void
}

export const dataReducers = {
  set(data, update) {
    return {
      ...data,
      ...update
    }
  },
};

export const metaReducers = {
  set(meta, update) {
    return {
      ...meta,
      ...update
    }
  }
};
