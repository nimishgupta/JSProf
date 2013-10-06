/* Provides an interface to get information from an edge,

   The result of profiling consist of a annotated list edge,
   comprising of the following information
   
   Name of callee
   Line number of callee
   Name of caller
   Line number of caller
   #calls
   time (in ms)
   
*/


/* declare a function that takes, JSON, init, exit, visitor methods */

function Edge (edge)
{
  this.edge = edge;
}

Edge.prototype.callee_name = function ()
{
  // TODO 
};

Edge.prototype.callee_loc = function ()
{
  // TODO 
};


Edge.prototype.caller_name = function ()
{
  // TODO 
};

Edge.prototype.caller_loc = function ()
{
  // TODO 
};

Edge.prototype.num_calls = function ()
{
  // TODO 
};

Edge.prototype.exec_time = function ()
{
  // TODO 
};



/* Can throw an exception */
function ProfileData (profiler_json)
{
  this.edges = [];

  for (var edge in JSON.parse (profiler_json))
  {
    edges.push (new Edge (edge));
  }
}


/* 
   init    : Function that is called before before starting a visit,
             should return boolean, true to continue, false to stop

   visitor : Function that is called for visiting every edge,
             should return boolean, true to continue, false to stop

   over    : Function that is called when every visit is over,
             should return boolean, true to continue, false to stop
*/
   
ProfileData.prototype.process = function (init, visit, over)
{
  var res = false;

  if (typeof init === 'function')
  {
    res = init (/* TODO : Does it need any data */);
  }

  for (var edge in this.edges)
  {
    if (res && typeof visit === 'function')
    {
      res = visit (edge);
    }
  }

  if (res && typeof over === 'function')
  {
    res = over (/* TODO : See if any more data is required */);
  }

  return res;
};
