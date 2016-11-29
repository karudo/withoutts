function immSetArr(curObj, pathArr, value) {
  const [index] = pathArr;
  const newValue = pathArr.length > 1
    ? immSetArr(curObj[index], pathArr.slice(1), value)
    : value;
  let retObj;
  if (Array.isArray(curObj)) {
    retObj = curObj.slice();
    retObj[index] = newValue;
  }
  else {
    retObj = {
      ...curObj,
      [index]: newValue
    };
  }
  return retObj;
}

export function immSet(obj, path, value) {
  return immSetArr(obj, path.split('.'), value);
}
