function url_submit ()
{
  var url = document.getElementById ("url_pf").value;
  url = url.trim ();

  // Post message
  document.getElementById ("wp_iframe").src = url;

  document.getElementById ("accept_url_div").style.display     = 'none';
  document.getElementById ("submit_profile_div").style.display = 'block';
  document.getElementById ("iframe_div").style.display         = 'block';

  return false;
}


function on_profile_submit ()
{
  var iframe_win = document.getElementId ("wp_iframe").contentWindow;
  var src = document.getElementId ("wp_iframe").src;

  iframe_win.postMessage ("its_over", src);
}




var td_table_id = "topdown_tb_id";
var bu_table_id = "bottomup_tb_id";


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


function dfs_bu (table, callgraph, root, id, parent_id)
{
  add_row (table, root, id, parent_id);

  var i = 0;
  for (var key in root.parents)
  {
    dfs_bu (table, callgraph, callgraph[key], id + "." + i.toString (), id);
    ++i;
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



function fill_bu_data (table_id)
{
  var table = document.getElementById (table_id);
  var parent_id = "";

  // Need a dfs routine
  var i = 0;
  for (var key in bu.call_graph)
  {
    if (key !== bu.root_key)
    {
      dfs_bu (table, bu.call_graph, bu.call_graph[key], i.toString ());
      ++i;
    }
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



function on_message (e)
{
  var pf_data = e.data;
  var post_process = require ('post_process');
  post_process.process_performance_data (pf_data);

  fill_bu_data (post_process.bottom_up_view);
  fill_td_data (post_process.top_down_view);


  document.getElementId ("iframe_div").style.display         = 'none';
  document.getElementId ("submit_profile_div").style.display = 'none';
  document.getElementId ("results_div").style.display        = 'block';
}


window.addEventListener ("message", on_message);
