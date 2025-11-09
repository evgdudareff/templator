import {
  AttributeExpr,
  ElementNodeExpr,
  ForNodeExpr,
  IfNodeExpr,
  ExpVisitorInterface,
  TextNodeExpr,
  VariableExpr,
} from './parserExpression.ts';

export class PrintVisitor implements ExpVisitorInterface<undefined> {
  visitTextNode(textNode: TextNodeExpr) {
    console.log(`TextNodeExpr: ${textNode.value}`);
    return undefined;
  }

  visitAttribute(attribute: AttributeExpr) {
    console.log(`AttributeExpr: ${attribute.name}=${attribute.value}`);
    return undefined;
  }

  visitIfNode(ifNode: IfNodeExpr) {
    console.log(
      `IfNodeExpr: if ${ifNode.matchVariable} then ${ifNode.ifBranchTemplate} else ${ifNode.elseBranchTemplate}`,
    );
    return undefined;
  }

  visitForNode(forNode: ForNodeExpr) {
    console.log(
      `ForNodeExpr: for ${forNode.iterVariable} in ${forNode.collectionVariable} -> ${forNode.bodyTemplate}`,
    );
    return undefined;
  }

  visitVariable(variable: VariableExpr) {
    console.log(`VariableExpr: ${variable.name}`);
    return undefined;
  }

  visitElementNode(elementNode: ElementNodeExpr) {
    console.log(
      `ElementNodeExpr: tag ${elementNode.tagName}, attributes: ${elementNode.attributes}, children: ${elementNode.children}`,
    );
    return undefined;
  }
}
