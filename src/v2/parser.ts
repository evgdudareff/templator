import { Token } from './token.ts';
import {
  AttributeExpr,
  ElementNodeExpr,
  Expr,
  IfNodeExpr,
  TextNodeExpr,
  VariableExpr,
} from './parserExpression.ts';
import { TokenType } from './constants.ts';
import { Scanner } from './scanner.ts';

export class Parser {
  private current: number = 0;

  constructor(public readonly tokens: Token[]) {}

  // utils methods start
  private tokensToString(tokens: Token[]): string {
    return tokens.map((token: Token) => token.lexeme).join(' ');
  }

  private isAtEnd(): boolean {
    return this.current > this.tokens.length - 1;
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private advance(step: number = 1): Token {
    if (!this.isAtEnd()) {
      this.current += step;
    }
    return this.previous();
  }

  private match(type: TokenType) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().tokenType == type;
  }
  // utils methods end

  // parse methods start
  private expression(): Expr {
    const nodes = [];

    while (!this.isAtEnd()) {
      const currToken = this.advance();

      switch (currToken.tokenType) {
        case TokenType.TagOpen: {
          const elementNode = this.parseElementNode();
          nodes.push(elementNode);
          break;
        }
      }
    }

    return new Expr(nodes);
  }

  private parseNotElementNodeChildren(): TextNodeExpr {
    const children = [];

    while (!this.match(TokenType.TagEndClose)) {
      children.push(this.advance());
    }

    return new TextNodeExpr(this.tokensToString(children));
  }

  private parseIfElse(): IfNodeExpr {
    let pos = this.current;
    const isValidOpenStatement =
      tokens[pos].tokenType === TokenType.StmtOpen &&
      tokens[pos + 1].tokenType === TokenType.If &&
      tokens[pos + 2].tokenType === TokenType.Identifier &&
      tokens[pos + 3].tokenType === TokenType.StmtClose &&
      tokens[pos + 4].tokenType === TokenType.AttrValue;

    if (!isValidOpenStatement) {
      throw new Error(`Malware open statement tokens at line ${tokens[pos].line}`);
    }

    this.advance(5);

    const hasElseBranchStatement =
      isValidOpenStatement &&
      tokens[pos + 5].tokenType === TokenType.StmtOpen &&
      tokens[pos + 6].tokenType === TokenType.Else;

    const isValidElseStatement =
      hasElseBranchStatement &&
      tokens[pos + 6].tokenType === TokenType.Else &&
      tokens[pos + 7].tokenType === TokenType.StmtClose &&
      tokens[pos + 8].tokenType === TokenType.AttrValue;

    if (hasElseBranchStatement && !isValidElseStatement) {
      throw new Error(`Malware else branch statement tokens at line ${tokens[pos].line}`);
    }

    if (hasElseBranchStatement) {
      this.advance(4);
    }

    pos = this.current;

    const isValidCloseStatement =
      tokens[pos].tokenType === TokenType.StmtOpen &&
      tokens[pos + 1].tokenType === TokenType.EndIf &&
      tokens[pos + 2].tokenType === TokenType.StmtClose;

    if (!isValidCloseStatement) {
      throw new Error(`Malware close statement tokens at line ${tokens[pos].line}`);
    }

    this.advance(3);

    const ifMatchVariable = new VariableExpr(tokens[pos + 2].lexeme);
    const ifBranchTemplate = new Expr([new TextNodeExpr(tokens[pos + 4].lexeme)]);
    const elseBranchTemplate = isValidElseStatement
      ? new Expr([new TextNodeExpr(tokens[pos + 8].lexeme)])
      : undefined;

    return new IfNodeExpr(ifMatchVariable, ifBranchTemplate, elseBranchTemplate);
  }

  private parseVariableExpr(): VariableExpr {
    const pos = this.current;
    const isValidVariableExpr =
      tokens[pos].tokenType === TokenType.VarOpen &&
      tokens[pos + 1].tokenType === TokenType.Identifier &&
      tokens[pos + 2].tokenType === TokenType.VarClose;

    if (!isValidVariableExpr) {
      throw new Error(`Malware variable statement tokens at line ${tokens[pos].line}`);
    }

    this.advance(3);
    return new VariableExpr(tokens[pos + 1].lexeme);
  }

  private parseAttributes(): AttributeExpr[] {
    const attributes: AttributeExpr[] = [];

    while (!this.match(TokenType.TagClose)) {
      let attrName = '';
      const attrValue = [];

      if (this.match(TokenType.AttrName)) {
        attrName = this.peek().lexeme;
        this.advance();

        while (!this.match(TokenType.AttrName) && !this.match(TokenType.TagClose)) {
          if (this.match(TokenType.AttrValue)) {
            attrValue.push(this.peek().lexeme);
          } else if (this.match(TokenType.VarOpen)) {
            const variableExpr = this.parseVariableExpr();
            attrValue.push(variableExpr);
          } else if (this.match(TokenType.StmtOpen)) {
            const ifNodeExpr = this.parseIfElse();
            attrValue.push(ifNodeExpr);
          }
          this.advance();
        }
      }

      if (attrName) {
        const attribute = new AttributeExpr(attrName, attrValue);
        attributes.push(attribute);
      }
    }

    return attributes;
  }

  private parseOpenTag() {
    const tagName = this.advance();
    const parsedAttributes = this.parseAttributes();

    this.advance();
    return { openTagName: tagName.lexeme, attributes: parsedAttributes };
  }

  private parseCloseTag() {
    const tagName = this.advance();

    while (!this.match(TokenType.TagClose)) {
      this.advance();
    }
    this.advance();

    return tagName.lexeme;
  }

  private parseElementNode(): ElementNodeExpr {
    const { openTagName, attributes } = this.parseOpenTag();

    const children = [];
    while (!this.match(TokenType.TagEndClose)) {
      if (!this.match(TokenType.TagOpen)) {
        children.push(this.parseNotElementNodeChildren());
      } else {
        this.advance();
        children.push(this.parseElementNode());
      }
    }

    if (this.peek().tokenType !== TokenType.TagEndClose) {
      throw new Error('Unexpected token type for close');
    }
    this.advance();

    const closeTagName = this.parseCloseTag();
    if (closeTagName !== openTagName) {
      throw new Error('Unexpected closeTagName for close');
    }

    return new ElementNodeExpr(openTagName, children, attributes);
  }
  // parse methods end

  // main method
  public parse() {
    return this.expression();
  }
}

const scanner = new Scanner(`
    <h1 id="1234">
        <span>{{customText}}</span>
    </h1>`);
// const scanner = new Scanner(`
//    <button class="{% if isPrimary %}btn-primary{% else %}btn-secondary{% endif %}" data-qa="{% if isPrimary %} main-title {% endif %}">
//   Click me
// </button>
//     `);
const tokens = scanner.startScan();

const parser = new Parser(tokens);
const expr = parser.parse();
console.log(expr);
