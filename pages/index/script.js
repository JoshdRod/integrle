// TODO: Eventually, put this in a separate file
let RAW_SOLUTION = "1/2 x^2 sin(2x) + 1/2 x cos(2x) - 1/4 sin(2x) + c";
let SOLUTION = normaliseTree(strToTree(RAW_SOLUTION));
let answerText = document.getElementById("answerText"); // Answer that appears on win modal
answerText.innerText = `\\(${RAW_SOLUTION}\\)`;

let answerBox = document.getElementById("answerBox");
let answerBoxMathJax = document.getElementById("userResponseMathJax");

// Response boxes - store previous answers
let response1 = document.getElementById("response1");
let response2 = document.getElementById("response2");
let response3 = document.getElementById("response3");
let response4 = document.getElementById("response4");

// Colour boxes - store colour of previous answers for answer modal
let colourBox1 = document.getElementById("colourBox1");
let colourBox2 = document.getElementById("colourBox2");
let colourBox3 = document.getElementById("colourBox3");
let colourBox4 = document.getElementById("colourBox4");

let winModal = document.getElementById("winModal");
var winModalClose = document.getElementsByClassName("close")[0];

answerBox.addEventListener("keydown", handleAnswerInputChange);
winModalClose.addEventListener("click", handleCloseModal);
window.addEventListener("click", handleCloseModal);

// Set up trusted html (for response boxes)
if (typeof trustedTypes === "undefined")
	trustedTypes = {
		createPolicy: (n, rules) => rules
	};

const policy = trustedTypes.createPolicy("my-policy",
{
	createHTML: (input) => DOMPurify.sanitize(input),
});

let responseCount = 0;

// Helper function to convert answer correctness to RGB colour string
function getColourString(correctness)
{
	let colour = {
		"red": 255 * (100 - correctness) / 100,
		"green": 255 * (correctness) / 100,
		"blue": 0
	};

	return `rgb(${colour["red"]}, ${colour["green"]}, ${colour["blue"]})`;
}

function handleAnswerInputChange(event)
{
	// If invalid character pressed, don't add to text box
	if (!"abcdefghijklmnopqrstuvwxyz0123456789*/+-^() enter backspace arrowleft arrowright".includes(event.key.toLowerCase()))
	{
		event.preventDefault();
		return;
	}
	// Re-generate input text box
	let response = answerBox.value;
	if ("sincotax0123456789*/+-^()".includes(event.key))
		response += event.key;
	else if (event.key == "Backspace")
		response = response.slice(0,-1);

	// Attempt to generate expression tree. If input doesn't create valid tree yet, don't
	let expressionTree = "";
	try
	{
		expressionTree = strToTree(response);
	}
	catch (e)
	{
		return;
	}

	let responseMathJax = policy.createHTML(`\\(${treeToMathJax(expressionTree)}\\)`);
	let normalisedExpressionTree = normaliseTree(expressionTree);
	answerBoxMathJax.innerHTML = responseMathJax;
	MathJax.typeset();
	
	if (event.key == "Enter")
	{
		// Update win modal
		let answerCorrectness = evaluateCorrectness(normalisedExpressionTree, SOLUTION);
		let correctnessColour = getColourString(answerCorrectness);
		let responseBox;
		switch (responseCount)
		{
			case 0:
				response1.innerHTML = responseMathJax;
				responseBox = response1;
				response1.style.backgroundColor = correctnessColour;
				colourBox1.style.backgroundColor = correctnessColour;
				break;
			case 1:
				response2.innerHTML = responseMathJax;
				responseBox = response2;
				response2.style.backgroundColor = correctnessColour;
				colourBox2.style.backgroundColor = correctnessColour;
				break;
			case 2:
				response3.innerHTML = responseMathJax;
				responseBox = response3;
				response3.style.backgroundColor = correctnessColour;
				colourBox3.style.backgroundColor = correctnessColour;
				break;
			case 3:
				response4.innerHTML = responseMathJax;
				responseBox = response4;
				response4.style.backgroundColor = correctnessColour;
				colourBox4.style.backgroundColor = correctnessColour;
				break;
		}
		responseCount++;
		// Render new mathjax
		MathJax.typeset();

		// Handle win (show pop-up)
		if (evaluateIfBTreesEqual(expressionTree, SOLUTION))
		{
			winModal.style.display = "flex";
		}
	}
}

function handleCloseModal()
{
	winModal.style.display = "none";
}

// Expression to component list
function expressionToComponentList(expression)
{
	let Constants = ['e', "pi", 'c'];
	let exp = cleanExpression(expression);
	let list = [];
	let content = "";
	let type = "";
	let i = 0;
	while (i < exp.length)
	{
		if (exp[i] == '-')
		{

			// If not at start of expression/bracket, add + as well
			// e.g: 5-2 -> 5+ -1 * 2
			if
			(
				!(list.length == 0 ||
				list.length > 0 &&
					(list[list.length - 1].type == NodeType.OPEN_BRACKET
					|| list[list.length - 1].type == NodeType.FUNCTION))
			)
			{
				list.push(new Node("operator", '+'));
			}

			type = "number";
			content = "-1";
			i++;
		}

		// If number, find end of num and add whole num
		else if (!isNaN(exp[i]))
		{
			let foundNumberEnd = false;
			for (let j = i; j < exp.length; j++)
			{
				if (isNaN(exp[j]))
				{
					content = exp.slice(i, j);
					type = "number";

					i = j;
					foundNumberEnd = true;
					break;
				}
			}
			if (foundNumberEnd == false) // If can't find any non-nums, then number extends to end of string
			{
				content = exp.slice(i);
				type = "number";

				i = exp.length;
			}
		}

		// If bracket, add to list
		else if (['(', ')'].includes(exp[i]))
		{
			content = exp[i];
			type = exp[i] == '(' ? "open bracket" : "close bracket"; 

			i++;
		}

		// If operator, add to list
		else if (['+', '-', '/', '*', '^'].includes(exp[i]))
		{
			content = exp[i];
			type = "operator";
			i++;
		}

		// If x, add to list
		else if (exp[i] == 'x')
		{
			content = 'x';
			type = "variable";

			i++;
		}

		// If other letters, treat as function/constant, add to list
		else if (exp[i].toUpperCase() != exp[i].toLowerCase())
		{
			let foundFunctionNameEnd = false;
			// Go until x, constant, or non-letter found
			for (let j = i; j < exp.length; j++)
			{
				if (exp[j] == 'x' || exp[j].toUpperCase() == exp[j].toLowerCase())
				{
					content = exp.slice(i, j);

					i = j;
					foundFunctionNameEnd = true;
					break;
				}
			}
			// If for loop finishes, then function name extends to end of string
			if (foundFunctionNameEnd == false)
			{
				content = exp.slice(i);

				i = exp.length;
			}

			// Determine if function or constant
			if (Constants.includes(content))
			{
				type = "constant";
			}
			else
			{
				type = "function";
			}
		}

		// Add new component
		list.push(new Node(type, content));

		// Check for implicit * signs
		// If previous component is: Number, Variable, or Close Bracket
		// And current component is: Open Bracket, Number, Variable, or Function
		// We need a * sign between the two
		// e.g 5sin(x) -> 5 * sin ( x )
		// e.g 10x -> 10 * x
		// e.g (10 + x)(3 + x) -> ( 10 + x ) * ( 3 + x )
		if (
			list.length >= 2
			&& [NodeType.CLOSE_BRACKET, NodeType.NUMBER, NodeType.VARIABLE].includes(list[list.length - 2].type)
			&& [NodeType.OPEN_BRACKET, NodeType.NUMBER, NodeType.VARIABLE, NodeType.FUNCTION].includes(list[list.length - 1].type)
		)
		{
			list.splice(-1, 0, new Node("operator", '*'));
		}
			
	}
	return list;
}

// Puts the components in a list into postfix notation
// Uses modified Shunting Yard Algorithm
function componentListToPostfix(list)
{
	let postfixList = [];
	let operatorStack = [];
	let index = 0;
	// Iterate over components
	while(index < list.length)
	{
		let component = list[index];
		// If number, constant, or variable, put in output
		if ([NodeType.NUMBER, NodeType.CONSTANT, NodeType.VARIABLE].includes(component.type))
		{
			postfixList.push(component);
		}
		// If (, recurse and add to string
		else if (component.type == NodeType.OPEN_BRACKET)
		{
			let bracketEval = componentListToPostfix(list.slice(index+1));
			index += bracketEval.index + 1; // +1, as list indices start from 0
			postfixList.push(...bracketEval.postfixList);
			if (operatorStack.length > 0)
				postfixList.push(operatorStack.pop());
		}
		// If ), return
		else if (component.type == NodeType.CLOSE_BRACKET)
		{
			postfixList.push(...operatorStack.reverse());
			return {
				postfixList: postfixList,
				index: index
			};
		}
		// If operator or function, look at stack
		else if (component.type == NodeType.OPERATOR || component.type == NodeType.FUNCTION) {
			// If function, push
			// Functions never cause an operator to be popped. e.g: in 1 * 2 + 3, the + causes the * to be popped.
			// In 1 * sin(3), the sin doesn't cause the * to be popped.
			if (component.type == NodeType.FUNCTION)
				operatorStack.push(component);

			// If higher precedence than top of stack, push
			else if (operatorStack.length == 0 || component.precedence > operatorStack[operatorStack.length - 1].precedence)
			{
				operatorStack.push(component);
			}
			// If same/lower precedence, pop all higher precedence operators + push
			else
			{
				while (operatorStack.length > 0 && component.precedence <= operatorStack[operatorStack.length - 1].precedence)
				{
					postfixList.push(operatorStack.pop());
				}
				operatorStack.push(component);
			}
		}
		index++;
	}
	// At end, unload operator stack
	postfixList.push(...operatorStack.reverse());
	return postfixList;
}

// Takes a list of components in postfix, and converts into tree
// INPUTS: list of components in the tree
// RETURNS: list Tree
function postfixToTree(components, index=0, parentIndex=-1, depth=0)
{
	// Ironically, this works better with prefix, so convert
	if (depth == 0)
		components = components.reverse();

	let currentComponent = components[index];
	currentComponent.parent = parentIndex;
	currentComponent.depth = depth;

	switch(currentComponent.type)
	{
		case NodeType.FUNCTION:
		case NodeType.OPERATOR: {
			let componentIndex = index;

			currentComponent.leftNode = index+1;
			index = postfixToTree(components, index+1, componentIndex, depth+1);

			if (currentComponent.type == NodeType.OPERATOR)
			{
				currentComponent.rightNode = index+1;
				index = postfixToTree(components, index+1, componentIndex, depth+1);
			}
			break;
		}
		case NodeType.NUMBER:
		case NodeType.CONSTANT:
			break;
	}

	if (depth > 0)
		return index;
	else
		return new Tree(components);
}

// As there are multiple ways to write the same maths expression, there are multiple graphs that map to equivalent expressions. To compare equality of 2 graphs, they must first both be normalised (essentially, sorting elements under commutative operators by their content)
// INPUTS: list tree
// RETURNS: list normalised tree
function normaliseTree(tree, rootNodeIndex=0)
{
	let currentNodeIndex = rootNodeIndex;
	while (currentNodeIndex != -1)
	{
		let currentNode = tree.Get(currentNodeIndex);
		// If commutative node found, add children to list
		if (currentNode.type == NodeType.OPERATOR && currentNode.commutative == true)
		{
			let terms = findCommutativeNodes(tree, currentNodeIndex, currentNode.content);
			let commutativeNodes = terms.nodes;
			let locationsToPutCommutativeNodes = terms.parents;

			// Sort nodes in list by content
			commutativeNodes = sortCommutativeNodes(tree, commutativeNodes);
			// Add nodes back to tree in content order
			for (let i = 0; i < locationsToPutCommutativeNodes.length; i++)
			{
				// Link parent to child
				let location = locationsToPutCommutativeNodes[i];
				if (location.side == 'L')
					tree.Get(location.index).leftNode = commutativeNodes[i];
				else
					tree.Get(location.index).rightNode = commutativeNodes[i];

				// Link child to parent
				tree.Get(commutativeNodes[i]).parent = location.index;
			}
		}
		// DFS through tree
		currentNodeIndex = findNextInDFS(tree, rootNodeIndex, currentNodeIndex);
	}
	return tree;
}

// Sorts nodes that are commutative under an operator by their content
// This is so they can be moved around the tree to normalise it
// INPUTS: tree, list of nodes
// RETURNS: list[int] of node indices, ordered by content
function sortCommutativeNodes(tree, nodes)
{
	// Implementing a bubble sort here, as lists should be very small (min 2, rarely much greater)
	for (let i = 1; i < nodes.length; i++)
	{
		for (let j = 0; j < nodes.length - i; j++)
		{
			if (evaluateIfSwapNeeded(tree, nodes[j], nodes[j+1]))
			{
				let temp = nodes[j];
				nodes[j] = nodes[j+1];
				nodes[j+1] = temp;
			}
		}
	}
	return nodes;
}

// Finds nodes in expression tree that are commutative under an operator in the expression, and their location relative to their parent
// INPUTS: tree, int index of operator node, str type of operator (* or +)
// RETURNS: list[int] of indices that are commutative under the operator tree.Get(n), where n is the first currentNode,
// 		list[obj] of locations of nodes, relative to their parent  ({index of parent, side of parent node is on}).
function findCommutativeNodes(tree, opNodeIndex, operator)
{
	let opNode = tree.Get(opNodeIndex);
	let commutativeNodesList = [];
	let commutativeParentsList = [];
	let nodesToCheck = [];

	let leftNodeIndex = opNode.leftNode;
	let leftNode = tree.Get(leftNodeIndex);
	nodesToCheck.push(leftNode);

	let rightNodeIndex = opNode.rightNode;
	let rightNode = tree.Get(rightNodeIndex);
	nodesToCheck.push(rightNode);

	for (const node of nodesToCheck)
	{
		if (node.type != NodeType.OPERATOR || node.commutative == false)
		{
			commutativeNodesList.push(tree.Find(node));
			let parentNode = tree.Get(node.parent);
			commutativeParentsList.push({
				"index": node.parent,
				"side": parentNode.leftNode == tree.Find(node) ? 'L' : 'R'
			});
			continue;
		}

		// If commutative node of different type (* instead of +) found, normalise that subtree, then add to list
		if (node.content != operator)
		{
			normaliseTree(tree, tree.Find(node));
			commutativeNodesList.push(tree.Find(node));
			let parentNode = tree.Get(node.parent);
			commutativeParentsList.push({
				"index": node.parent,
				"side": parentNode.leftNode == tree.Find(node) ? 'L' : 'R'
			});
			continue;
		}
		// If commutative node of same type found, check children
		let leftNodeIndex = node.leftNode;
		let leftNode = tree.Get(leftNodeIndex);
		nodesToCheck.push(leftNode);

		let rightNodeIndex = node.rightNode;
		let rightNode = tree.Get(rightNodeIndex);
		nodesToCheck.push(rightNode);
	}
	return {"nodes": commutativeNodesList,
		"parents": commutativeParentsList};
}

// Compares 2 binary trees, and returns true if their contents are equal.
// INPUTS: 2 binary trees - b1, b2
// RETURNS: bool - are they equal?
function evaluateIfBTreesEqual(b1, b2)
{
	if (b1.length != b2.length)
		return false;

	// Loop over trees until fully DFS'd
	// If at any point, corresponding nodes don't match, trees are not equal
	let b1CurrentNode = 0;
	let b2CurrentNode = 0;
	while (b1CurrentNode != -1)
	{
		if (b1.Get(b1CurrentNode).content != b2.Get(b2CurrentNode).content)
			return false;
		b1CurrentNode = findNextInDFS(b1, 0, b1CurrentNode);
		b2CurrentNode = findNextInDFS(b2, 0, b2CurrentNode);
	}
	// If all equal, graphs are equal!
	return true;

}

// Takes in 2 expression trees, and compares how similar the 1st is to the 2nd
// FORMULA: (1 - e^(no. identical nodes / no. nodes in exp2 + difference in no. nodes between 2 trees)) * 100
// INPUTS: 2 expression trees - b1, b2
// RETURNS: int (0 - 100) correctness: 100 = correct, 0 = completely incorrect
function evaluateCorrectness(exp1, exp2)
{
	// If trees are equal, then return 100
	let equal = evaluateIfBTreesEqual(exp1, exp2);
	if (equal)
		return 100;

	let difference = Math.abs(exp1.length - exp2.length);
	// Loop over trees until fully DFS'd
	// If nodes are identical, add 1 to count
	let identicalNodesCount = 0;
	let exp1CurrentNode = 0;
	let exp2CurrentNode = 0;
	for (let i = 0; i < Math.min(exp1.length, exp2.length); i++)
	{
		if (exp1.Get(exp1CurrentNode).content == exp2.Get(exp2CurrentNode).content)
			identicalNodesCount++;

		exp1CurrentNode = findNextInDFS(exp1, 0, exp1CurrentNode);
		exp2CurrentNode = findNextInDFS(exp2, 0, exp2CurrentNode);
	}

	return (1 - Math.exp(-1 * (identicalNodesCount / (exp2.length + difference)))) * 100;
}

// Compares 2 subgraphs of a tree, to determine if the right graph is "greater" than the left.
// If so, the two subgraphs need to be swapped around.
// Essentially performs a DFS simultaneously on both graphs, until the contents of the nodes being visited is different.
// In this case, compare the two. If right graph > left, return true. Else, return false.
// If no differences found, return false.
// INPUTS: int left index, int right index, tree
function evaluateIfSwapNeeded(tree, leftRoot, rightRoot, left=leftRoot, right=rightRoot)
{
	// Compare left and right
	if (tree.Get(right).content > tree.Get(left).content)
		return true;
	else if (tree.Get(left).content > tree.Get(right).content)
		return false;
	// If same, find next node in DFS of left and right
	let nextLeftIndex = findNextInDFS(tree, leftRoot, left);
	let nextRightIndex = findNextInDFS(tree, rightRoot, right);

	// If either = -1, then that graph had been fully traversed. Both graphs are the same, return false
	if (nextLeftIndex == -1 || nextRightIndex == -1)
		return false;

	// Else, recurse
	return evaluateIfSwapNeeded(tree, leftRoot, rightRoot, nextLeftIndex, nextRightIndex);
}

// Finds the index of the next node that should be observed in a DFS of binary tree
// INPUTS: binary tree, int index of root node, int index of the current node being considered
// RETURNS: int index of next node to be considered
function findNextInDFS(bTree, root, currentNodeIndex)
{
	// Find current node
	let currentNode = bTree.Get(currentNodeIndex);
	// If has left child, return its index
	if (currentNode.leftNode != -1)
		return currentNode.leftNode;
	// If not, while current node is not root,
	while (currentNodeIndex != root)
	{
		// Set current node to parent
		let previousNodeIndex = currentNodeIndex;
		currentNodeIndex = currentNode.parent;
		currentNode = bTree.Get(currentNodeIndex);

		// If parent has right node, return it
		if (currentNode.rightNode != -1 && currentNode.rightNode != previousNodeIndex)
			return currentNode.rightNode;
	}
	// If this path is reached, DFS has ended. Return -1
	return -1;
}

// Converts tree into a string which can be interpreted by MathJax
// INPUTS: tree Expression bTree
// RETURNS: str that can be interpreted by MathJax
function treeToMathJax(tree, currentNodeIndex=0)
{
	let currentNode = tree.Get(currentNodeIndex);
	let output = "";
	switch (currentNode.type)
	{
		case NodeType.OPERATOR:
		{
			// If children of operator are another operator, use ()s
			let rightNodeIndex = currentNode.rightNode;
			let rightNode = tree.Get(rightNodeIndex);
			let leftNodeIndex = currentNode.leftNode;
			let leftNode = tree.Get(leftNodeIndex);

			if (rightNode.type == NodeType.OPERATOR)
			{
				// If division, use {}s instead of ()s
				switch (rightNode.content)
				{
					case Operator.ADDITION:
						output += `(${treeToMathJax(tree, rightNodeIndex)})`;
						break;
					case Operator.DIVISION:
						output += `{${treeToMathJax(tree, rightNodeIndex)}}`;
						break;
					default:
						output += `${treeToMathJax(tree, rightNodeIndex)}`;
						break;
				}
			}
			else
				output += treeToMathJax(tree, rightNodeIndex);

			switch (currentNode.content)
			{
				case Operator.DIVISION:
					output += " \\over ";
					break;
				case Operator.MULTIPLICATION:
					// Implied * sign
					// Due to mutiplication representing a -ive number (e.g: -4 -> -1 * 4)
					if (rightNode.type == NodeType.NUMBER && rightNode.content == "-1")
						break;
					if (rightNode.type == NodeType.NUMBER ||
						(rightNode.type == NodeType.OPERATOR &&
							(rightNode.content == Operator.ADDITION || rightNode.content == Operator.DIVISION || rightNode.content == Operator.MULTIPLICATION)
						)
					)
					{
						if (leftNode.type == NodeType.CONSTANT || leftNode.type == NodeType.VARIABLE || leftNode.type == NodeType.FUNCTION ||
							(leftNode.type == NodeType.OPERATOR &&
								(leftNode.content == Operator.ADDITION)
							)
						)
						{
							break;
						}
					}
					if (rightNode.type == NodeType.VARIABLE)
					{
						if (leftNode.type == NodeType.FUNCTION || (leftNode.type == NodeType.OPERATOR && leftNode.content == Operator.ADDITION))
							break;
					}
					if (rightNode.type == NodeType.FUNCTION)
					{
						if (leftNode.type == NodeType.FUNCTION)
							break;
					}
					output += Operator.MULTIPLICATION;
					break;
				case Operator.ADDITION:
					// If addition is actually representing a subtraction, ignore + sign (e.g: 1-2 -> 1+(-1*2))
					if (leftNode.type == NodeType.OPERATOR && leftNode.content == Operator.MULTIPLICATION)
					{
						if (tree.Get(leftNode.rightNode).type == NodeType.NUMBER && tree.Get(leftNode.rightNode).content == '-1')
							break;
					}
					else
					{
						output += '+';
						break;
					}
				default:
					output += currentNode.content;
					break;
			}

			if (leftNode.type == NodeType.OPERATOR)
			{
				// If division, use {}s instead of ()s
				switch (leftNode.content)
				{
					case Operator.ADDITION:
						output += `(${treeToMathJax(tree, leftNodeIndex)})`;
						break;
					case Operator.DIVISION:
						output += `{${treeToMathJax(tree, leftNodeIndex)}}`;
						break;
					default:
						output += `${treeToMathJax(tree, leftNodeIndex)}`;
						break;
				}
			}
			else
				output += treeToMathJax(tree, leftNodeIndex);

			break;
		}
		case NodeType.FUNCTION:
			output += `\\${currentNode.content}`;
			let leftNodeIndex = currentNode.leftNode;
			let leftNode = tree.Get(leftNodeIndex);
			if (leftNode.type == NodeType.OPERATOR)
			{
				// If division, use {}s instead of ()s
				switch (leftNode.content)
				{
					case Operator.DIVISION:
						output += `{${treeToMathJax(tree, leftNodeIndex)}}`;
						break;
					default:
						output += `(${treeToMathJax(tree, leftNodeIndex)})`;
						break;
				}
			}
			else
				output += `({${treeToMathJax(tree, leftNodeIndex)}})`;

			break;
		case NodeType.NUMBER:
			if (currentNode.content == "-1")
			{
				output += '-';
				break;
			}
		default:
			output += currentNode.content;
			break;
	}
	return output;
}

function strToTree(str)
{
	let comp = expressionToComponentList(str);
	let pf = componentListToPostfix(comp);
	let tree = postfixToTree(pf);
	return tree;
}

function cleanExpression(expression)
{
	let cleanExpression = expression;
	// Remove all line breaks
	cleanExpression = cleanExpression.replaceAll('\n', '');
	// Remove all whitespace
	cleanExpression = cleanExpression.replaceAll(' ', '');
	return cleanExpression;
}
