var funcdec= new Array();
var funcfirsttype= new Array();
var callbacks={};
Sample (node)//To track the asynchronous callback in each node
{
	// To track the Type-I functions
	for(var i=0;i<node.body.length;i++)
	{
		for(var j=0;j<node.body[i].arguments.length;j++)
		{
		    if(node.body[i].arguments[j].type==="FunctionExpression")
			funcfirsttype.push(node.body[i].arguments[j].body.loc.start.line);
		}
	}
	
	//To track the Type-II functions
	for(var i=0;i<node.body.length;i++)
	{	
		for(var j=0;j<node.body[i].declarations.length;j++)
		{
			if((node.body[i].type==="VariableDeclaration")&&node.body[i].declarations[j].init.type==="FunctionExpression")
			funcdec.push(node.body[i].declarations[j].id.name);
		}
	}
	
	//To track the Type-III functions
	for(var i=0;i<node.body.length;i++)
	{
		if(node.body[i].type==="FunctionDeclaration")
		{
			funcdec.push(node.body[i].id.name)
		}
	}
	
	//To track the type-IV functions
	for(var i=0;i<node.body.length;i++)
	{
		for(var j=0;j<node.body[i].declarations.length;j++)
		{
			for(var k=0;k<funcdec.length;k++)
			{
				if((node.body[i].type==="VariableDeclaration")&&node.body[i].declarations[j].init.name==funcdec[k])
				{
					funcdec.push(node.body[i].declarations[j].id.name)
				}
			}
		}
	}
	
}
