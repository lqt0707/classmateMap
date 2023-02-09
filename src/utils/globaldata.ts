const globalData = {};

export function set(key: any, val: any) {
  globalData[key] = val;
}

export function get(key: any) {
  return globalData[key];
}
