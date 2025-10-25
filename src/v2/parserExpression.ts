import { Token } from './token.ts';

export class Expr {
  constructor(public value: (ElementNodeExpr | TextNodeExpr)[]) {}
}

export class TextNodeExpr {
  constructor(public value: string) {}
}

export class AttributeExpr {
  constructor(
    public name: string,
    public value: (string | VariableExpr | IfNodeExpr)[],
  ) {}
}

export class ElementNodeExpr {
  constructor(
    public tagName: string,
    public children: (TextNodeExpr | ElementNodeExpr)[],
    public attributes: AttributeExpr[],
  ) {}
}

export class VariableExpr {
  constructor(public name: string) {}
}

export class IfNodeExpr {
  constructor(
    public matchVariable: VariableExpr,
    public ifBranchTemplate: Expr,
    public elseBranchTemplate?: Expr,
  ) {}
}

export class ForNodeExpr {
  constructor(
    public iterVariable: VariableExpr,
    public collectionVariable: VariableExpr,
    public bodyTemplate: Expr,
  ) {}
}
