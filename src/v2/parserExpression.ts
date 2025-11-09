export interface ExpVisitorInterface<T> {
  visitTextNode(textNode: TextNodeExpr): T;

  visitAttribute(attribute: AttributeExpr): T;

  visitElementNode(elementNode: ElementNodeExpr): T;

  visitVariable(variable: VariableExpr): T;

  visitIfNode(ifNode: IfNodeExpr): T;

  visitForNode(forNode: ForNodeExpr): T;
}

export interface AccepterInterface {
  accept<R>(visitor: ExpVisitorInterface<R>): R;
}

export class TextNodeExpr implements AccepterInterface {
  constructor(public value: string) {}

  accept<R>(visitor: ExpVisitorInterface<R>): R {
    return visitor.visitTextNode(this);
  }
}

export class AttributeExpr implements AccepterInterface {
  constructor(
    public name: string,
    public value: (string | VariableExpr | IfNodeExpr)[],
  ) {}

  accept<R>(visitor: ExpVisitorInterface<R>): R {
    return visitor.visitAttribute(this);
  }
}

export class ElementNodeExpr implements AccepterInterface {
  constructor(
    public tagName: string,
    public children: Expr[],
    public attributes: AttributeExpr[],
  ) {}

  accept<R>(visitor: ExpVisitorInterface<R>): R {
    return visitor.visitElementNode(this);
  }
}

export class VariableExpr implements AccepterInterface {
  constructor(public name: string) {}

  accept<R>(visitor: ExpVisitorInterface<R>): R {
    return visitor.visitVariable(this);
  }
}

export class IfNodeExpr implements AccepterInterface {
  constructor(
    public matchVariable: VariableExpr,
    public ifBranchTemplate: Expr,
    public elseBranchTemplate?: Expr,
  ) {}

  accept<R>(visitor: ExpVisitorInterface<R>): R {
    return visitor.visitIfNode(this);
  }
}

export class ForNodeExpr implements AccepterInterface {
  constructor(
    public iterVariable: VariableExpr,
    public collectionVariable: VariableExpr,
    public bodyTemplate: Expr,
  ) {}

  accept<R>(visitor: ExpVisitorInterface<R>): R {
    return visitor.visitForNode(this);
  }
}

export type Expr = (ElementNodeExpr | TextNodeExpr | VariableExpr | IfNodeExpr | ForNodeExpr)[];
