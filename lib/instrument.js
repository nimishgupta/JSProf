



function touch ()
{
}


function __$__monitor_entry__$__ (/* TODO */)
{
}

function __$__monitor_exit__$__ (/* TODO */)
{
}


function decorate ()
{
}


/* Function that parses code and add instrumenting instructions */
function instrument (code)
{
  var options = { loc: true, range: true };
  var ast = esprima.parse (code, options);

  // TODO : Handle errors
}
