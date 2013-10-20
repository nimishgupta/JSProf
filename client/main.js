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



function fill_bu_data (table_id, bu_data)
{
  var table = document.getElementById (table_id);

  // Need a dfs routine
  var i = 0;
  for (var key in bu_data.call_graph)
  {
    if (bu_data.call_graph.hasOwnProperty (key))
    {
      if (key !== bu_data.root_key)
      {
        dfs_bu (table, bu_data.call_graph, bu_data.call_graph[key], i.toString ());
        ++i;
      }
    }
  }
}



function fill_td_data (table_id, td_data)
{
  var table = document.getElementById (table_id);
  var root = td_data.call_graph[td_data.root_key];
  dfs_td (table, td_data.call_graph, root, "0");
}


var td_table_id = "topdown_tb_id";
var bu_table_id = "bottomup_tb_id";


function on_message (e)
{
  var pf_data = e.data;
  var post_process = require ('post_process');
  post_process.process_performance_data (pf_data);

  fill_bu_data (bu_table_id, post_process.bottom_up_view);
  fill_td_data (td_table_id, post_process.top_down_view);


  document.getElementId ("iframe_div").style.display         = 'none';
  document.getElementId ("submit_profile_div").style.display = 'none';
  document.getElementId ("results_div").style.display        = 'block';
}


window.addEventListener ("message", on_message);
