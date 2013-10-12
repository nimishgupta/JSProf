var GLOBAL_FUNCTION_STR = "__$__global__$__";
var global_frame = { 
                      name : GLOBAL_FUNCTION_STR,
                      line : '0',
                      index : '0'
                   };


var call_stack = [global_frame];


function get_key (caller, callee)
{
  return (caller.name + ":" + caller.index.toString () + "&" +
          callee.name + ":" + callee.index.toString ());
}


function is_call_self_recursive (caller, callee)
{
  return ((caller.name === callee.name) &&
          (caller.index === callee.index));
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
      var o   = self.perf_data_raw.pop ();
      var key = get_key (o.caller, o.callee);

      if (!self.perf_data.hasOwnProperty (key))
      {
        // Create new entry for this function call
        self.perf_data[key] = {
                                caller : o.caller,
                                callee : o.callee,
                                time   : 0,
                                ncalls : 0
                              };
      }

      // TODO : Put a more meaningful comment
      // Take into account self-recursive calls
      if (is_call_self_recursive (o.caller, o.callee))
      {
        o.time = 0;
      }

      // TODO : Take into account mutual recursive calls

      self.perf_data[key].time   += o.time;
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
var pd = new PerfData ();


function __$__m_entry__$__ (name, line, index)
{
  /** 
   * 1. Record start time
   * 2. put on global stack
   */

  var o = {
            f_info : {
                       name  : name,
                       line  : line,
                       index : index
                     },

            // TODO : Use high resolution timer 
            start : (new Date ()).getTime ()
          };

  call_stack.push (o);
}



function __$__m_exit__$__ (name, line, index)
{
  /**
   * 1. Record end time
   * 2. pop from global stack
   * 3. Do sanity check
   * 4. touch
   */

  // TODO : Use high resolution timer
  end = (new Date ()).getTime ();
  var o = call_stack.pop ();

  var callee = o.f_info;
  var start  = o.start;

  // sanity check
  if (name  !== callee.name ||
      line  !== callee.line ||
      index !== callee.index)
  {
    if (typeof console === 'object')
    {
      console.log ("Corrupt call stack");
    }
  }

  var time = end - start;

  // Determine caller
  var caller = call_stack[call_stack.length - 1].f_info;

  pd.process_data (caller, callee, time);
}


module.exports.MONITOR_ENTRY_FUNCTION = "run.__$__m_entry__$__";
module.exports.MONITOR_EXIT_FUNCTION  = "run.__$__m_exit__$__";
module.exports.__$__m_entry__$__      = __$__m_entry__$__;
module.exports.__$__m_exit__$__       = __$__m_exit__$__;
module.exports.statistics             = pd.perf_data;
