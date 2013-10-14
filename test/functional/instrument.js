var instrument = require ('../../lib/instrument.js');
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

  var new_code = instrument.instrument (data, ifile);
  fs.writeFile (ofile, new_code, 'utf8');
}


if (process.argv.length < 4)
{
  console.log ('Usage : node ' + process.argv[1] + ' <ifile> <ofile>');
  process.exit (1);
}

ifile = process.argv[2];
ofile = process.argv[3];
fs.readFile (ifile, 'utf8', process_file);
