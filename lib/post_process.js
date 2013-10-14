var run = require ('./run.js');

/**
 * We need one global view and one per callstack view of functions
 */


function GlobalCallInfo ()
{
  this.bottom_up_view = new CallInfo (); 
  this.top_down_view = [];


  this.process_call_stack = function (call_list_obj)
  {
    var clo = call_list_obj;
    var ci  = new CallInfo ();


    for (var key in call_list_obj)
    {
      if (call_list_obj.hasOwnProperty (key))
      {
        bottom_up_view.add_call (call_list_obj[key]);
        ci.add_call (call_list_obj[key]);
      }
    }

    top_down_view.push (ci);
    ci.set_root (run.root_context);
  };
}



var global_call_info;



function process_performance_data (pd_json)
{
  // its supposed to be an array of callstacks
  var pd_arr = JSON.parse (pd_json);

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

   global_call_info = new GlobalCallInfo ();

   for (var i = 0; i < pd_arr.length; ++i)
   {
     global_call_info.process_call_stack (pd_arr[i]);
   }
}

