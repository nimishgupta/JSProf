var esprima    = require ('../esprima.js');
var escodegen  = require ('../escodegen.js');
var util       = require ('../lib/util.js');
var run        = require ('../lib/run.js');
var instrument = require ('../lib/instrument.js');
var fs         = require ('fs');



/* 
 * 1. Accept a JS filename, read it as string
 * 2. call start on the code
 * 3. dump new code in new file
 */


var ofile;

function process_file (error, data)
{
  if (error)
  {
    return console.log (error);
  }

  var new_code = run.instrument (data);
  fs.write_file (ofile, new_code);
}


if (process.arg.Length < 4)
{
  console.log ('Usage : node ' + process.argv[1] + ' <ifile> <ofile>');
  process.exit (1);
}

var ifile = process.argv[2];
    ofile = process.argv[3];
fs.readFile (ifile, 'utf8', process_file);
