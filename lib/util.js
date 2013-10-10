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


  function stringigize_function_call (f_name, args)
  {
    var arg_str = "";

    // for no arguments this loop would be skipped
    for (var arg in args)
    {
      arg_str  += (arg.toString () + ",");
    }

    if (arg_str.Length)
    {
      // trim last extra ","
      arg_str = arg_str.slice (0, arg_str.Length - 2);
    }


    return (f_name + "(" + arg_str + ")");
  }



  exports.is_callable     = is_callable;
  exports.is_defined      = is_defined;
  exports.fcall_to_string = stringigize_function_call;
  

}) (typeof exports === 'undefined' ? this['util'] = {} : exports);
