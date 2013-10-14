var pp = require ('../../lib/post_process.js');
var fs         = require ('fs');

/* 
 * 1. Accept a JS filename, read it as string
 * 2. call start on the code
 * 3. dump new code in new file
 */


var ifile, ofile;

function process_file (error, data)
{
  if (error)
  {
    return console.log (error);
  }

  pp.process_performance_data (data);

  console.log ("Data : ");
  console.log (JSON.stringify  (pp.bottom_up_view));
  console.log (JSON.stringify (pp.top_down_view));
}


if (process.argv.length < 3)
{
  console.log ('Usage : node ' + process.argv[1] + ' <ifile>');
  process.exit (1);
}

ifile = process.argv[2];
fs.readFile (ifile, 'utf8', process_file);
