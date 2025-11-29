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

let responseCount = 0;

function handleAnswerInputChange() {
	if (event.key == "Enter")
	{
		let color = evaluateInputExpression(answerBox.value);

		switch (responseCount)
		{
		       case 0:
			   response1.innerText = answerBox.value;
			   response1.style.backgroundColor = color;
			   colourBox1.style.backgroundColor = color;
			   break;
		       case 1:
			   response2.innerText = answerBox.value;
			   response2.style.backgroundColor = color;
			   colourBox2.style.backgroundColor = color;
			   break;
		       case 2:
			   response3.innerText = answerBox.value;
			   response3.style.backgroundColor = color;
			   colourBox3.style.backgroundColor = color;
			   break;
		       case 3:
			   response4.innerText = answerBox.value;
			   response4.style.backgroundColor = color;
			   colourBox4.style.backgroundColor = color;
			   break;
		}
		responseCount++;

		// Handle win (show pop-up)
		if (color == "green")
		{
			winModal.style.display = "flex";
		}
	}
}
		
function handleCloseModal() {
	winModal.style.display = "none";
}
// TODO: Checks if input expression is a valid maths expression in the first place
function checkValidInputExpression() {
    return;
} 
	
// Takes in valid maths expression, compares that to the answer, then determines if answer is red, yellow, or green
// INPUTS: str answer (just the contents of thr input box)
// RETURNS: (enum?) colour (red, yellow, green)
function evaluateInputExpression(answer) {

	let expressionDict = expressionToDict(answer);

	// Incorrect terms = red
	if (!isEqual(Object.keys(expressionDict), Object.keys(SOLUTION)))
	{
		return "red";
	}

	// Correct terms, but incorrect coeffs = yellow
	let terms = Object.keys(expressionDict);
	for (const term of terms)
	{
		if (expressionDict[term] != SOLUTION[term])
		{
			return "yellow";
		}
	}
	return "green";
}
			
// Cuts expression into a terms:coeffs dictionary	
// INPUT: str some valid maths expression
// RETURNS: (dict) of terms:coeff values
// e.g: x ^ 2 + 3 sin(4x) - 2 sin(x)cos(x) - x
// -> {x^2 : 1, sin(4x) : 3, sin(x)cos(x) : -2, x : -1}
function expressionToDict(expression) {
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
function termToDict(str, i) {
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
	    coeff : coefficient,
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
