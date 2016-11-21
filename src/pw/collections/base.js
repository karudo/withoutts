export const code = 'collection';

export type data = {
  code: string;
  name: string;
};

export type dataUpdate = {
  code?: string;
  name?: number;
};

export type meta = {
  loading: boolean
};

export type metaUpdate = {
  loading?: boolean
};

export type dataActions = {
  set: (update: dataUpdate) => void
}

export type metaActions = {
  set: (update: metaUpdate) => void
}

export type collection = {
  data: data,
  meta: meta,
  actions: dataActions,
  metaActions: metaActions
}

export const dataReducers = {
  set(data: data, update: dataUpdate): data {
    return Object.assign({}, data, update);
  },
};

export const metaReducers = {
  set(meta: meta, update: metaUpdate): meta {
    return Object.assign({}, meta, update);
  },
};

export const reducers = {
  data: dataReducers,
  meta: metaReducers,
};
