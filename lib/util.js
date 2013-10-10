/* For arbitrary functions used across the project */


(function (exports) {


  function is_callable (f)
  {
    return (typeof f === 'function') &&
                  (f !== null)
  }


  function is_defined (v)
  {
    return (v !== 'undefined');
  }


  exports.is_callable = is_callable;
  exports.is_defined  = is_defined;
  

}) (typeof exports === 'undefined' ? this['util'] = {} : exports);
