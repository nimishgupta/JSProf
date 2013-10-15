var td;
var bu;


function init_td_data (data)
{
  td = JSON.parse (data);
}


function init_bu_data (data)
{
  bu = JSON.parse (data);
}



function fill_td_data (table_id)
{
  var table = document.getElementById (table_id);

  for (var i = 0; i < td.length; ++i)
  {
    var callgraph = td[i].callgraph;
    var root = callgraph[callgraph.root_key];


    var new_row = table.insertRow (-1);
    new_row.insertCell (-1).innerHTML = root.self_time_ms;
    new_row.insertCell (-1).innerHTML = "0";
    new_row.insertCell (-1).innerHTML = root.total_time_ms;
    new_row.insertCell (-1).innerHTML = "0";
    new_row.insertCell (-1).innerHTML = root.ntotal_calls;
    new_row.insertCell (-1).innerHTML = root.nself_rec_calls;
    new_row.insertCell (-1).innerHTML = root.name;
    new_row.insertCell (-1).innerHTML = root.file + ":" + root.line;
  }
}


function fill_bu_data (table_id)
{
  var table = document.getElementById (table_id);

  var new_row = table.insertRow (-1);
  new_row.insertCell (0).innerHTML = 45;
} 





fill_td_data ("topdown_tb_id");
fill_bu_data ("bottomup_tb_id");



