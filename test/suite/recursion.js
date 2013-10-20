function recur (n)
{
  if (n === 0)
  {
    return;
  }

  var j = 0;
  for (var i = 0; i < 1000000; ++i)
  {
    ++j;
  }

  return (j === 0) ? recur (n-2) : recur (n-1);
}




recur (1000);
