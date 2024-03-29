require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require ('./util.js');

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
     * Add children in caller
     */

     callee.ntotal_calls  += ncalls;
     callee.total_time_ms += time;
     callee.self_time_ms  += time;
     // store the time and ncalls for hot path identification
     callee.parents[caller_key] = { ncalls : ncalls, time : time };

     caller.self_time_ms -= time;
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

  if (util.is_empty (root.children))
  {
    return;
  }

  var max = -1;
  var max_key = "";

  for (var key in root.children)
  {
    if (root.children.hasOwnProperty (key))
    {
      if ((callgraph[key].total_time_ms > max) ||
          ((callgraph[key].total_time_ms === max) &&
           (callgraph[max_key].ntotal_calls > callgraph[key].ntotal_calls)))

      {
        max = callgraph[key].total_time_ms;
        max_key = key;
      }
    }
  }

  update_hotpath_info (callgraph[max_key], callgraph);
}



function pc_calc (node, call_graph, tot_time)
{
  if (tot_time === 0)
  {
    return;
  }

  node.total_time_pc = (node.total_time_ms/tot_time) * 100;
  node.self_time_pc  = (node.self_time_ms/tot_time) * 100;

  for(var key in node.children)
  {
    if (node.children.hasOwnProperty (key))
    {
      pc_calc (call_graph[key], call_graph, tot_time);
    }
  }
}


// TODO : Provide a sort function



module.exports.CallInfo            = construct;
module.exports.update_hotpath_info = update_hotpath_info;
module.exports.pc_calc            = pc_calc;

},{"./util.js":5}],"IfnAxQ":[function(require,module,exports){
var run = require ('./run.js');
var call_info = require ('./call_graph.js');

/**
 * We need one global view and one per callstack view of functions
 */


function GlobalCallInfo ()
{
  this.top_down_view  = call_info.CallInfo ();


  this.process_call_stack = function (call_list_obj)
  {
    var clo = call_list_obj;

    for (var key in clo)
    {
      if (clo.hasOwnProperty (key))
      {
        this.top_down_view.add_call (clo[key]);
      }
    }
  };
}



var global_call_info = new GlobalCallInfo ();


function process_performance_data (pd_arr)
{
  /**
   * pd_arr = [call_stck1, call_stck2 ... ]
   * where call_stck is :
   *    {
   *      key1 : edge_info
   *      key2 : edge_info
   *      .
   *      .
   *      .
   *      keyn : edge_info
   *    }
   */

   for (var i = 0; i < pd_arr.length; ++i)
   {
     global_call_info.process_call_stack (pd_arr[i]);
   }

   var td_view = global_call_info.top_down_view;

   td_view.set_root (run.root_context);

   // Since there is no one calling root, the time is inverted
   // TODO : Move it to call graph
   td_view.call_graph[td_view.root_key].total_time_ms = Math.abs (td_view.call_graph[td_view.root_key].self_time_ms);
   td_view.call_graph[td_view.root_key].self_time_ms = 0;


   call_info.update_hotpath_info (td_view.call_graph[td_view.root_key],
                                  td_view.call_graph);

   call_info.pc_calc (td_view.call_graph[td_view.root_key],
                      td_view.call_graph, 
                      td_view.call_graph[td_view.root_key].total_time_ms);
}


module.exports.process_performance_data = process_performance_data;
module.exports.top_down_view            = global_call_info.top_down_view;

},{"./call_graph.js":1,"./run.js":4}],"post_process":[function(require,module,exports){
module.exports=require('IfnAxQ');
},{}],4:[function(require,module,exports){
var util = require ('./util.js');

var GLOBAL_FUNCTION_STR = "__$__global__$__";
var ROOT_STR            = "__$__root__$__"; // JS Engine context

var root = {
             f_info : {
                        name  : ROOT_STR,
                        line  : '0',
                        index : '0',
                        file  : "jse"
                      }
           };

var call_stack = [root];

function get_key (caller, callee)
{
  return (caller.name + ":" + caller.index.toString () + ":" + caller.file + "&" +
          callee.name + ":" + callee.index.toString () + ":" + callee.file);
}


function is_same_function (f1, f2)
{
  return ((f1.name  === f2.name)  &&
          (f1.index === f2.index) &&
          (f1.file  === f2.file));
}


function is_call_self_recursive (caller, callee)
{
  // Both caller and callee needs to be same for recursive call
  return is_same_function (caller, callee);
}


function is_last_self_recursive_call (prev_frame, cur_frame)
{
  /**
   * caller from previous frame should be different from caller
   * from current frame for the current call to be the last of
   * recursive calls
   */

  return !(is_same_function (prev_frame.caller, cur_frame.caller));
}



function PerfData ()
{
  this.perf_data_raw = [];
  
  // Hash table for unique function calls. JS objects are hashes, makes our job easier
  // TODO : Can be easily converted to two level hash table
  this.perf_data = {};

  // this.timer_id  = null;

  var self = this;

  this.process_data_async = function ()
  {
    // Invalidate timer id so that any other call is not cancelled accidentally
    // self.timer_id = null;

    while (self.perf_data_raw.length)
    { 
      var frame   = self.perf_data_raw.pop ();
      var key = get_key (frame.caller, frame.callee);

      // Check if we already have the information for this call edge
      if (!self.perf_data.hasOwnProperty (key))
      {
        // Create new entry for this function call
        self.perf_data[key] = {
                                caller : frame.caller,
                                callee : frame.callee,
                                time   : 0,
                                ncalls : 0,
                              };
      }

      /**
       * If there is a self recursive call then the time measurements could easily get
       * corrupt if we add time for every call. Instead of taking cumulative times of
       * recursive calls we take only the time taken of last recursive call as it
       * comprises of all recursive calls.
       */
      if (is_call_self_recursive (frame.caller, frame.callee))
      {
        var prev_frame = self.perf_data_raw.pop ();
        if (util.is_defined (prev_frame) && 
            !is_last_self_recursive_call (prev_frame, frame))
        {
          // This is not the last self recursive call, ignore time
          frame.time = 0;
        }

        if (util.is_defined (prev_frame))
        {
          self.perf_data_raw.push (prev_frame);
        }
      }

      // TODO : Take into account mutual recursive calls

      self.perf_data[key].time   += frame.time;
      self.perf_data[key].ncalls += 1;
    }
  };


  this.process_data = function (caller, callee, time)
  {
    var o = { 
              caller : caller,
              callee : callee,
              time   : time,
            };

    // push raw data to be processed later
    self.perf_data_raw.push (o);

    /* Idea is to batch + delay our computation as long as there is some user code
     * available to execute. It helps with that it does not affect the execution time
     * of function and the monitoring calls add (hopefully) negligible overhead
     * Javascript single threaded model comes to our rescue :)
     */
    //clearTimeout (self.timer_id);
    // self.timer_id = setTimeout (self.process_data_async, 0);
  };
}


// THE global object
var pd_unit = new PerfData ();


var pd_objs = [];


function cur_time ()
{
  // TODO : Use higher resolution timer
  return Date.now (); 
}


function __$__m_entry__$__ (name, line, index, file)
{
  /** 
   * 1. Record start time
   * 2. put on global stack
   */

  var o = {
            f_info : {
                       name  : name,
                       line  : line,
                       index : index,
                       file  : file
                     },

            start : cur_time ()
          };

  call_stack.push (o);
}



function __$__m_exit__$__ ()
{
  /**
   * 1. Record end time
   * 2. pop from global stack
   * 3. Do sanity check
   * 4. touch
   */

  end = cur_time ();
  var o = call_stack.pop ();

  var callee = o.f_info;
  var start  = o.start;

  var time = end - start;

  // Determine caller
  var caller = call_stack[call_stack.length - 1].f_info;
  pd_unit.process_data (caller, callee, time);

  if (1 === call_stack.length)
  {
    // No function executing right now, a new call stack should start for next invocation
    pd_objs.push (pd_unit);

    /* Idea is to batch + delay our computation as long as there is some user code
     * available to execute. It helps with that it does not affect the execution time
     * of function and the monitoring calls add (hopefully) negligible overhead
     * Javascript single threaded model comes to our rescue :)
     */
    setTimeout (pd_unit.process_data_async, 0);

    pd_unit = new PerfData ();
  }
}



function serialize_perf_data (callback)
{
  // Make sure that all data has been processed

  /* TODO : Maynot work in a website kind of a scenario, where there is always some activity
   *        going on
   */
  while (1 !== call_stack.length)
  {
    setTimeout (serialize_perf_data, 0);
    return;
  }

  var pd_arr = [];

  // Collate all performance data in array and return JSON string
  for (var i = 0; i < pd_objs.length; ++i)
  {
    pd_arr.push (pd_objs[i].perf_data);
  }

  // return in form of string
  if (util.is_callable (callback))
  {
    callback (pd_arr);
  }
}


module.exports.MONITOR_ENTRY_FUNCTION = "run.__$__m_entry__$__";
module.exports.MONITOR_EXIT_FUNCTION  = "run.__$__m_exit__$__";
module.exports.GLOBAL_FUNCTION_STR    = GLOBAL_FUNCTION_STR;
module.exports.__$__m_entry__$__      = __$__m_entry__$__;
module.exports.__$__m_exit__$__       = __$__m_exit__$__;
module.exports.perf_data_json         = serialize_perf_data;
module.exports.root_context           = root.f_info;

},{"./util.js":5}],5:[function(require,module,exports){
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

},{}]},{},[])
;