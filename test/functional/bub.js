var run = require ("../../lib/run");
var process = require ('process');


Array.prototype.swap = function (i, j) {
    run.__$__m_entry__$__('swap', '1', '23');
    try {
        var k = this[i];
        this[i] = this[j];
        this[j] = k;
    } finally {
        run.__$__m_exit__$__('swap', '1', '23');
    }
};
function bubbleSort(list) {
    run.__$__m_entry__$__('bubbleSort', '5', '97');
    try {
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
        run.__$__m_exit__$__('bubbleSort', '5', '97');
    }
}
var N = 10000, data = [];
while (N > 0)
    data.push(N--);
bubbleSort(data);


function display_profiled_data ()
{
  var stats = run.statistics;

  for (var key in stats)
  {
    if (stats.hasOwnProperty (key))
    {
      var caller = stats[key].caller;
      var callee = stats[key].callee;
      var time   = stats[key].time;
      var ncalls = stats[key].ncalls;

      var log = caller.name + " -> " + callee.name  + "     " + ncalls.toString () + " times     " + time.toString () + " ms";
      console.log (log);
    }
  }
}


setTimeout (display_profiled_data, 100);
console.log ("Profiling data begin : ");
