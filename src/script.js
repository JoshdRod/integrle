let answerBox = document.getElementById("answerBox");
			
    let response1 = document.getElementById("response1");
    let response2 = document.getElementById("response2");
    let response3 = document.getElementById("response3");
    let response4 =
    document.getElementById("response4");
    
			answerBox.addEventListener("keydown", handleAnswerInputChange);
			
			let responseCount = 0;

			function handleAnswerInputChange() {
       if (event.key == "Enter")	{
       /* TODO
           checkValidInputExpression();
           evaluateInputExpression(answerBox.value);
      */
           
           switch (responseCount){
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
			
// Cuts expression into a terms:coeffs dictionary	
// INPUT: str some valid maths expression
// RETURNS: (dict) of terms:coeff values
// e.g: x ^ 2 + 3 sin(4x) - 2 sin(x)cos(x) - x
// -> {x^2 : 1, sin(4x) : 3, sin(x)cos(x) : -2, x : -1}
function expressionToDict(expresssion) {
    rawExpresssion = expression.replaceAll(" ", "");
    
    // Strip all terms from raw expression and add to dict
    return "";
}