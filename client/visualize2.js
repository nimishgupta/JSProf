var td;

var td_table_id = "topdown_tb_id";

function init_td_data (data)
{
  td = JSON.parse (data);
}

/*  data-tt-id
 *  data-tt-parent-id
*/

function add_row (table, node, id, parent_id)
{
  var new_row = table.insertRow (-1);

  new_row.insertCell (-1).innerHTML = node.self_time_ms;
  new_row.insertCell (-1).innerHTML = "0";
  new_row.insertCell (-1).innerHTML = node.total_time_ms;
  new_row.insertCell (-1).innerHTML = "0";
  new_row.insertCell (-1).innerHTML = node.ntotal_calls;
  new_row.insertCell (-1).innerHTML = node.nself_rec_calls;
  new_row.insertCell (-1).innerHTML = node.name;
  new_row.insertCell (-1).innerHTML = node.file + ":" + node.line;
  new_row.setAttribute ("data-tt-id", id);
  if (parent_id)
  {
    new_row.setAttribute ("data-tt-parent-id", parent_id);
  }
}


function dfs_td (table, callgraph, root, id, parent_id)
{
  add_row (table, root, id, parent_id);

  var i = 0;
  for (var key in root.children)
  {
    dfs_td (table, callgraph, callgraph[key], id + "." + i.toString (), id);
    ++i;
  }
}

function fill_td_data (table_id)
{
  var table = document.getElementById (table_id);
  var parent_id = "";

  // Need a dfs routine
  for (var i = 0; i < td.length; ++i)
  {
    var callgraph = td[i].call_graph;
    var root = callgraph[td[i].root_key];

    for (var key in root.children)
    {
      root = callgraph[key];
    }

    dfs_td (table, callgraph, root, i.toString ());
  }
}


var raw_td_data = '[{"call_graph":{"__$__root__$__:0:js_engine":{"name":"__$__root__$__","line":"0","index":"0","file":"js_engine","own_key":"__$__root__$__:0:js_engine","ntotal_calls":0,"nself_rec_calls":0,"total_time_ms":2,"self_time_ms":0,"does_recur":false,"parents":{},"children":{"__$__global__$__:0:":{"ncalls":1,"time":2}}},"__$__global__$__:0:":{"name":"__$__global__$__","line":"0","index":"0","file":"","own_key":"__$__global__$__:0:","ntotal_calls":1,"nself_rec_calls":0,"total_time_ms":2,"self_time_ms":2,"does_recur":false,"parents":{"__$__root__$__:0:js_engine":{"ncalls":1,"time":2}},"children":{}}},"hot_path":[],"root_key":"__$__root__$__:0:js_engine"},{"call_graph":{"__$__root__$__:0:js_engine":{"name":"__$__root__$__","line":"0","index":"0","file":"js_engine","own_key":"__$__root__$__:0:js_engine","ntotal_calls":0,"nself_rec_calls":0,"total_time_ms":0,"self_time_ms":0,"does_recur":false,"parents":{},"children":{"bubbleSort:205:../suite/bubble_sort_async.js":{"ncalls":1,"time":0}}},"bubbleSort:205:../suite/bubble_sort_async.js":{"name":"bubbleSort","line":"16","index":"205","file":"../suite/bubble_sort_async.js","own_key":"bubbleSort:205:../suite/bubble_sort_async.js","ntotal_calls":1,"nself_rec_calls":0,"total_time_ms":4,"self_time_ms":0,"does_recur":false,"parents":{"__$__root__$__:0:js_engine":{"ncalls":1,"time":0}},"children":{"swap:23:../suite/bubble_sort_async.js":{"ncalls":4950,"time":4},"gen_data:98:../suite/bubble_sort_async.js":{"ncalls":1,"time":0}}},"swap:23:../suite/bubble_sort_async.js":{"name":"swap","line":"1","index":"23","file":"../suite/bubble_sort_async.js","own_key":"swap:23:../suite/bubble_sort_async.js","ntotal_calls":4950,"nself_rec_calls":0,"total_time_ms":4,"self_time_ms":4,"does_recur":false,"parents":{"bubbleSort:205:../suite/bubble_sort_async.js":{"ncalls":4950,"time":4}},"children":{}},"gen_data:98:../suite/bubble_sort_async.js":{"name":"gen_data","line":"6","index":"98","file":"../suite/bubble_sort_async.js","own_key":"gen_data:98:../suite/bubble_sort_async.js","ntotal_calls":1,"nself_rec_calls":0,"total_time_ms":0,"self_time_ms":0,"does_recur":false,"parents":{"bubbleSort:205:../suite/bubble_sort_async.js":{"ncalls":1,"time":0}},"children":{}}},"hot_path":[],"root_key":"__$__root__$__:0:js_engine"},{"call_graph":{"__$__root__$__:0:js_engine":{"name":"__$__root__$__","line":"0","index":"0","file":"js_engine","own_key":"__$__root__$__:0:js_engine","ntotal_calls":0,"nself_rec_calls":0,"total_time_ms":0,"self_time_ms":0,"does_recur":false,"parents":{},"children":{"bubbleSort:205:../suite/bubble_sort_async.js":{"ncalls":1,"time":0}}},"bubbleSort:205:../suite/bubble_sort_async.js":{"name":"bubbleSort","line":"16","index":"205","file":"../suite/bubble_sort_async.js","own_key":"bubbleSort:205:../suite/bubble_sort_async.js","ntotal_calls":1,"nself_rec_calls":0,"total_time_ms":1,"self_time_ms":0,"does_recur":false,"parents":{"__$__root__$__:0:js_engine":{"ncalls":1,"time":0}},"children":{"swap:23:../suite/bubble_sort_async.js":{"ncalls":4950,"time":1},"gen_data:98:../suite/bubble_sort_async.js":{"ncalls":1,"time":0}}},"swap:23:../suite/bubble_sort_async.js":{"name":"swap","line":"1","index":"23","file":"../suite/bubble_sort_async.js","own_key":"swap:23:../suite/bubble_sort_async.js","ntotal_calls":4950,"nself_rec_calls":0,"total_time_ms":1,"self_time_ms":1,"does_recur":false,"parents":{"bubbleSort:205:../suite/bubble_sort_async.js":{"ncalls":4950,"time":1}},"children":{}},"gen_data:98:../suite/bubble_sort_async.js":{"name":"gen_data","line":"6","index":"98","file":"../suite/bubble_sort_async.js","own_key":"gen_data:98:../suite/bubble_sort_async.js","ntotal_calls":1,"nself_rec_calls":0,"total_time_ms":0,"self_time_ms":0,"does_recur":false,"parents":{"bubbleSort:205:../suite/bubble_sort_async.js":{"ncalls":1,"time":0}},"children":{}}},"hot_path":[],"root_key":"__$__root__$__:0:js_engine"}]';

init_td_data (raw_td_data);

fill_td_data ("topdown_tb_id");

