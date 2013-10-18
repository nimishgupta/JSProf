var http    = require ('http');
var request = require ('request');
var cheerio = require ('cheerio');
var url     = require ('url');



function process_script_tag (index, element)
{
  if (element.attr ('src'))
  {
    console.log ("src is : " + element.attr ('src'));
    

    // use url.resolve to resolve script references
  }
  else
  {
    console.log ("javascript is : " + element.html ());
  }
}


function remote_response_handler (error,
                                  remote_response, 
                                  body, 
                                  local_response)
{
  local_response.writeHead (remote_response.statusCode,
                            remote_response.headers);

  if (!error && remote_response.statusCode === 200)
  {
    // AOK!

    console.log (remote_response.headers['content-type']);
    var html = new RegExp ("html");
    if (true ===  html.test (remote_response.headers['content-type']))
    {
      // parse html
      console.log ("Here");
      console.log (body);
      $ = cheerio.load (body);
      $('script').each (function (index, element)
                        {
                          process_script_tag (index, $(this));
                        });
    }
    else
    {
      console.log ("regex failed");
    }
  }

  local_response.end (body, encoding='binary');
}




function JSProf_server (local_request, local_response)
{
  var html = new RegExp ("html");
  if (true ===  html.test (local_request.headers.accept))
  {
    if (local_request.headers['accept-encoding'])
    {
      delete local_request.headers['accept-encoding'];
    }

    console.log (local_request.url);

    request (local_request,
             function (error, remote_response, body)
             {
               remote_response_handler (error, 
                                        remote_response,
                                        body,
                                        local_response);
             });
  }
  else
  {
    local_request.pipe (request (local_request.url)).pipe (local_response);
  }
}




http.createServer (JSProf_server).listen (2500);
