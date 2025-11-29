// TODO: Eventually, put this in a separate file
let RAW_SOLUTION = "1/3 x^3 + 3/2 x^2 - 2x + c";
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
		switch (responseCount)
		{
			case 0:
				response1.innerHTML = expressionEvaluation;
				colourBox1.innerText = answerCorrectness + '%';
				colourBox1.style.backgroundColor = `rgb(${answerCorrectnessColour["red"]}, ${answerCorrectnessColour["green"]}, ${answerCorrectnessColour["blue"]})`;
				break;
			case 1:
				response2.innerHTML = expressionEvaluation;
				colourBox2.innerText = answerCorrectness + '%';
				colourBox2.style.backgroundColor = `rgb(${answerCorrectnessColour["red"]}, ${answerCorrectnessColour["green"]}, ${answerCorrectnessColour["blue"]})`;
				break;
			case 2:
				response3.innerHTML = expressionEvaluation;
				colourBox3.innerText = answerCorrectness + '%';
				colourBox3.style.backgroundColor = `rgb(${answerCorrectnessColour["red"]}, ${answerCorrectnessColour["green"]}, ${answerCorrectnessColour["blue"]})`;
				break;
			case 3:
				response4.innerHTML = expressionEvaluation;
				colourBox4.innerText = answerCorrectness + '%';
				colourBox4.style.backgroundColor = `rgb(${answerCorrectnessColour["red"]}, ${answerCorrectnessColour["green"]}, ${answerCorrectnessColour["blue"]})`;
				break;
		}
		responseCount++;
		// Render new mathjax
		MathJax.typeset();

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
	let expressionEvaluation = `<div style="margin-left: auto">`;
	// For expression in dict
	let terms = Object.keys(expressionDict);
	for (const term of terms)
	{
		let coeff = expressionDict[term];
		// Compare to solution, and give correct colour
		let colour = evaluateTerm(term, coeff, SOLUTION);
		// Format coefficient correctly for display (e.g {'x', -1} -> -x, {'x', 5} -> 5x if first term, +5x if not)
		let displayCoeff = '';
		if (coeff[0] == '-')
		{
			displayCoeff = (coeff == '-1') ? '-' : coeff;
		}
		else if (term == terms[0])
		{
			displayCoeff = (coeff == '1') ? '' : coeff;
		}
		else
		{
			displayCoeff = (coeff == '1') ? '+' : `+${coeff}`;
		}
		// Append to evaluation a <p> block with correct colour
		expressionEvaluation += `<span style="background-color: ${colour}">\\(${displayCoeff}${term}\\)</span>`;
	}
	expressionEvaluation += "</div>";
	// Calculate number of terms missing from dict
	let missingTermsCount = calculateMissingTerms(expressionDict, SOLUTION);
	// Append <p> block with number of terms missing
	expressionEvaluation += `<div style="margin-left: auto"><span>  || ${missingTermsCount}  ||</span></div>`;
	// Convert into trusted string (prevent xss attacks)
	let sanitisedExpressionEvaluation = policy.createHTML(expressionEvaluation);
	return sanitisedExpressionEvaluation;
}

// Ranks term as red, yellow or green
//	- Red: Term doesn't exist in answer
//	- Yellow: Term does exist, but coefficient is incorrect
//	- Green: Term and coefficient correct
// INPUTS: str term, int coeff, dict solution
// RETURNS: str red/yellow/green
function evaluateTerm(term, coeff, solution)
{
	// If solution doesn't contain term, red
	if (!solution.hasOwnProperty(term))
		return "red";
	// If solution's coeff != coeff, yellow
	if (solution[term] != coeff)
		return "yellow";
	// Else, green
	return "green";
}

// Calculates number of terms in solution that are missing from expression
// INPUTS: dict expressionDict, dict solutionDict
// RETURNS: int number of missing terms
function calculateMissingTerms(expressionDict, solutionDict)
{
	let missingCount = 0;
	// Iterate over keys in solutionDict
	let terms = Object.keys(solutionDict);
	for (const term of terms)
	{
		// If not in expressionDict, +1 to missingCount
		if (!expressionDict.hasOwnProperty(term))
			missingCount++;
	}
	return missingCount;
}

// Evaluates, as a %, how correct the input expression was.
// Used for the boxes on the win modal
// INPUTS: dict expressionDict, dict solutionDict
// RETURNS: int % correctness of expression
function evaluateCorrectness(expressionDict, solutionDict)
{
	let correctness = 0;
	let terms = Object.keys(solutionDict);
	// Amount correctness goes up by for each correct term / coeff
	let increment = 100 / (2 * terms.length);

	for (const term of terms)
	{
		if (expressionDict.hasOwnProperty(term))
		{
			correctness += increment;
			if (expressionDict[term] == solutionDict[term])
			{
				correctness += increment;
			}
		}
	}
	return Math.round(correctness);
}

// Takes in dict of expression, and compares it to dict of solution. If exactly equal, player has won!
// INPUTS: dict expressionDict
// RETURNS: bool true if won, false if not
function checkWin(expressionDict)
{

	// Check for incorrect terms
	if (!isEqual(Object.keys(expressionDict), Object.keys(SOLUTION)))
	{
		return false;
	}

	// Check for incorrect coeffs
	let terms = Object.keys(expressionDict);
	for (const term of terms)
	{
		if (expressionDict[term] != SOLUTION[term])
		{
			return false;
		}
	}
	return true;
}

// Cuts expression into a terms:coeffs dictionary	
// INPUT: str some valid maths expression
// RETURNS: (dict) of terms:coeff values
// e.g: x ^ 2 + 3 sin(4x) - 2 sin(x)cos(x) - x
// -> {x^2 : 1, sin(4x) : 3, sin(x)cos(x) : -2, x : -1}
function expressionToDict(expression)
{
	let rawExp = expression.replaceAll(" ", "");
	let i = 0;
	let decomposedExpression = {};
	while (i < rawExp.length)
	{
		nextTerm = termToDict(rawExp, i);
		decomposedExpression[nextTerm.term] = nextTerm.coeff;
		i = nextTerm.i;
	}
	return decomposedExpression;
}

// "3x^2" -> [x^2, 3]
function termToDict(str, i)
{
	let startTerm = -1;
	let endTerm = str.length;

	// Deal with first part of expression. If +, skip it. If -, take note and move on one.
	let isNegative = false;
	if (str[i] == '+')
	{
		i++;
	}
	else if (str[i] == '-')
	{
		i++;
		isNegative = true;
	}

	// j = start of term
	for (let j = i; j < str.length; j++)
	{
		if (isNaN(str[j]) && str[j] != '/')
		{
			startTerm = j;
			break;
		}
	}

	let bracketCount = 0;

	// k = end of term
	for (let k = startTerm; k < str.length; k++)
	{
		if (str[k] == '(')
		{
			bracketCount++;
		}
		else if (str[k] == ')')
		{
			bracketCount--; // FIXME: Won't work for brackted terms - e.g (10x + 2x^2)^1/2'            
		}
		if (str[k] == '+' || str[k] == '-')
		{
			if (bracketCount == 0)
			{
				endTerm = k;
				break;
			}
		}
	}
	// Compose coeff
	let coefficient = str.slice(i, startTerm);
	if (coefficient == '')
	{
		coefficient = '1';
	}
	if (isNegative)
	{
		coefficient = '-' + coefficient;
	}
	return {
		coeff: coefficient,
		term: str.slice(startTerm, endTerm),
		i: endTerm
	};
}

// Checks if 2 arrays are equal
function isEqual(a, b)
{
	// Sort both arrays
	a = a.sort();
	b = b.sort();

	// 1. Check same length
	if (a.length != b.length)
	{
		return false;
	}

	// 2. Check same content
	for (let i = 0; i < a.length; i++)
	{
		if (a[i] != b[i])
		{
			return false;
		}
	}

	return true;
}
