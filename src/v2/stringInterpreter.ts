import {
  AttributeExpr,
  ElementNodeExpr,
  ExpVisitorInterface,
  ForNodeExpr,
  IfNodeExpr,
  TextNodeExpr,
  VariableExpr,
} from './parserExpression.js';

export class StringInterpreter implements ExpVisitorInterface<string> {
  constructor(private ctx: Record<string, unknown>) {}

  visitVariable(variable: VariableExpr): string {
    const propertyChain = variable.name.split('.');
    let ctxValue: unknown = this.ctx;

    for (const prop of propertyChain) {
      if (ctxValue && typeof ctxValue === 'object' && prop in ctxValue) {
        ctxValue = (ctxValue as Record<string, unknown>)[prop];
      } else {
        return '';
      }
    }

    return typeof ctxValue === 'string' ? ctxValue.trim() : '';
  }

  visitTextNode(textNode: TextNodeExpr): string {
    return textNode.value.replace(/[\r\n]+/g, '').replace(/\s+/g, ' ');
  }

  visitAttribute(attribute: AttributeExpr): string {
    const attrName = attribute.name;
    const parts = attribute.value
      .map((v) => {
        return typeof v === 'string' ? v : v.accept(this);
      })
      .join(' ');
    return parts ? `${attrName}="${parts}"` : attrName;
  }

  visitIfNode(ifNode: IfNodeExpr): string {
    const { matchVariable, ifBranchTemplate, elseBranchTemplate = [] } = ifNode;
    const ifBranchTruthy = !!this.ctx[matchVariable.name];
    const template = ifBranchTruthy ? ifBranchTemplate[0] : elseBranchTemplate[0];
    let result = '';

    if (template) {
      result = template.accept(this);
    }

    return result;
  }

  visitElementNode(elementNode: ElementNodeExpr): string {
    const { tagName, attributes, children } = elementNode;
    const attributesString = attributes.map((atr) => this.visitAttribute(atr)).join(' ');
    let childrenString = '';
    if (children) {
      childrenString = children
        .map((child) => child[0].accept(this))
        .join('')
        .trim();
    }
    const space = attributesString ? ' ' : '';
    return `<${tagName}${space}${attributesString}>${childrenString}</${tagName}>`;
  }

  visitForNode(forNode: ForNodeExpr): string {
    const { iterVariable, collectionVariable, bodyTemplate } = forNode;

    const collection = this.ctx[collectionVariable.name];
    if (!Array.isArray(collection)) return '';

    return collection
      .map((item) => {
        const nested = new StringInterpreter({
          ...this.ctx,
          [iterVariable.name]: item,
        });
        return bodyTemplate.map((expr) => expr.accept(nested)).join('');
      })
      .join('');
  }
}
