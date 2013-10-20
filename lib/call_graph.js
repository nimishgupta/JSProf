
function CallInfo ()
{
  // Need indexing on this one
  this.call_graph = {};
  this.root_key   = "";
}


function get_key (f)
{
  return (f.name + ":" + f.index + ":" + f.file);
}


function FunctionInfo (name, line, index, file, own_key)
{
  this.name             = name;
  this.line             = line;
  this.index            = index;
  this.file             = file;
  this.own_key          = own_key; 
  this.ntotal_calls     = 0;
  this.nself_rec_calls  = 0;
  this.total_time_ms    = 0; // Total time spent in this function (including children)
  this.self_time_ms     = 0; // Total time exluding children
//  this.self_rec_time_ms = 0;
  this.does_recur       = false;

  // List of functions that call the this function, hash table indexed by function keys
  this.parents  = {};

  // List of functions this this function calls
  this.children = {};

  /* can also be calculated at run time by presentation layer */
  this.total_time_pc    = 0;
  this.self_time_pc     = 0;
//  this.self_rec_time_pc = 0;

  /* Can also be calculated at run time */
//  this.avg_time_call          = 0;
//  this.avg_self_time_call     = 0;
//  this.avg_self_rec_time_call = 0;

  this.is_hotpath = false;

}




CallInfo.prototype.has_function_entry = function (f_key)
{
  return this.call_graph.hasOwnProperty (f_key);
};


CallInfo.prototype.add_function_entry = function (f_key, f_info)
{
  this.call_graph[f_key] = new FunctionInfo (f_info.name,
                                             f_info.line,
                                             f_info.index,
                                             f_info.file,
                                             f_key);
  return this.call_graph[f_key];
};


 
CallInfo.prototype.add_call = function (call)
{
  var caller = call.caller;
  var callee = call.callee;
  var time   = call.time;
  var ncalls = call.ncalls;

  var caller_key = get_key (caller);
  var callee_key = get_key (callee);

  if (!this.has_function_entry (caller_key))
  {
    this.add_function_entry (caller_key, caller);
  }

  if (!this.has_function_entry (callee_key))
  {
    this.add_function_entry (callee_key, callee);
  }

  // recycle javascript objects
  caller = this.call_graph[caller_key];
  callee = this.call_graph[callee_key];

  if (caller_key === callee_key)
  {
    // We have self recursion at our hand

    // Doesn't matter whether callee or caller, both are same ;)
    var f = caller; 

    /**
     * set recursion flag as true
     * Increment total number of calls
     * Increment self run number of calls
     * Increment total time ms
     * Increment self time ms
     */

     f.does_recur       = true;
     f.ntotal_calls    += ncalls;
     f.nself_rec_calls += ncalls;
     f.total_time_ms   += time;
     f.self_time_ms    += time;

     // Don't add entry as children or caller as cycle could make its way in graph
  }
  else
  {
    // normal call (could be mutual recursion but its unlikely)

    /**
     * Increment number of calls in callee
     * Increment time and self time in callee
     * Decrement self time in caller
     * Add parent in callee
     * Add chilren in caller
     */

     callee.ntotal_calls  += ncalls;
     callee.total_time_ms += time;
     callee.self_time_ms  += time;
     // store the time and ncalls for hot path identification
     callee.parents[caller_key] = { ncalls : ncalls, time : time };

     caller.total_time_ms += time;
     // store the time and ncalls for hot path identification
     caller.children[callee_key] = { ncalls : ncalls, time : time };
  }
  
  return true;
};



CallInfo.prototype.set_root = function (root)
{
  this.root_key = get_key (root);
};


function construct ()
{
  return new CallInfo ();
}



function update_hotpath_info (root, callgraph)
{
  root.is_hotpath = true;

  if (!root.children)
  {
    return;
  }

  var max = -1;
  var max_key = "";

  for (var key in root.children)
  {
    if (root.children.hasOwnProperty (key))
    {
      if ((call_graph[key].total_time_ms > max) ||
          ((call_graph[key].total_time_ms === max) &&
           (call_graph[max_key].ntotal_calls > call_graph[key].ntotal_calls)))

      {
        max = call_graph[key].total_time_ms;
        max_key = key;
      }
    }
  }

  update_hotpath_info (callgraph[max_key], callgraph);
}



function pc_calc (node, call_graph, tot_time)
{
  node.total_time_pc = (node.total_time_ms/tot_time) * 100;
  node.self_time_pc  = (node.self_time_ms/tot_time) * 100;

  for(var key in node.children)
  {
    if (node.children.hasOwnProperty (key))
    {
      pc_calc (callgraph[key], call_graph, tot_time);
    }
  }
}


// TODO : Provide a sort function



module.exports.CallInfo            = construct;
module.exports.update_hotpath_info = update_hotpath_info;
modules.exports.pc_calc            = pc_calc;
