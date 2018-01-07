const format = (tmpl: string, key: string, value: string): string => {
  if (key.indexOf('{') >= 0 || key.indexOf('}') >= 0) {
    throw new Error('invalid key');
  }
  if (value.indexOf('{') >= 0 || value.indexOf('}') >= 0) {
    throw new Error('invalid value');
  }
  return tmpl.split('{' + key + '}').join(value);
};

export { format };
