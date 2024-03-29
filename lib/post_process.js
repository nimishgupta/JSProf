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
