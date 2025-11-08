export interface PrintVisitorInterface {
  visitTextNode(textNode: TextNodeExpr): void;

  visitAttribute(attribute: AttributeExpr): void;

  visitElementNode(elementNode: ElementNodeExpr): void;

  visitVariable(variable: VariableExpr): void;

  visitIfNode(ifNode: IfNodeExpr): void;

  visitForNode(forNode: ForNodeExpr): void;
}

export interface PrintAccepterInterface {
  accept(printVisitor: PrintVisitorInterface): void;
}

export class TextNodeExpr implements PrintAccepterInterface {
  constructor(public value: string) {}

  accept(printVisitor: PrintVisitorInterface) {
    printVisitor.visitTextNode(this);
  }
}

export class AttributeExpr implements PrintAccepterInterface {
  constructor(
    public name: string,
    public value: (string | VariableExpr | IfNodeExpr)[],
  ) {}

  accept(printVisitor: PrintVisitorInterface) {
    printVisitor.visitAttribute(this);
  }
}

export class ElementNodeExpr implements PrintAccepterInterface {
  constructor(
    public tagName: string,
    public children: Expr[],
    public attributes: AttributeExpr[],
  ) {}

  accept(printVisitor: PrintVisitorInterface) {
    printVisitor.visitElementNode(this);
  }
}

export class VariableExpr implements PrintAccepterInterface {
  constructor(public name: string) {}

  accept(printVisitor: PrintVisitorInterface) {
    printVisitor.visitVariable(this);
  }
}

export class IfNodeExpr implements PrintAccepterInterface {
  constructor(
    public matchVariable: VariableExpr,
    public ifBranchTemplate: Expr,
    public elseBranchTemplate?: Expr,
  ) {}

  accept(printVisitor: PrintVisitorInterface) {
    printVisitor.visitIfNode(this);
  }
}

export class ForNodeExpr implements PrintAccepterInterface {
  constructor(
    public iterVariable: VariableExpr,
    public collectionVariable: VariableExpr,
    public bodyTemplate: Expr,
  ) {}

  accept(printVisitor: PrintVisitorInterface) {
    printVisitor.visitForNode(this);
  }
}

export type Expr = (ElementNodeExpr | TextNodeExpr | VariableExpr | IfNodeExpr | ForNodeExpr)[];
