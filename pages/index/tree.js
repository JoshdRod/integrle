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
				throw new Errror(`Invalid type! Got ${type}, which is not in the type list.`);
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
				}
				break;
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
			throw new Error("Attempted to access precedence of non-operator or function.");
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
				throw new Error(`Node of operator type has content ${this.content}, which should not be possible.`);
		}
	}

	get commutative() {
		if (this.type != NodeType.OPERATOR) {
			throw new Error("Attempted to query commutativity of non-operator.");
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

class Tree {
	constructor (body=[], root=0) {
		this.body = body;
		this.root = root;
	}

	//
	/* -- DATA  -- */
	//

	// body = The list of Node objects that form the tree
	#_body = [];
	get body() {
		return this.#_body;
	}
	set body(content) {
		// If content is an array of Node objects, then allow the set
		// Array test
		if (!Array.isArray(content)) {
			throw `Tried to set body of tree to non-array: ${content}`;
		}

		// Node objects test
		for (const element of content) {
			if (!(element instanceof Node)) {
				throw `Tried to set body of tree to array contaning non-node elements: ${content}`;
			}
		}

		this.#_body = content;
		return;
	}

	// root = A pointer to the root node of the tree
	#_root;
	get root() {
		return this.#_root;
	}
	set root(value) {
		if (!Number.isInteger(value)) {
			throw `Tried to set root node pointer to non-integer value: ${value}`;
		}
		if (value > this.body.length - 1) {
			throw `Tried to set root node pointer to value out of range: ${value}`;
		}

		this.#_root = value;
		return;
	}

	//
	/* -- FUNCTIONALITY -- */
	//

	// Add a node to the graph, below its parent. The default behaviour is to place the node to the left of the parent, if possible.
	// INUPTS: Node to add, parent node to add under
	// RETURNS: none.
	Add(node, parent) {
		if (parent.leftNode == -1) {
			parent.leftNode = this.body.length;
		}
		else if (parent.rightNode == -1) {
			parent.rightNode = this.body.length;
		}
		else {
			throw `Attempted to add node to binary tree as child to node with two children: \n\n${node} \n\nto \n\n${parent}`;
		}
		node.parent = this.body.indexOf(parent);
		this.#_body.push(node);
		return;
	}

	// Remove a specified node from the graph.
	// INPUTS: Node to remove
	// RETURNS: none.
	Remove(node) {
		let nodeIndex = this.body.indexOf(node);

		// Do not allow removal of non-leaf nodes (else tree splits into three!)
		if (node.leftNode != -1 || node.rightNode != -1) {
			throw `Tried to remove non-leaf node from tree! Node ${node} \n from tree ${this.body}`;
		}
		// Find parent node
		// Remove node from parent node's children
		let parentNode = this.body[node.parent];
		if (parentNode.leftNode == nodeIndex) {
			parentNode.leftNode = -1;
		}
		else if (parentNode.rightNode == nodeIndex) {
			parentNode.rightNode = -1;
		}
		else {
			throw `Attempted to remove node that has no reference in its parent:\nNode (index ${nodeIndex}): ${node}\nParent: ${parentNode}`;
		}

		// Subtract 1 from all parent/child pointers > node's position in body
		for (const treeNode of this.body) {
			if (treeNode.leftNode > nodeIndex) {
				treeNode.leftNode -= 1;
			}
			if (treeNode.rightNode > nodeIndex) {
				treeNode.rightNode -= 1;
			}
			if (treeNode.parent > nodeIndex) {
				treeNode.parent -= 1;;
			}
		}

		// Delete node from body
		this.body.splice(nodeIndex, 1);
	}
}
