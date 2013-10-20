function recv_perf_data (perf_data)
{
  pp.process_performance_data (perf_data);

  console.log ("Profiling data begin : ");
  console.log (JSON.stringify (pp.bottom_up_view));
  console.log (JSON.stringify (pp.top_down_view));
}

function display_profiled_data ()
{
  run.perf_data_json (recv_perf_data);
}

setTimeout (display_profiled_data, 100);
