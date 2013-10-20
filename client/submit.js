function pf_data_callback (pf_data)
{
  window.parent.postMessage (pf_data, "*");
}



function window_event_processor (e)
{
  // TODO : Deactivate page

  var run = require ('run');
  run.perf_data_json (pf_data_callback);
}



window.addEventListener ("message", window_event_processor);
