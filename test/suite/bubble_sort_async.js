Array.prototype.swap = function (i, j) {
    var k = this[i]; this[i] = this[j]; this[j] = k;
}


function gen_data ()
{
  var data = [];
  var N = 100;
  while (N > 0) data.push(N--);

  return data;
}


function bubbleSort() {
    var list = gen_data ();
    var items = list.slice(0), swapped = false, p, q;
    for (p = 1; p < items.length; ++p) {
        for (q = 0; q < items.length - p; ++q) {
            if (items[q + 1] < items[q]) {
                items.swap(q, q + 1);
                swapped =true;
            }
        }
        if (!swapped) break;
    }
    return items;
}

setTimeout (bubbleSort, 0);
setTimeout (bubbleSort, 0);

