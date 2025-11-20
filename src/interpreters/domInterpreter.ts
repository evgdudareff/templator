import {
  AttributeExpr,
  ElementNodeExpr,
  EventHandlerExpr,
  ExpVisitorInterface,
  ForNodeExpr,
  IfNodeExpr,
  TextNodeExpr,
  VariableExpr,
} from '../core/expressions.ts';

const isString = (value: unknown): value is string => typeof value === 'string';

export type EventHandler = (event: Event, context: Record<string, unknown>) => void;

export class DomInterpreter implements ExpVisitorInterface<Node> {
  constructor(
    private ctx: Record<string, unknown>,
    private eventHandlers: Record<string, EventHandler> = {},
  ) {}

  visitTextNode(textNode: TextNodeExpr): Text {
    return document.createTextNode(textNode.value);
  }

  visitElementNode(elementNode: ElementNodeExpr): Element {
    const element = document.createElement(elementNode.tagName);

    const attributes = elementNode.attributes.map((attributeExpr) => {
      const attributeValues = attributeExpr.value
        .map((attributeValue) => {
          if (!attributeValue) {
            return '';
          }

          if (isString(attributeValue)) {
            return attributeValue;
          }
          const attr = attributeValue.accept(this);
          return attr.textContent;
        })
        .filter((attributeValues) => attributeValues !== null);

      return {
        name: attributeExpr.name,
        value: attributeValues,
      };
    });

    attributes.forEach(({ name, value }) => {
      element.setAttribute(name, value.join(' '));
    });

    const children = elementNode.children.map((child) => {
      return child[0].accept(this);
    });

    const fragment = document.createDocumentFragment();
    fragment.append(...children);

    element.appendChild(fragment);
    
    elementNode.eventHandlers.forEach((eventHandler) => {
      const handler = this.eventHandlers[eventHandler.handlerName];
      if (handler) {
        element.addEventListener(eventHandler.eventName, (event) => {
          handler(event, this.ctx);
        });
      }
    });

    return element;
  }

  visitAttribute(attribute: AttributeExpr): Node {
    const attr = attribute.accept(this);
    return attr;
  }

  visitForNode(forNode: ForNodeExpr): Node {
    const { iterVariable, collectionVariable, bodyTemplate } = forNode;

    const collection = this.ctx[collectionVariable.name];
    if (!Array.isArray(collection)) return document.createDocumentFragment();

    const nodes = collection.map((item) => {
      const nested = new DomInterpreter(
        {
          ...this.ctx,
          [iterVariable.name]: item,
        },
        this.eventHandlers,
      );
      return bodyTemplate.map((expr) => expr.accept(nested))[0];
    });
    const fragment = document.createDocumentFragment();
    fragment.append(...nodes);
    return fragment;
  }

  visitIfNode(ifNode: IfNodeExpr): Node {
    const { matchVariable, ifBranchTemplate, elseBranchTemplate = [] } = ifNode;
    const ifBranchTruthy = !!this.ctx[matchVariable.name];
    const template = ifBranchTruthy ? ifBranchTemplate[0] : elseBranchTemplate[0];
    if (template) {
      return template.accept(this);
    }
    return document.createDocumentFragment();
  }

  visitVariable(variable: VariableExpr): Text {
    const propertyChain = variable.name.split('.');
    let ctxValue: unknown = this.ctx;

    for (const prop of propertyChain) {
      if (ctxValue && typeof ctxValue === 'object' && prop in ctxValue) {
        ctxValue = (ctxValue as Record<string, unknown>)[prop];
      } else {
        return document.createTextNode('');
      }
    }

    return typeof ctxValue === 'string'
      ? document.createTextNode(ctxValue)
      : document.createTextNode('');
  }
}
