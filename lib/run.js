
  
  var v_stack = [];
  var log;

  function touch (caller, callee, time, delta)
  {
    // debug statement for now

    log = (caller.name + " called " + callee.name + ", callee executed for " + time + " (ms)");
    console.log (log);
  }


  function __$__m_entry__$__ (name, line, index)
  {
    /** 
     * 1. Record start time
     * 2. put on global stack
     */

    var o = {
               f_info : {
                          name : name,
                          line : line,
                          index : index
                        },
              
               start : (new Date ()).getTime ()
            };
  
    v_stack.push (o);
  }



  function __$__m_exit__$__ (name, line, index)
  {
    /**
     * 1. Record end time
     * 2. pop from global stack
     * 3. Do sanity check
     * 4. touch
     */

     end = (new Date ()).getTime ();
     var o = v_stack.pop ();

     var callee = o.f_info;
     var start  = o.start;

     // sanity check
     if (name  !== callee.name ||
         line  !== callee.line ||
         index !== callee.index)
     {
       // do something!!
     }
   
     var time = end - start;

     // Determine caller
     var caller = (v_stack.length) ? v_stack[v_stack.length - 1].f_info :
                                     { name : 'Global', line : '0', index : '0'};

     touch (caller, callee, time);
  }

  module.exports.MONITOR_ENTRY_FUNCTION = "run.__$__m_entry__$__";
  module.exports.MONITOR_EXIT_FUNCTION  = "run.__$__m_exit__$__";
  module.exports.__$__m_entry__$__      = __$__m_entry__$__;
  module.exports.__$__m_exit__$__       = __$__m_exit__$__;
  module.exports.trace_log              = log;

