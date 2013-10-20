var http    = require ('http');
var request = require ('request');
var cheerio = require ('cheerio');
var url     = require ('url');
var path    = require ('path');
var process = require ('process');
var os      = require ('os');
var fs      = require ('fs');


var profile_collector = "run_browser.js";
var profile_submitter = "submit_profile.js";


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

  var url_path     = local_request.url;

  local_response.writeHead (remote_response.statusCode,
                            remote_response.headers);


  // console.log (local_request.url + "   " + remote_response.statusCode + "    " + remote_response.headers['content-type']);

  if (!error && is_http_success (remote_response.statusCode))
  {
    // AOK!

    var status_code  = remote_response.statusCode;
    var headers      = remote_response.headers;
    var content_type = remote_response.headers['content-type'];


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
                              console.log (js_body);
                              console.log ("instrumenting failed, not instrumenting");
                              process.exit (-1);
                            }
                          }
                        });

      // TODO : Things are hardcoded
      $('head').prepend ('<script type="application/javascript" src="http://localhost:2500/run_browser.js"></script>');
      $('head').prepend ('<script type="application/javascript" src="http://localhost:2500/submit_profile.js"></script>');
      body = $.html ();
    }
    else if (has_javascript (content_type))
    {
      var file_path = url.parse (url_path).pathname;

      try
      {
        console.log ("serving instrumented js for " + file_path);
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


function JSProf_server (local_request, local_response)
{
  var pathname = url.parse (local_request.url).pathname;
  var extn = (pathname[pathname.length - 1] === '/') ? extn = ".html" : path.extname (pathname);

  // Check if request is for a static file
  if ((extn === ".js") && ((path.basename (pathname) === profile_collector) || 
                           (path.basename (pathname) === profile_submitter)))
  {
    // serve local file
    var name = path.basename (pathname);
    var js_mime = "application/javascript";

    local_response.writeHead (200, { 'Content-Type' : js_mime });

    if (profile_collector === name)
    {
      // console.log ("Serving run_browser.js");
      fs.createReadStream ("../client/run_browser.js").pipe (local_response);
    }
    else if (profile_submitter === name)
    {
      // console.log ("Serving submit.js");
      fs.createReadStream ("../client/submit.js").pipe (local_response);
    }

    return;
  }


  if (extn === ".html" || extn === ".js")
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
    // Short circuit
    local_request.pipe (request (local_request.url)).pipe (local_response);
  }
}

http.createServer (JSProf_server).listen (2500);
