var funcdec= new Array();// array to store the name of all the functions
var funcfirsttype= new Array();// array to store the location of Type-I functions

Sample (node)//To track the asynchronous callback in each node
{
    /* 
	To track the Type-I functions
	Defining function on the spot. 
	Example: 
	setInterval (function () { do something }, 100); 
	*/
	if(node.type==="ExpressionStatement")
	{
		for(var i=0;i<node.expression.arguments.length;i++)
		{
			if(node.expression.arguments[i].type==="FunctionExpression")
			funcfirsttype.push(node.expression.callee.loc.start.line);
		}
	}
	
		
	/*
	To track the Type-II functions 
	Variable as a function.
	Example: 
			var f = function () 
					{
					Do something 
					};
	setInterval (f, 100);)
	*/
	if(node.type==="VariableDeclaration")
	{
		for(var i=0;i<node.declarations.length;i++)
		{
			if(node.declarations[i].init.type==="FunctionExpression")
			funcdec.push(node.declarations[i].id.name);
		}
	}
	
		
	/*To track the Type-III functions 
	function definition
	Example:
	function func1 ()
	{
	Do Something
	}
	setInterval (func1, 100);
	*/	
	if(node.type==="FunctionDeclaration")
	{
		funcdec.push(node.id.name)
	}
	
	
	/*
	To track the type-IV functions
	Example:
	function func1 ()
	{
	Do Something
	}
	a = func1;
	b = a;
	setInterval (func1, 100);
	*/
	if(node.type==="VariableDeclaration")
	{
		for(var i=0;i<node.declarations.length;i++)
		{
			for(var j=0;j<funcdec.length;j++)
			{
				if(node.declarations[i].init.name==funcdec[j])
				{
					funcdec.push(node.declarations[i].id.name)
				}
			}
		}
	}
	
	
	/*Create a wrapper function if a function is passed 
	as argument in the function call*/
	/* 
	Logic: In a function call, if an argument matches with any name of the functions stored in the array,
	that argument will be wrapped with a function having the details of line numbers and the original function.
    Example:
    setInterval(b,100) will be changed to setInterval(function(){line_no=**;b()},100)	
	*/
	if(node.type==="ExpressionStatement"&&node.expression.type==="CallExpression")
	{
		for(var i=0;i<node.expression.arguments.length;i++)
		{
			for(var j=0;j<funcdec.length;j++)
			{
				if(node.expression.arguments[i].name==funcdec[j])
				{
					var line_no = node.expression.callee.start.loc.line;
					var name = node.expression.arguments[i].name;
					node.expression.arguments[i].type = "FunctionExpression";
					node.expression.arguments[i].id = null;
					node.expression.arguments[i].params = [];
					node.expression.arguments[i].defaults = [];
					node.expression.arguments[i].body.type = "BlockStatement";
					node.expression.arguments[i].body.body[0].type = "ExpressionStatement"; 
					node.expression.arguments[i].body.body[0].expression.type = "AssignmentExpression";
					node.expression.arguments[i].body.body[0].expression.operator = "=";
					node.expression.arguments[i].body.body[0].expression.left.type = "Identifier";
					node.expression.arguments[i].body.body[0].expression.left.name = "line_no";
					node.expression.arguments[i].body.body[0].expression.right.type = "Literal";
					node.expression.arguments[i].body.body[0].expression.right.value = line_no;
					node.expression.arguments[i].body.body[0].expression.right.raw = line_no.toString();
					node.expression.arguments[i].body.body[0].type = "ExpressionStatement"; 
					node.expression.arguments[i].body.body[0].expression.type = "CallExpression";
					node.expression.arguments[i].body.body[0].expression.callee.type = "Identifier";
					node.expression.arguments[i].body.body[0].expression.callee.name = name;
					node.expression.arguments[i].body.body[0].expression.arguments= [];
					node.expression.arguments[i].body.body[0].rest = null; 
					node.expression.arguments[i].body.body[0].generator = false; 
					node.expression.arguments[i].body.body[0].expression= false; 
				}
			}
		}
	}
}