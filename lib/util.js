/* For arbitrary functions used across the project */

function is_callable (f)
{
  return (typeof f === 'function') &&
                (f !== null);
}


function is_defined (v)
{
  return (typeof v !== 'undefined');
}


function is_empty (o)
{
  // null and undefined are empty
  if (o === null)
  {
    return true;
  }

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (o.length && o.length > 0)
  {
    return false;
  }

  if (o.length === 0)
  {
    return true;
  }

  for (var key in o)
  {
    if (hasOwnProperty.call(o, key))
    {
      return false;
    }
  }

  // Doesn't handle toString and toValue enumeration bugs in IE < 9

  return true;
}


function quotify (s)
{
  return "\"" + s + "\"";
}


function stringigize_function_call (f_name, args)
{
  var arg_str = "";

  // for no arguments this loop would be skipped
  for (var key in args)
  {
    arg_str  += (quotify (args[key].toString ()) + ",");
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
module.exports.is_empty        = is_empty;
