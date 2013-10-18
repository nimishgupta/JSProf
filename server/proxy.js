var http    = require ('http');
var request = require ('request');
var cheerio = require ('cheerio');
var url     = require ('url');
var path    = require ('path');
var process = require ('process');



function has_html (string)
{
  var html = new RegExp ('html');
  return html.test (string);
}

function has_javascript (string)
{
  var js = new RegExp ('javascript');
  return js.test (string);
}


function is_http_success (status_code)
{
  return ((status_code >= 200) &&
          (status_code <= 299));
}


function remote_response_handler (error,
                                  remote_response, 
                                  body, 
                                  local_response,
                                  local_request)
{
  var instrument = (require ('../lib/instrument.js')).instrument;

  var status_code  = remote_response.statusCode;
  var headers      = remote_response.headers;
  var content_type = remote_response.headers['content-type'];
  var url_path     = local_request.url;

  local_response.writeHead (status_code, headers);

  if (!error && is_http_success (status_code))
  {
    // AOK!

    // console.log (local_request.url + "   " + content_type);

    if (has_html (content_type))
    {
      // parse html
      $ = cheerio.load (body);
      // TODO : prepend run.js
      $('script').each (function (index, element)
                        {
                          var tag = $(this);

                          if (!tag.attr ('src'))
                          {
                            var js_body = tag.html ();
                            try {
                            tag.html (instrument (js_body));
                            }
                            catch (e) {
                              console.log ("instrumenting failed, not instrumenting");
                            }
                          }
                        });
    }
    else if (has_javascript (content_type))
    {
      var file_path = url_path.pathname;

      try
      {
        body = instrument (body, file_path);
      }
      catch (e)
      {
        console.log ("Failed at instrumenting a file : " + file_path);
      }
    }
  }

  local_response.end (body, encoding='binary');
}


function has_everything (string)
{
  var everything = new RegExp ("/*///*");
  return everything.test (string);
}


function JSProf_server (local_request, local_response)
{

  var pathname = url.parse (local_request.url).pathname;
  var extn;

  if (pathname[pathname.length - 1] === '/')
  {
    extn = "html";
  }
  else 
  {
    extn = path.extname (pathname);
  }


  if (extn === "html" || extn === "js")
  {
    delete local_request.headers['accept-encoding'];

    request (local_request,
             function (error, remote_response, body)
             {
               remote_response_handler (error, 
                                        remote_response,
                                        body,
                                        local_response,
                                        local_request);
             });
  }
  else
  {
    local_request.pipe (request (local_request.url)).pipe (local_response);
  }
}




http.createServer (JSProf_server).listen (2500);
