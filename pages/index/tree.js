class Operator {
	static #_ADDITION = '+';
	static get ADDITION() { return this.#_ADDITION; }
	static #_SUBTRACTION = '-';
	static get SUBTRACTION() { return this.#_SUBTRACTION; }
	static #_MULTIPLICATION = '*';
	static get MULTIPLICATION() { return this.#_MULTIPLICATION; }
	static #_DIVISION = '/';
	static get DIVISION() { return this.#_DIVISION; }
	static #_EXPONENTIATION = '^';
	static get EXPONENTIATION() { return this.#_EXPONENTIATION; }
}

class NodeType {
	static #_NUMBER = "NUMBER";
	static get NUMBER() { return this.#_NUMBER; }
	static #_CONSTANT = "CONSTANT";
	static get CONSTANT() { return this.#_CONSTANT; }
	static #_VARIABLE = "VARIABLE";
	static get VARIABLE() { return this.#_VARIABLE; }
	static #_OPERATOR = "OPERATOR";
	static get OPERATOR() { return this.#_OPERATOR; }
	static #_FUNCTION = "FUNCTION";
	static get FUNCTION() { return this.#_FUNCTION; }
	static #_OPEN_BRACKET = "OPEN BRACKET";
	static get OPEN_BRACKET() { return this.#_OPEN_BRACKET; }
	static #_CLOSE_BRACKET = "CLOSE BRACKET";
	static get CLOSE_BRACKET() { return this.#_CLOSE_BRACKET; }
}

class Node {
	constructor(type, content, leftNode=-1, rightNode=-1, parent=-1) {
		this.type = type;
		this.content = content;
		this.leftNode = leftNode;
		this.rightNode = rightNode;
		this.parent = parent;
	}

	#_type;
	get type() {
		return this.#_type;
	}
	set type(type) {
		switch (type) {
			case "number":
				this.#_type = NodeType.NUMBER;
				break;
			case "constant":
				this.#_type = NodeType.CONSTANT;
				break;
			case "variable":
				this.#_type = NodeType.VARIABLE;
				break;
			case "operator":
				this.#_type = NodeType.OPERATOR;
				break;
			case "function":
				this.#_type = NodeType.FUNCTION;
				break;
			case "open bracket":
				this.#_type = NodeType.OPEN_BRACKET;
				break;
			case "close bracket":
				this.#_type = NodeType.CLOSE_BRACKET;
				break;
			default: // Invalid type!
				throw `Invalid type! Got ${type}, which is not in the type list.`;
		}
	}

	#_content;
	get content() {
		return this.#_content;
	}
	set content(content) {
		// TODO: Add some input validation here
		switch (this.type) {
			case NodeType.NUMBER:
				this.#_content = content;
				break;
			case NodeType.CONSTANT:
				this.#_content = content;
				break;
			case NodeType.VARIABLE:
				this.#_content = content;
				break;
			case NodeType.OPERATOR:
				switch (content) {
					case '+':
						this.#_content = Operator.ADDITION;
						break;
					case '-':
						this.#_content = Operator.SUBTRACTION;
						break;
					case '*':
						this.#_content = Operator.MULTIPLICATION;
						break;
					case '/':
						this.#_content = Operator.DIVISION;
						break;
					case '^':
						this.#_content = Operator.EXPONENTIATION;
						break;
					default:
						throw `Attempted to create Operator node with non-operator content. Given: ${content}`;
						break;
				}
			case NodeType.FUNCTION:
				this.#_content = content;
				break;
			case NodeType.OPEN_BRACKET:
				this.#_content = content;
				break;
			case NodeType.CLOSE_BRACKET:
				this.#_content = content;
				break;
		}
	}

	get precedence() {
		if (this.type != NodeType.OPERATOR && this.type != NodeType.FUNCTION) {
			throw "Attempted to access precedence of non-operator or function.";
		}
		if (this.type == NodeType.FUNCTION) {
			return 0.5; // TODO: Maybe we change this so they're all ints?
		}
		switch (this.content) {
			case Operator.ADDITION:
			case Operator.SUBTRACTION:
				return 0;
			case Operator.MULTIPLICATION:
			case Operator.DIVISION:
				return 1;
			case Operator.EXPONENTIATION:
				return 2;
			default:
				throw `Node of operator type has content ${this.content}, which should not be possible.`;
		}
	}

	get commutative() {
		if (this.type != NodeType.OPERATOR) {
			throw "Attempted to query commutativity of non-operator.";
		}
		switch (this.content) {
			case Operator.ADDITION:
			case Operator.MULTIPLICATION:
				return true;
			default:
				return false;
		}
	}
}
