export type Expr = (ElementNodeExpr | TextNodeExpr | VariableExpr | IfNodeExpr | ForNodeExpr)[];

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
    public children: Expr[],
    public attributes: AttributeExpr[],
  ) {}
}

export class VariableExpr {
  constructor(public name: string) {}
}

export class IfNodeExpr {
  constructor(
    public matchVariable: VariableExpr,
    public ifBranchTemplate: ElementNodeExpr | TextNodeExpr | VariableExpr,
    public elseBranchTemplate?: ElementNodeExpr | TextNodeExpr | VariableExpr,
  ) {}
}

export class ForNodeExpr {
  constructor(
    public iterVariable: VariableExpr,
    public collectionVariable: VariableExpr,
    public bodyTemplate: Expr,
  ) {}
}
