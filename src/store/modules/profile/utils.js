export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const newObj = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    newObj[key] = deepCopy(obj[key]);
  }

  return newObj;
}

export function processString(str) {
  // 使用正则表达式检查字符串是否以 geosite- 或 geoip- 开头
  const regex = /^(geosite-|geoip-)/;
  let result = str.replace(regex, '');
  // 去掉开头的 geosite- 或 geoip-
  // 将字符串首字母大写
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result.replace('ai', 'AI');
}
