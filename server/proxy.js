var http = require ('http');
var url  = require ('url');

var proxy_request;
var resp;


function on_data (chunk)
{
  // console.log ('BODY : ' + chunk);
  resp.write (chunk, 'binary');
}

function on_request (res)
{
  // console.log ('STATUS: ' + res.statusCode);
  // console.log ('HEADERS: ' + JSON.stringify (res.headers));

  // res.setEncoding ('utf8');
  res.on ('data', on_data);
  res.on ('end', function () { resp.end (); });

  resp.writeHead (res.statusCode, res.headers);
}


function on_client_request (request, response)
{
  /* Now there could be two types of requests
   * 1. Request for instrumenting a web page
   * 2. Request to fetch instrumented javascript etc
   */

  resp = response;

  // Create connection to actual server 
  proxy_request = http.request (request.url, on_request);

  proxy_request.on ('error', function (e) { console.log ('problem with request: ' + e.message); });

  request.on ('data', function (chunk) { proxy_request.write (chunk, 'binary'); });
  request.on ('end', function () { proxy_request.end (); } );
}

http.createServer (on_client_request).listen(8080);
