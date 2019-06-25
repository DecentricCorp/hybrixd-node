/**
   * Return or set the type of the data stream
   * @category Array/String
   * @param {String} [type]  - Type to convert data to
   * @example
   * type             // input: 'hello', returns: 'string'
   * type 'string'    // makes the data type string
   */
exports.type = data => function (p, type) {
  let nextData;
  if (typeof type === 'undefined') {
    nextData = typeof data;
  } else {
    if (type === 'string') {
      nextData = String(data);
    } else if (type === 'number') {
      nextData = Number(data);
    } else if (type === 'array') {
      if (data instanceof Array) {
        nextData = data;
      } else {
        nextData = [];
      }
    } else if (type === 'object') {
      if (typeof data === 'object' && data !== null) {
        nextData = data;
      } else {
        nextData = {};
      }
    }
  }
  this.next(p, 0, nextData);
};