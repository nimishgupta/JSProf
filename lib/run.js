
(function (exports) {
  
  var v_stack = [];
  var log;

  function touch (caller, callee, time, delta)
  {
    // debug statement for now

    log = (caller.name + " called " + callee.name + ", callee executed for " + time + " (ms)");
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
              
               start : new Date ()
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

     end = new Date ();
     var callee = v_stack.pop ();

     var f_info = callee.f_info;
     var start  = callee.start;

     // sanity check
     if (name  !== f_info.name ||
         line  !== f_info.line ||
         index !== f_info.index)
     {
       // do something!!
     }
   
     var time = end - start;

     // Determine caller
     var caller = (v_stack.length) ? v_stack[v_stack.length - 1].f_info :
                                     { name : 'Global', line : '0', index : '0'};

     touch (caller, callee, time);
  }

  exports.MONITOR_ENTRY_FUNCTION = "run.__$__m_entry__$__";
  exports.MONITOR_EXIT_FUNCTION  = "run.__$__m_exit__$__";
  exports.__$__m_entry__$__      = __$__m_entry__$__;
  exports.__$__m_exit__$__       = __$__m_exit__$__;
  exports.trace_log              = log;

}) (typeof exports === 'undefined' ? this['run'] : exports );
