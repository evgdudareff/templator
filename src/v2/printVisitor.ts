import {
  AttributeExpr,
  ElementNodeExpr,
  ForNodeExpr,
  IfNodeExpr,
  PrintVisitorInterface,
  TextNodeExpr,
  VariableExpr,
} from './parserExpression.ts';

export class PrintVisitor implements PrintVisitorInterface {
  visitTextNode(textNode: TextNodeExpr) {
    console.log(`TextNodeExpr: ${textNode.value}`);
  }

  visitAttribute(attribute: AttributeExpr) {
    console.log(`AttributeExpr: ${attribute.name}=${attribute.value}`);
  }

  visitIfNode(ifNode: IfNodeExpr) {
    console.log(
      `IfNodeExpr: if ${ifNode.matchVariable} then ${ifNode.ifBranchTemplate} else ${ifNode.elseBranchTemplate}`,
    );
  }

  visitForNode(forNode: ForNodeExpr) {
    console.log(
      `ForNodeExpr: for ${forNode.iterVariable} in ${forNode.collectionVariable} -> ${forNode.bodyTemplate}`,
    );
  }

  visitVariable(variable: VariableExpr) {
    console.log(`VariableExpr: ${variable.name}`);
  }

  visitElementNode(elementNode: ElementNodeExpr) {
    console.log(
      `ElementNodeExpr: tag ${elementNode.tagName}, attributes: ${elementNode.attributes}, children: ${elementNode.children}`,
    );
  }
}
