// TODO: Eventually, put this in a separate file
let RAW_SOLUTION = "1/2 x^2 sin(2x) + 1/2 x cos(2x) - 1/4 sin(2x) + c";
let SOLUTION = expressionToDict(RAW_SOLUTION);
let answerText = document.getElementById("answerText"); // Answer that appears on win modal
answerText.innerText = `\\(${RAW_SOLUTION}\\)`;

let answerBox = document.getElementById("answerBox");

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

function handleAnswerInputChange()
{
	if (event.key == "Enter")
	{
		let expressionDict = expressionToDict(answerBox.value);
		let expressionEvaluation = evaluateExpression(expressionDict);

		// Update win modal
		let answerCorrectness = evaluateCorrectness(expressionDict, SOLUTION);
		let answerCorrectnessColour = {
			"red": 255 * (100 - answerCorrectness) / 100,
			"green": 255 * (answerCorrectness) / 100,
			"blue": 0
		};

		let responseBox;
		switch (responseCount)
		{
			case 0:
				response1.innerHTML = expressionEvaluation;
				colourBox1.innerText = answerCorrectness + '%';
				colourBox1.style.backgroundColor = `rgb(${answerCorrectnessColour["red"]}, ${answerCorrectnessColour["green"]}, ${answerCorrectnessColour["blue"]})`;
				responseBox = response1;
				break;
			case 1:
				response2.innerHTML = expressionEvaluation;
				colourBox2.innerText = answerCorrectness + '%';
				colourBox2.style.backgroundColor = `rgb(${answerCorrectnessColour["red"]}, ${answerCorrectnessColour["green"]}, ${answerCorrectnessColour["blue"]})`;
				responseBox = response2;
				break;
			case 2:
				response3.innerHTML = expressionEvaluation;
				colourBox3.innerText = answerCorrectness + '%';
				colourBox3.style.backgroundColor = `rgb(${answerCorrectnessColour["red"]}, ${answerCorrectnessColour["green"]}, ${answerCorrectnessColour["blue"]})`;
				responseBox = response3;
				break;
			case 3:
				response4.innerHTML = expressionEvaluation;
				colourBox4.innerText = answerCorrectness + '%';
				colourBox4.style.backgroundColor = `rgb(${answerCorrectnessColour["red"]}, ${answerCorrectnessColour["green"]}, ${answerCorrectnessColour["blue"]})`;
				responseBox = response4;
				break;
		}
		responseCount++;
		// Render new mathjax
		MathJax.typeset([responseBox]);

		// Handle win (show pop-up)
		if (checkWin(expressionDict))
		{
			winModal.style.display = "flex";
		}
	}
}

function handleCloseModal()
{
	winModal.style.display = "none";
}
// TODO: Checks if input expression is a valid maths expression in the first place
function checkValidInputExpression()
{
	return;
}

// Takes in dict of expression, and constructs an evaluation of each term in that expression
// INPUTS: dict expressionDict
// RETURNS: str html of answer evaluation (to go in a response block)
// 		Each term in expression is coloured:
// 			- Red: Term doesn't exist in answer
// 			- Yellow: Term does exist, but coefficient is incorrect
// 			- Green: Term and coefficient correct
// 		A number is also appended on end, which corresponds to number of missing terms in expression
function evaluateExpression(expressionDict)
{
}

// Ranks term as red, yellow or green
//	- Red: Term doesn't exist in answer
//	- Yellow: Term does exist, but coefficient is incorrect
//	- Green: Term and coefficient correct
// INPUTS: str term, int coeff, dict solution
// RETURNS: str red/yellow/green
function evaluateTerm(term, coeff, solution)
{
}

// Calculates number of terms in solution that are missing from expression
// INPUTS: dict expressionDict, dict solutionDict
// RETURNS: int number of missing terms
function calculateMissingTerms(expressionDict, solutionDict)
{
}

// Evaluates, as a %, how correct the input expression was.
// Used for the boxes on the win modal
// INPUTS: dict expressionDict, dict solutionDict
// RETURNS: int % correctness of expression
function evaluateCorrectness(expressionDict, solutionDict)
{
}

// Expression to component list
function expressionToComponentList(expression)
{
	let Constants = ['e', "pi"];
	let exp = cleanExpression(expression);
	let list = [];
	let content = "";
	let type = "";
	let precedence = "";
	let commutative = true;
	let i = 0;
	while (i < exp.length)
	{
		// If a negative number that at the start, or after an open bracket/ function definition, add the implicit -1*
		// e.g: -5x -> -1 * 5 x
		// e.g: 10*(-x) -> 10 * ( -1 * x )
		// e.g: sin -x -> sin -1 * x
		if (
			(
				list.length == 0
				|| list.length > 0 && 
				(
					list[list.length - 1].type == "open bracket"
					|| list[list.length - 1].type == "function"
				)
			)
			&& exp[i] == '-'
		)
		{
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
			rightNode: -1
		};

		if (type == "operator" || type == "function")
			newComponent.precedence = precedence;
			if (type == "operator")
				newComponent.commutative = commutative;

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
	let infixList = [];
	let operatorStack = [];
	let index = 0;
	// Iterate over components
	while(index < list.length)
	{
		let component = list[index];
		// If number, constant, or variable, put in output
		if (["number", "constant", "variable"].includes(component.type))
		{
			infixList.push(component);
		}
		// If (, recurse and add to string
		else if (component.type == "open bracket")
		{
			let bracketEval = componentListToPostfix(list.slice(index+1));
			index += bracketEval.index + 1; // +1, as list indices start from 0
			infixList.push(...bracketEval.infixList);
		}
		// If ), return
		else if (component.type == "close bracket")
		{
			infixList.push(...operatorStack.reverse());
			return {
				infixList: infixList,
				index: index
			};
		}
		// If operator or function, look at stack
		else if (component.type == "operator" || component.type == "function")
		{
			// If higher precedence than top of stack, push
			if (operatorStack.length == 0 || component.precedence > operatorStack[operatorStack.length - 1].precedence)
			{
				operatorStack.push(component);
			}
			// If same/lower precedence, pop all higher precedence operators + push
			else
			{
				while (operatorStack.length > 0 && component.precedence <= operatorStack[operatorStack.length - 1].precedence)
				{
					infixList.push(operatorStack.pop());
				}
				operatorStack.push(component);
			}
		}
		index++;
	}
	// At end, unload operator stack
	infixList.push(...operatorStack.reverse());
	return infixList;
}

// Takes a list of components in postfix, and converts into tree
// INPUTS: list of componets in the tree
// RETURNS: list Tree
function postfixToTree(components, index, depth)
{
	// Ironically, this works better with prefix, so convert
	if (depth == 0)
		components = components.reverse();
	let currentComponent = components[index];

	switch(currentComponent.type)
	{
		case "function":
		case "operator": {
			currentComponent.leftNode = index+1;
			index = postfixToTree(components, index+1, depth+1);

			if (currentComponent.type == "operator")
			{
				currentComponent.rightNode = index+1;
				index = postfixToTree(components, index+1, depth+1);
			}
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

function strToTree(str)
{
	comp = expressionToComponentList(str);
	let pf = componentListToPostfix(comp);
	for (component of pf)
	{
		console.log(component.content, " ");
	}
	let tree = postfixToTree(pf.reverse());
	console.log("Tree: ", tree);
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


