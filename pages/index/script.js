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

function handleAnswerInputChange()
{
	// Re-generate input text box
	let response = answerBox.value;
	if (event.key != "Enter" && event.key != "Space")
		response += event.key;

	let expressionTree = strToTree(response);
	let responseMathJax = `\\(${treeToMathJax(expressionTree)}\\)`;
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
	let precedence = "";
	let commutative = true;
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
					(list[list.length - 1].type == "open bracket"
					|| list[list.length - 1].type == "function"))
			)
			{
				list.push({
					content: "+",
					type: "operator",
					precedence: 0,
					commutative: true,
					leftNode: -1,
					rightNode: -1,
					parent: -1,
					depth: -1
				});

			}
			content = "-1";
			type = "number";

			i++;
		}

		// If number, find end of num and add whole num
		else if (!isNaN(exp[i]))
		{
			let found = false;
			for (let j = i; j < exp.length; j++)
			{
				if (isNaN(exp[j]))
				{
					content = exp.slice(i, j);
					type = "number";

					i = j;
					found = true;
					break;
				}
			}
			if (found == false) // If can't find any non-nums, then number extends to end of string
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
			precedence = {'+': 0, '-': 0, '/': 1, '*': 1, '^': 2}[exp[i]];
			commutative = {'+': true, '-': false, '/': false, '*': true, '^': false}[exp[i]];
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
			let found = false;
			// Go until x, constant, or non-letter found
			for (let j = i; j < exp.length; j++)
			{
				if (exp[j] == 'x' || exp[j].toUpperCase() == exp[j].toLowerCase())
				{
					content = exp.slice(i, j);

					i = j;
					found = true;
					break;
				}
			}
			// If for loop finishes, then function name extends to end of string
			if (found == false)
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
				precedence = 0.5;
			}
		}

		// Add new component
		let newComponent = {
			content: content,
			type: type,
			leftNode: -1,
			rightNode: -1,
			parent: -1,
			depth: -1
		};

		if (type == "operator" || type == "function") {
			newComponent.precedence = precedence;
			if (type == "operator") {
				newComponent.commutative = commutative;
			}
		}
		list.push(newComponent);

		// Check for implicit * signs
		// If previous component is: Number, Variable, or Close Bracket
		// And current component is: Open Bracket, Number, Variable, or Function
		// We need a * sign between the two
		// e.g 5sin(x) -> 5 * sin ( x )
		// e.g 10x -> 10 * x
		// e.g (10 + x)(3 + x) -> ( 10 + x ) * ( 3 + x )
		if (
			list.length >= 2
			&& ["close bracket", "number", "variable"].includes(list[list.length - 2].type)
			&& ["open bracket", "number", "variable", "function"].includes(list[list.length - 1].type)
		)
		{
			list.splice(-1, 0, {
				content: '*',
				type: "operator",
				precedence: 1,
				leftNode: -1,
				rightNode: -1,
				parent: -1,
				depth: -1,
				commutative: true
			});
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
		if (["number", "constant", "variable"].includes(component.type))
		{
			postfixList.push(component);
		}
		// If (, recurse and add to string
		else if (component.type == "open bracket")
		{
			let bracketEval = componentListToPostfix(list.slice(index+1));
			index += bracketEval.index + 1; // +1, as list indices start from 0
			postfixList.push(...bracketEval.postfixList);
		}
		// If ), return
		else if (component.type == "close bracket")
		{
			postfixList.push(...operatorStack.reverse());
			return {
				postfixList: postfixList,
				index: index
			};
		}
		// If operator or function, look at stack
		else if (component.type == "operator" || component.type == "function")
		{
			// If function, push
			// Functions never cause an operator to be popped. e.g: in 1 * 2 + 3, the + causes the * to be popped.
			// In 1 * sin(3), the sin doesn't cause the * to be popped.
			if (component.type == "function")
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
		case "function":
		case "operator": {
			let componentIndex = index;

			currentComponent.leftNode = index+1;
			index = postfixToTree(components, index+1, componentIndex, depth+1);

			if (currentComponent.type == "operator")
			{
				currentComponent.rightNode = index+1;
				index = postfixToTree(components, index+1, componentIndex, depth+1);
			}
			break;
		}
		case "number":
		case "constant":
			break;
	}

	if (depth > 0)
		return index;
	else
		return components;
}

// As there are multiple ways to write the same maths expression, there are multiple graphs that map to equivalent expressions. To compare equality of 2 graphs, they must first both be normalised (essentially, sorting elements under commutative operators by their content)
// INPUTS: list tree
// RETURNS: list normalised tree
function normaliseTree(tree)
{
	// Create a dictionary of depth:node indices
	let layers = {};
	let maxLayer = 0;
	for (let i = 0; i < tree.length; i++)
	{
		// If layer isn't in dict yet, add it
		if (layers[tree[i].depth.toString()] == null)
			layers[tree[i].depth.toString()] = [];
		// Add node to layer
		layers[tree[i].depth.toString()].push(i);
		maxLayer = (tree[i].depth > maxLayer) ? tree[i].depth : maxLayer;
	}
	// For each layer,
	for (let i = maxLayer; i > 0; i--)
	{
		// Go up one layer - find commutative nodes with 2 kids
		for (let parentIndex of layers[i-1])
		{
			let parentNode = tree[parentIndex];
			if (parentNode.type == "operator" && parentNode.commutative == true)
			{
				// If so, compare contents. If R < L, swap parent's child pointers around
				let requiresSwap = evaluateIfSwapNeeded(tree, parentNode.leftNode, parentNode.rightNode);
				if (requiresSwap)
				{
					let temp = parentNode.rightNode;
					parentNode.rightNode = parentNode.leftNode;
					parentNode.leftNode = temp;
				}
			}
		}
	}
	return tree;
	// FIXME: NEEDS TO ALSO CONVERT -1*<x> under + nodes to -
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
		if (b1[b1CurrentNode].content != b2[b2CurrentNode].content)
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
		if (exp1[exp1CurrentNode].content == exp2[exp2CurrentNode].content)
			identicalNodesCount++;

		exp1CurrentNode = findNextInDFS(exp1, 0, exp1CurrentNode);
		exp2CurrentNode = findNextInDFS(exp2, 0, exp2CurrentNode);
	}

	return (1 - Math.exp(-1 * (identicalNodesCount / (exp2.length + difference)))) * 100;
}

// Compares 2 (sub)graphs, to determine if the right graph is "greater" than the left.
// If so, the root nodes of both graphs need swapping in their supergraph.
// Essentially performs a DFS simultaneously on both graphs, until the contents of the nodes being visited is different.
// In this case, compare the two. If right graph > left, return true. Else, return false.
// If no differences found, return false.
// INPUTS: int left index, int right index, (super)graph
function evaluateIfSwapNeeded(graph, leftRoot, rightRoot, left=leftRoot, right=rightRoot)
{
	// Compare left and right
	if (graph[right].content > graph[left].content)
		return true;
	else if (graph[left].content > graph[right].content)
		return false;
	// If same, find next node in DFS of left and right
	let nextLeftIndex = findNextInDFS(graph, leftRoot, left);
	let nextRightIndex = findNextInDFS(graph, rightRoot, right);

	// If either = -1, then that graph had been fully traversed. Both graphs are the same, return false
	if (nextLeftIndex == -1 || nextRightIndex == -1)
		return false;

	// Else, recurse
	return evaluateIfSwapNeeded(graph, leftRoot, rightRoot, nextLeftIndex, nextRightIndex);
}

// Finds the index of the next node that should be observed in a DFS of binary tree
// INPUTS: binary tree, int index of root node, int index of the current node being considered
// RETURNS: int index of next node to be considered
function findNextInDFS(bTree, root, currentNodeIndex)
{
	// Find current node
	let currentNode = bTree[currentNodeIndex];
	// If has left child, return its index
	if (currentNode.leftNode != -1)
		return currentNode.leftNode;
	// If not, while current node is not root,
	while (currentNodeIndex != root)
	{
		// Set current node to parent
		let previousNodeIndex = currentNodeIndex;
		currentNodeIndex = currentNode.parent;
		currentNode = bTree[currentNodeIndex];

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
	let currentNode = tree[currentNodeIndex];
	let output = "";
	switch (currentNode.type)
	{
		case "operator":
		{
			// If children of operator are another operator, use ()s
			let rightNodeIndex = currentNode.rightNode;
			let rightNode = tree[rightNodeIndex];
			if (rightNode.type == "operator")
			{
				// If division, use {}s instead of ()s
				switch (rightNode.content)
				{
					case '/':
						output += `{${treeToMathJax(tree, rightNodeIndex)}}`;
						break;
					default:
						output += `(${treeToMathJax(tree, rightNodeIndex)})`;
						break;
				}
			}
			else
				output += treeToMathJax(tree, rightNodeIndex);

			switch (currentNode.content)
			{
				case '/':
					output += " \\over ";
					break;
				case '*':
					break;
				default:
					output += currentNode.content;
					break;
			}

			let leftNodeIndex = currentNode.leftNode;
			let leftNode = tree[leftNodeIndex];
			if (leftNode.type == "operator")
			{
				// If division, use {}s instead of ()s
				switch (leftNode.content)
				{
					case '/':
						output += `{${treeToMathJax(tree, leftNodeIndex)}}`;
						break;
					default:
						output += `(${treeToMathJax(tree, leftNodeIndex)})`;
						break;
				}
			}
			else
				output += treeToMathJax(tree, leftNodeIndex);

			break;
		}
		case "function":
			output += `\\${currentNode.content}`;
			let leftNodeIndex = currentNode.leftNode;
			let leftNode = tree[leftNodeIndex];
			if (leftNode.type == "operator")
				output += `(${treeToMathJax(tree, leftNodeIndex)})`;
			else
				output += `{${treeToMathJax(tree, leftNodeIndex)}}`;

			break;
		case "number":
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
	let exp = expression;
	// Remove all line breaks
	exp = exp.replaceAll('\n', '');
	// Remove all whitespace
	exp = exp.replaceAll(' ', '');
	return exp;
}
