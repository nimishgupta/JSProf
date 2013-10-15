var funcdec= new Array();
var funcfirsttype= new Array();
var callbacks={};
Sample (node)//To track the asynchronous callback in each node
{
    // To track the Type-I functions
	if(node.type==="ExpressionStatement")
	{
		for(var i=0;i<node.expression.arguments.length;i++)
		{
			if(node.expression.arguments[i].type==="FunctionExpression")
			funcfirsttype.push(node.expression.callee.loc.start.line);
		}
	}
	
	//To track the Type-II functions
	if(node.type==="VariableDeclaration")
	{
		for(var i=0;i<node.declarations.length;i++)
		{
			if(node.declarations[i].init.type==="FunctionExpression")
			funcdec.push(node.declarations[i].id.name);
		}
	}
		
	//To track the Type-III functions
	if(node.type==="FunctionDeclaration")
	{
		funcdec.push(node.id.name)
	}
	
	//To track the type-IV functions
	if(node.type=="VariableDeclaration")
	{
		for(var i=0;j<node.declarations.length;i++)
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
	
}
