/**
 * Module : To Add our instrumentation code to original code 
 */


var Syntax = {
               AssignmentExpression: 'AssignmentExpression',
               ArrayExpression: 'ArrayExpression',
               BlockStatement: 'BlockStatement',
               BinaryExpression: 'BinaryExpression',
               BreakStatement: 'BreakStatement',
               CallExpression: 'CallExpression',
               CatchClause: 'CatchClause',
               ConditionalExpression: 'ConditionalExpression',
               ContinueStatement: 'ContinueStatement',
               DoWhileStatement: 'DoWhileStatement',
               DebuggerStatement: 'DebuggerStatement',
               EmptyStatement: 'EmptyStatement',
               ExpressionStatement: 'ExpressionStatement',
               ForStatement: 'ForStatement',
               ForInStatement: 'ForInStatement',
               FunctionDeclaration: 'FunctionDeclaration',
               FunctionExpression: 'FunctionExpression',
               Identifier: 'Identifier',
               IfStatement: 'IfStatement',
               Literal: 'Literal',
               LabeledStatement: 'LabeledStatement',
               LogicalExpression: 'LogicalExpression',
               MemberExpression: 'MemberExpression',
               NewExpression: 'NewExpression',
               ObjectExpression: 'ObjectExpression',
               Program: 'Program',
               Property: 'Property',
               ReturnStatement: 'ReturnStatement',
               SequenceExpression: 'SequenceExpression',
               SwitchStatement: 'SwitchStatement',
               SwitchCase: 'SwitchCase',
               ThisExpression: 'ThisExpression',
               ThrowStatement: 'ThrowStatement',
               TryStatement: 'TryStatement',
               UnaryExpression: 'UnaryExpression',
               UpdateExpression   : 'UpdateExpression',
               VariableDeclaration: 'VariableDeclaration',
               VariableDeclarator : 'VariableDeclarator',
               WhileStatement     : 'WhileStatement',
               WithStatement      : 'WithStatement'
             };
 



function traverse (node, visitor, master)
{
  // TODO : put in util
  var parent = (typeof master === 'undefined') ? [] : master;

  // TODO : put in util
  if ((typeof visitor === 'function') &&
      (visitor !== null)              &&
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
        if (Array.isArray (child))
        {
          child.forEach (function (node) { traverse (node, visitor, path); });
        }
        else
        {
          traverse (child, visitor, path);
        }
      }
    }
  }
}




/* Kind of main function for now */
function instrument (code, visitor, init, exit, filename /* TODO : In case that there are multiple files */)
{
  
  var options = { loc: true, range: true };
  var ast = esprima.parse (code, options);

  // TODO : Handle errors


  // TODO : Call init

  traverse (ast, visitor);


  // TODO : Call exit

  return true;
}



function is_defined (v)
{
  return (v !== 'undefined');
}



/* global for now, we will see later how to pass it around */
/* TODO : make it a part of object */
var func_array = [];

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

  if (node.type === Syntax.FunctionDeclaration)
  {
    // Pretty straightforward C like function declaration
    name = node.id.name;
  }
  else if (node.type === Syntax.FunctionExpression)
  {
    var parent = path[0];
    
    /**
     * Now we evaluate the context of a function expression to possibly determine
     * its name
     */

    if (parent.type === Syntax.AssignmentExpression)
    {
      // Assigned to a variable after variable was declared
      name = parent.left.name;
    }
    else if (parent.type === Syntax.VariableDeclarator)
    {
      // function assigned to variable, take variable name
      name = parent.id.name;
    }
    else if (parent.type === Syntax.CallExpression)
    {
      // Function called on itself, check if name is given
      name = parent.id ? parent.id.name : ANONYMOUS_FUNCTION;
    }
    else if (is_defined (typeof parent.key.type)   &&
             parent.key.type === Syntax.Identifier &&
             parent.value === node                 &&
             parent.key.name)
    {
      name = parent.key.name;
    }
  }
}



/**
 * We are looking for either a function declaration that might look like
 * function <name> (<args>) { .. }
 * Or we are looking for function expression that may occur in various 
 * contexts. Mostly anonymous function
 */
function is_function_syntax (type)
{
  return (type === Syntax.FunctionDeclaration) || 
         (type === Syntax.FunctionExpression);
}


// TODO : Make it a part of object having the function array
function visit_for_functions (node, path)
{
   if (is_function_syntax (node.type))
   {
     var name = function_name (node, path);
     var t = {
               name : name,
               ref  : node
             };

     func_array.push (t);
   }

   return true;
}




function stringigize_function_call (f_name, args)
{
  var arg_str = "";

  // for no arguments this loop would be skipped
  for (var arg in args)
  {
    arg_str  += (arg.toString () + ",");
  }

  if (0 !== arg_str.Length)
  {
    // trim last extra ","
    arg_str = arg_str.slice (0, arg_str.Length - 2);
  }


  return (f_name + "(" + arg_str + ")");
}



function __decorate (f, name, line, index)
{
  /**
   * TODO :
   * Thinking like this : 
   *   1. Convert function body to string using escode gen
   *   2. Wrap the body in 'stringised' function calls
   *   3. Reparse
   *   4. Reassign
   */

   // XXX : Whoa!!! body could be empty
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
   
   var entry_paren = body[0];
   var exit_paren  = body[body.Length - 1];
}


function decorate (fn)
{
  var f     = fn.ref;
  var name  = f.name;
  var line  = f.loc.start.line;
  var index = f.range[0]; 

  // Play magic with function body
  __decorate (f, name, line, index);
}



// TODO : Give better names to functions 
function process_func_arr (fn_arr)
{
  // This has to be in reverse to keep things simple, see comment XXX somewhere XXX in file
  for (var i = fn_arr.length - 1; i >= 0; --i)
  {
    decorate (fn_arr[i]);
  }
}
