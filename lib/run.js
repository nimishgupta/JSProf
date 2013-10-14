var util = require ('./util.js');


var GLOBAL_FUNCTION_STR = "__$__global__$__";

var call_stack = [];

function get_key (caller, callee)
{
  return (caller.name + ":" + caller.index.toString () + ":" + callee.file + "&" +
          callee.name + ":" + callee.index.toString () + ":" + callee.file);
}


function is_same_function (f1, f2)
{
  return !((f1.name  === f2.name)  &&
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

  this.timer_id  = null;

  var self = this;

  this.process_data_async = function ()
  {
    // Invalidate timer id so that any other call is not cancelled accidentally
    self.timer_id = null;

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
       * comprises of last recursive call.
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
    clearTimeout (self.timer_id);
    self.timer_id = setTimeout (self.process_data_async, 0);
  };
}


// THE global object
var pd_unit = new PerfData ();


var pd_objs = [];


function cur_time ()
{
  // TODO : Use higher resolution timer
  return (new Date ()).getTime ();
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



function __$__m_exit__$__ (name, line, index, file)
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

  // sanity check, not required except for debugging purpose
  if (name  !== callee.name  ||
      line  !== callee.line  ||
      index !== callee.index ||
      file  !== callee.file)
  {
    // Node js specific
    if (typeof console === 'object')
    {
      console.log ("Corrupt call stack");
    }
  }

  var time = end - start;

  // Determine caller
  if (0 === call_stack.length)
  {
    // No caller for the first function in call stack 

    // Time for new call stack information
    pd_objs.push (pd_unit);
    pd_unit = new PerfData ();
  }
  else
  {
    var caller = call_stack[call_stack.length - 1].f_info;
    pd_unit.process_data (caller, callee, time);
  }
}



function serialize_perf_data (callback)
{
  // Make sure that all data has been processed

  /* TODO : Maynot work in a website kind of a scenario, where there is always some activity
   *        going on
   */
  while (0 !== call_stack.length)
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
    callback (JSON.stringify (pd_arr));
  }
}


module.exports.MONITOR_ENTRY_FUNCTION = "run.__$__m_entry__$__";
module.exports.MONITOR_EXIT_FUNCTION  = "run.__$__m_exit__$__";
module.exports.GLOBAL_FUNCTION_STR    = GLOBAL_FUNCTION_STR;
module.exports.__$__m_entry__$__      = __$__m_entry__$__;
module.exports.__$__m_exit__$__       = __$__m_exit__$__;
module.exports.perf_data_json         = serialize_perf_data;
