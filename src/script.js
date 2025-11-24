let answerBox = document.getElementById("answerBox");
			
let response1 = document.getElementById("response1");
let response2 = document.getElementById("response2");
let response3 = document.getElementById("response3");
let response4 = document.getElementById("response4");

answerBox.addEventListener("keydown", handleAnswerInputChange);
		
let responseCount = 0;

function handleAnswerInputChange() {
	if (event.key == "Enter")
	{
		/* TODO
		   checkValidInputExpression();
		   evaluateInputExpression(answerBox.value);
		*/
		switch (responseCount)
		{
		       case 0:
			   response1.innerText = answerBox.value;
			   break;
		       case 1:
			   response2.innerText = answerBox.value;
			   break;
		       case 2:
			   response3.innerText = answerBox.value;
			   break;
		       case 3:
			   response4.innerText = answerBox.value;
			   break;
		}
		responseCount++;
	}
}
		
// TODO: Checks if input expression is a valid maths expression in the first place
function checkValidInputExpression() {
    return;
} 
	
// Takes in valid maths expression, compares that to the answer, then determines if answer is red, yellow, or green
// INPUTS: str answer (just the contents of thr input box)
// RETURNS: (enum?) colour (red, yellow, green)
function evaluateInputExpression(answer) {

	let expressionDict = expressionToDict(answer)
	let colour = determineColourFromDict(expressionDict);

	return colour;
}
			
//TODO: Make correctly handle negative terms
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
	    if (isNaN(str[j]))
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
