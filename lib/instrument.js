/**
 * Module : To Add our instrumentation code to original code 
 */

var esprima   = require ('esprima');
var escodegen = require ('escodegen');
var util      = require ('./util.js');
var run       = require ('./run.js');

function traverse (node, visitor, master)
{
  // TODO : put in util
  var parent = (typeof master === 'undefined') ? [] : master;

  if (util.is_callable (visitor) &&
      (visitor (node, parent) === false))
  {
    return;
  }

  for (var key in node)
  {
    if (node.hasOwnProperty (key))
    {
      var child = node[key];
      var path = [ node ];
      path.push (parent);

      // TODO : Put in util
      if (typeof child === 'object' && child !== null)
      {
        traverse (child, visitor, path);
      }
    }
  }
}



/* Kind of main function for now */
/* TODO : Document parameters */
function instrument (code, visitor, init, exit, filename /* TODO : In case that there are multiple files */)
{
  
  var options = { loc: true, range: true };
  var ast = esprima.parse (code, options);

  // TODO : Handle errors


  if (util.is_callable (init) && init () === false)
  {
    return ast;
  }
  
  traverse (ast, visitor);

  if (util.is_callable (exit) && exit () === false)
  {
    return ast;
  }

  return ast;
}





/**
 * Our aim here is to instrument all the functions ( either function declaration (named) or function expression (technically unnamed) by adding a try finally block and calls to monitor_entry and monitor_exit functions.

 *  Here is how the workflow is going to be 
 * 
 * 1. We collect references to all the functions in an array, modifying inplace while traversing them is a bad idea since we need to introduce new code blocks that might interfere with the traversal routing

 * 2. the array is array of objects, object has two properties function's name and its reference. The name is context sensitive for function expression hence it might be tough to derive it later when modifying the code block of function. (Think nested functions)

 * 3. After the array has been formed, lets try to add instrumentation bottom up, nested functions first. Though i believe it can be done otherwise but this method will save us from some errors that we might not have foreseen as the bottom functions modified and nested functions modified dont interfere with the functions above them

 * 4. Hurray! we have modified parse tree, we shall generate code from it using escodegen

 * 5. TODO : Extend this approach to mark functions involved in asynchronous callback, maybe add another visitor
 */


// bad bad global variables
var UNKNOWN_FUNCTION   = 'Unknown';
var ANONYMOUS_FUNCTION = 'Anonymous';

// TODO : Need to pass only parent and not the whole path
// TODO : Rename
function function_name (node, path)
{
  var name = UNKNOWN_FUNCTION;

  if (node.type === esprima.Syntax.FunctionDeclaration)
  {
    // Pretty straightforward C like function declaration
    name = node.id.name;
  }
  else if (node.type === esprima.Syntax.FunctionExpression)
  {
    var parent = path[0];
    
    /**
     * Now we evaluate the context of a function expression to possibly determine
     * its name
     */

    if (parent.type === esprima.Syntax.AssignmentExpression)
    {
      // Assigned to a variable after variable was declared
      switch (parent.left.type)
      {
        case esprima.Syntax.Identifier : name = parent.left.name; break;
        case esprima.Syntax.MemberExpression : if (parent.left.property.name)
                                               {
                                                 name = parent.left.property.name;
                                               }
                                               break;
        default : console.log ("Error");
      }
    }
    else if (parent.type === esprima.Syntax.VariableDeclarator)
    {
      // function assigned to variable, take variable name
      name = parent.id.name;
    }
    else if (parent.type === esprima.Syntax.CallExpression)
    {
      // Function called on itself, check if name is given
      name = parent.id ? parent.id.name : ANONYMOUS_FUNCTION;
    }
    else if (util.is_defined (parent.key)                  &&
             parent.key.type === esprima.Syntax.Identifier &&
             parent.value === node                         &&
             parent.key.name)
    {
      name = parent.key.name;
    }
  }

  if (!util.is_defined (name))
  {
    name = UNKNOWN_FUNCTION;
    console.log ("unknown function name");
  }

  return name;
}



/**
 * We are looking for either a function declaration that might look like
 * function <name> (<args>) { .. }
 * Or we are looking for function expression that may occur in various 
 * contexts. Mostly anonymous function
 */
function is_function_syntax (type)
{
  return (type === esprima.Syntax.FunctionDeclaration) || 
         (type === esprima.Syntax.FunctionExpression);
}


function __decorate (f, name, line, index, filename)
{
  /**
   *   1. Convert function body to string using escode gen
   *   2. Wrap the body in 'stringised' function calls
   *   3. Reparse
   *   4. Reassign
   */

   var body = escodegen.generate (f.body);

   // Inject try and finally

   /* New Body is 
    * {
    *   __$__m_entry__$__ (name, line, index);
    *   try
    *   {
    *     old body
    *   }
    *   finally
    *   {
    *     __$__m_exit__$__ (name, line, index);
    *   }
    * }
    */

   var m_entry_call = util.fcall_to_string (run.MONITOR_ENTRY_FUNCTION,
                                            [name, line, index, filename]);
   var m_exit_call  = util.fcall_to_string (run.MONITOR_EXIT_FUNCTION, []);

   var new_body = m_entry_call + ";" +
                  "try" + body +
                  "finally" + 
                  "{" + 
                      m_exit_call + ";" +
                  "}";

   // We dont care anymore about line numbers and indexes
   // TODO : parsing only a body containing return statement would throw an exception, can add ignore errors for this case but would like not to as other errors shall be silently ignored
   var new_body_ast = esprima.parse (new_body, {tolerant : true});
   
   /* Since its a new parse the 'type' of new_body_ast is 'Program'
    * To merge it back into tree, we need to change it to block statement
    */
  new_body_ast.type = esprima.Syntax.BlockStatement;
   
  
  // Replace old body with new body
  f.body = new_body_ast;

  // Voila! the function has been instrumented
}


function decorate (fn, filename)
{
  var f     = fn.ref;
  var name  = fn.name;
  var line  = f.loc.start.line;
  var index = f.range[0]; 

  // Play magic with function body
  __decorate (f, name, line, index, filename);
}





function TraceFunctionExecution (filename)
{
  this.filename = filename;

  // function array
  this.func_arr = [];

  var self = this;

  this.on_node = function (node, path)
  {
    if (is_function_syntax (node.type))
    {
      var name = function_name (node, path);

      var t = {
                name : name,
                ref  : node
              };

      self.func_arr.push (t);
    }

    return true;
  };


  this.process_functions = function ()
  {
    // This has to be in reverse to keep things simple
    for (var i = self.func_arr.length - 1; i >= 0; --i)
    {
      decorate (self.func_arr[i], self.filename);
    }

    return true;
  };
}


function start (code, filename)
{
  filename = (typeof filename === 'string') ? filename : "";

  var tracer_obj = new TraceFunctionExecution (filename);

  var ast = instrument (code, tracer_obj.on_node,
                        null, tracer_obj.process_functions,
                        filename);

  var new_code =  escodegen.generate (ast);

  /**
   *  Wrap the new code in global function call expression to track that the
   * source/cause of execution is global
   */
  var wrapped_code = "(function () { " + 
                        "var run = require (\'run\');" +
                        // Add entry instrumentation call
                        util.fcall_to_string (run.MONITOR_ENTRY_FUNCTION,
                                              [run.GLOBAL_FUNCTION_STR, 0, 0, ""]) + ";" +

                        new_code + 

                        // Add exit instrumentation call
                        util.fcall_to_string (run.MONITOR_EXIT_FUNCTION, []) + ";" +

                     "}) ();";

  return wrapped_code;
}

module.exports.instrument = start;
