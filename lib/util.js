/* For arbitrary functions used across the project */

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
  for (var key in args)
  {
    arg_str  += (args[key].toString () + ",");
  }

  if (arg_str.length)
  {
    // trim last extra ","
    arg_str = arg_str.slice (0, arg_str.length - 1);
  }


  return (f_name + "(" + arg_str + ")");
}



module.exports.is_callable     = is_callable;
module.exports.is_defined      = is_defined;
module.exports.fcall_to_string = stringigize_function_call;
