var run = require ('../../lib/run');



(function () { run.__$__m_entry__$__("__$__global__$__","0","0","");Array.prototype.swap = function (i, j) {
    run.__$__m_entry__$__('swap', '1', '23', '../suite/bubble_sort_async.js');
    try {
        var k = this[i];
        this[i] = this[j];
        this[j] = k;
    } finally {
        run.__$__m_exit__$__('swap', '1', '23', '../suite/bubble_sort_async.js');
    }
};
function gen_data() {
    run.__$__m_entry__$__('gen_data', '6', '98', '../suite/bubble_sort_async.js');
    try {
        var data = [];
        var N = 100;
        while (N > 0)
            data.push(N--);
        return data;
    } finally {
        run.__$__m_exit__$__('gen_data', '6', '98', '../suite/bubble_sort_async.js');
    }
}
function bubbleSort() {
    run.__$__m_entry__$__('bubbleSort', '16', '205', '../suite/bubble_sort_async.js');
    try {
        var list = gen_data();
        var items = list.slice(0), swapped = false, p, q;
        for (p = 1; p < items.length; ++p) {
            for (q = 0; q < items.length - p; ++q) {
                if (items[q + 1] < items[q]) {
                    items.swap(q, q + 1);
                    swapped = true;
                }
            }
            if (!swapped)
                break;
        }
        return items;
    } finally {
        run.__$__m_exit__$__('bubbleSort', '16', '205', '../suite/bubble_sort_async.js');
    }
}
setTimeout(bubbleSort, 0);
setTimeout(bubbleSort, 0);run.__$__m_exit__$__("__$__global__$__","0","0","");}) ();


function print_perf_data (perf_data)
{
  console.log (perf_data);
}

function display_profiled_data ()
{
  run.perf_data_json (print_perf_data);

  /*
  var stats = run.statistics;

  for (var key in stats)
  {
    if (stats.hasOwnProperty (key))
    {
      var caller = stats[key].caller;
      var callee = stats[key].callee;
      var time   = stats[key].time;
      var ncalls = stats[key].ncalls;
    

      var log = caller.file + ":" + caller.name + 
                " -> " + 
                callee.file + ":" + callee.name  + "     " + ncalls.toString () + " times     " + time.toString () + " ms";
      console.log (log);
    }
  }
  */
}


setTimeout (display_profiled_data, 100);
console.log ("Profiling data begin : ");
