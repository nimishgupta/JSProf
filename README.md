JSProf
======

Profiler for Java Script


Instructions to run

1. Setup Environment

   1.1 Install node js


   1.2 Install any http server


   1.3 Install the following node modules
       - esprima
       - escodegen (install locally in project/lib/ directory, otherwise node is not able to pick it)
       - cheerio
       - request
       - http
       - path
       - url
       - os
       - fs


   1.4 start proxy server 

        Go into "server/" directory and start proxy server by executing "node proxy.js"


   1.5 Configure proxy in web browser to point to "localhost:2500"


   1.6 Copy "client" folder to a location where it can be served by a http server




2. Running tests

    2.1 Tests are located under "test/suite" which are .js files

    2.2 Include any test js file in an html file (A template has been provided at test/template.html)

    2.3 Keep the html and js file at a convenient place where it can be served through http server

    2.3 Go to browser and access client/main.html over web (Make sure that proxy is *NOT* involved in this step)

    2.4 Enter "url" in the text box which needs profiling and hit profile (make sure that proxy is involved in this step)

    2.5 Click on link above to see results of profiling



=======================


Key to Results

There are two views. A radio button allows to choose between the views

1. Top Down view 
2. Bottom up view

Top Down View : This view shows the program flow from the top most context (i.e. the JS engine). Whenever a function name is clicked in this view, the descendants show which functions are called by that function.

Bottom Up View : This view consists of all the functions that are executed. Whenever a function is clicked in this view, the descendants show the functions which called that function

The node "\_\_$\_\_root\_\_$\_\_" symbolizes the js engine and "\_\_$\_\_global\_\_$\_\_" symbolizes global context

Hot paths are highlighted in pink.
