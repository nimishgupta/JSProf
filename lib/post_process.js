var run = require ('./run.js');
var call_info = require ('./call_graph.js');

/**
 * We need one global view and one per callstack view of functions
 */


function GlobalCallInfo ()
{
  this.bottom_up_view = call_info.CallInfo (); 
  this.top_down_view = [];


  this.process_call_stack = function (call_list_obj)
  {
    var clo = call_list_obj;
    var ci  = call_info.CallInfo ();


    for (var key in call_list_obj)
    {
      if (call_list_obj.hasOwnProperty (key))
      {
        this.bottom_up_view.add_call (call_list_obj[key]);
        ci.add_call (call_list_obj[key]);
      }
    }

    this.top_down_view.push (ci);
    ci.set_root (run.root_context);
  };
}



var global_call_info = new GlobalCallInfo ();



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

   // global_call_info = new GlobalCallInfo ();

   for (var i = 0; i < pd_arr.length; ++i)
   {
     global_call_info.process_call_stack (pd_arr[i]);
   }

   global_call_info.bottom_up_view.set_root (run.root_context);
}


module.exports.process_performance_data = process_performance_data;
module.exports.bottom_up_view           = global_call_info.bottom_up_view;
module.exports.top_down_view            = global_call_info.top_down_view;
