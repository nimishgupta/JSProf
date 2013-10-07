



function touch ()
{
}


function __$__monitor_entry__$__ (/* TODO */)
{
}

function __$__monitor_exit__$__ (/* TODO */)
{
}


function decorate ()
{
}



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
 



// XXX : Detecting functions should be easy enough, but modifying the tree could pose serious problems

function traverse (node, visitor, master)
{
  var parent = (typeof master === 'undefined') ? [] : master;

  if ((typeof visitor === 'function')
      && (visitor !== null)
      && (visitor (node, parent) === false))
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


/* allow it to take callbacks, visitor function that shall be called upon visiting a node */
/* We are interested in function declaration either named or unnamed */


/* Function that parses code and add instrumenting instructions */
function instrument (code, visitor, filename /* In case that there are multiple files */)
{
  
  var options = { loc: true, range: true };
  var ast = esprima.parse (code, options);

  // TODO : Handle errors



  traverse (ast, visitor);

  return true;
}





/**
 * TODO : Also process for asynchronous events
 */

function visit (node, path)
{
  /**
   * We are looking for either a function declaration that might look like
   * function <name> (<args>) { .. }
   * Or we are looking for function expression that may occur in various 
   * contexts. Mostly anonymous function
   */

  if (node.type === Syntax.FunctionDeclaration)
  {
    // XXX : Pretty straightforward C stuff
    var name = node.id.name;

    // XXX : Collect more info, like location etc
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
       // Assigned to a variable or an object property

     }
  }
}
