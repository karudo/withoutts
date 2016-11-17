export const code = 'collection';

export type actions = {
  set: (a: {code: string}) => void
}

export const actions: actions = {
  set(a): actions {
    return a;
  }
}
