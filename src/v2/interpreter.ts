import {
  AttributeExpr,
  ElementNodeExpr,
  ExpVisitorInterface,
  ForNodeExpr,
  IfNodeExpr,
  TextNodeExpr,
  VariableExpr,
} from './parserExpression.ts';

export class Interpreter implements ExpVisitorInterface<Node> {
  constructor() {}

  visitTextNode(textNode: TextNodeExpr): Element {
    const mock = document.createElement('div');
    mock.innerHTML = `${textNode.value}`;
    return mock;
  }

  visitElementNode(elementNode: ElementNodeExpr): Element {
    const mock = document.createElement(elementNode.tagName);
    mock.innerHTML = `mock`;
    return mock;
  }

  visitAttribute(attribute: AttributeExpr): Element {
    const mock = document.createElement('div');
    mock.innerHTML = `${attribute.name}="${attribute.value}"`;
    return mock;
  }

  visitForNode(forNode: ForNodeExpr): Element {
    const mock = document.createElement('div');
    mock.innerHTML = `${forNode.iterVariable} in ${forNode.collectionVariable} -> ${forNode.bodyTemplate}`;
    return mock;
  }

  visitIfNode(ifNode: IfNodeExpr): Element {
    const mock = document.createElement('div');
    mock.innerHTML = `if ${ifNode.matchVariable} then ${ifNode.ifBranchTemplate} else ${ifNode.elseBranchTemplate}`;
    return mock;
  }

  visitVariable(variable: VariableExpr): Element {
    const mock = document.createElement('div');
    mock.innerHTML = `var name is ${variable.name}`;
    return mock;
  }
}
