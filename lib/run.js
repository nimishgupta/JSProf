
(function (exports) {
  
  var v_stack = [];

  function touch (caller, callee, time, delta)
  {
    /**
    *
    *
    */
  }


  function __$__m_entry__$__ (name, line, index)
  {
    /** 
     * 1. Record start time
     * 2. put on global stack
     */

    var o = {
               name : name,
               line : line,
               index : index,
               start : new Date (),
               end   : 0
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

     var o = v_stack.pop ();
     o.end = new Date ();

     // sanity check
     if (name  !== o.name ||
         line  !== o.line ||
         index !== o.index)
     {
       // do something!!
     }
   
     var time = end - start;

     // Determine caller
     touch ();
  }

  exports.MONITOR_ENTRY_FUNCTION = "run.__$__m_entry__$__";
  exports.MONITOR_EXIT_FUNCTION  = "run.__$__m_exit__$__";
  exports.__$__m_entry__$__      = __$__m_entry__$__;
  exports.__$__m_exit__$__       = __$__m_exit__$__;

}) (typeof exports === 'undefined' ? this['run'] : exports );
