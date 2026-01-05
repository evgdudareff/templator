import { Token } from '../token.ts';
import {
  AttributeExpr,
  ElementNodeExpr,
  EventHandlerExpr,
  Expr,
  ForNodeExpr,
  IfNodeExpr,
  TextNodeExpr,
  VariableExpr,
} from '../../core/expressions.ts';
import { TokenType } from '../constants.ts';

// LEXICAL GRAMMAR RULES

// expression - (elementNode | textNode | var | ifNode | forNode)*
// elementNode - TagOpen TagName (attribute)* TagClose expression TagEndClose TagName TagClose
// textNode - Text
// attribute - AttrName | AttrName Equal Quote attributeValue+ Quote
// attributeValue = AttrValue | var | ifNode
// ifNode - StmtOpen If identifier StmtClose expression (StmtOpen Else StmtClose expression)? StmtOpen EndIf StmtClose
// forNode - StmtOpen For identifier In identifier StmtClose expression  StmtOpen EndFor StmtClose
// var - VarOpen identifier VarClose

export class Parser {
  private current: number = 0;

  constructor(private readonly tokens: Token[]) {}

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

  private peekNext(): Token {
    return this.tokens[this.current + 1];
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

  private matchNext(type: TokenType) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peekNext().tokenType == type;
  }
  // utils methods end

  // parse methods start
  private expression(): Expr {
    const children = [];

    const currToken = this.peek();
    switch (currToken.tokenType) {
      case TokenType.TagOpen: {
        const elementNode = this.parseElementNode();
        children.push(elementNode);
        break;
      }

      case TokenType.VarOpen: {
        const variableExpr = this.parseVariableExpr();
        children.push(variableExpr);
        break;
      }

      case TokenType.StmtOpen: {
        if (this.matchNext(TokenType.If)) {
          const ifElse = this.parseIfElse();
          children.push(ifElse);
        } else if (this.matchNext(TokenType.For)) {
          const forStmt = this.parseForStmt();
          children.push(forStmt);
        } else {
          this.advance();
        }
        break;
      }

      default: {
        const textNode = new TextNodeExpr(this.tokensToString([this.advance()]));
        children.push(textNode);
        break;
      }
    }
    return children;
  }

  private parseForStmt(): ForNodeExpr {
    let pos = this.current;
    const openTokens = [
      TokenType.StmtOpen,
      TokenType.For,
      TokenType.Identifier,
      TokenType.In,
      TokenType.Identifier,
      TokenType.StmtClose,
    ];

    const isValidOpenStatement = openTokens.every(
      (tokenType, index) => this.tokens[pos + index].tokenType === tokenType,
    );

    if (!isValidOpenStatement) {
      throw new Error(`Invalid for statement tokens at line ${this.tokens[pos].line}`);
    }

    const iterateVariable = new VariableExpr(this.tokens[pos + 2].lexeme);
    const collectionVariable = new VariableExpr(this.tokens[pos + 4].lexeme);
    this.advance(6);

    const bodyTemplate = this.expression();

    pos = this.current;
    const closeTokens = [TokenType.StmtOpen, TokenType.EndFor, TokenType.StmtClose];

    const isValidCloseStatement = closeTokens.every(
      (tokenType, index) => this.tokens[pos + index].tokenType === tokenType,
    );

    if (!isValidCloseStatement) {
      throw new Error(`Invalid for statement closing tokens at line ${this.tokens[pos].line}`);
    }

    this.advance(3);
    return new ForNodeExpr(iterateVariable, collectionVariable, bodyTemplate);
  }

  private parseIfElse(): IfNodeExpr {
    let pos = this.current;

    const openTokens = [
      TokenType.StmtOpen,
      TokenType.If,
      TokenType.Identifier,
      TokenType.StmtClose,
    ];
    const isValidOpenStatement = openTokens.every(
      (tokenType, index) => this.tokens[pos + index].tokenType === tokenType,
    );
    if (!isValidOpenStatement) {
      throw new Error(`Invalid if statement tokens at line ${this.tokens[pos].line}`);
    }

    const ifMatchVariable = new VariableExpr(this.tokens[pos + 2].lexeme);
    this.advance(4);
    const ifBranchTemplate = this.expression();
    pos = this.current;
    let elseBranchTemplate;

    const hasElseBranchStatement =
      isValidOpenStatement &&
      this.tokens[pos].tokenType === TokenType.StmtOpen &&
      this.tokens[pos + 1].tokenType === TokenType.Else;

    const isValidElseStatement =
      hasElseBranchStatement &&
      this.tokens[pos + 1].tokenType === TokenType.Else &&
      this.tokens[pos + 2].tokenType === TokenType.StmtClose;

    if (hasElseBranchStatement && !isValidElseStatement) {
      throw new Error(`Invalid else branch statement tokens at line ${this.tokens[pos].line}`);
    }

    if (hasElseBranchStatement && isValidElseStatement) {
      this.advance(3);
      elseBranchTemplate = this.expression();
    }
    pos = this.current;

    const isValidCloseStatement =
      this.tokens[pos].tokenType === TokenType.StmtOpen &&
      this.tokens[pos + 1].tokenType === TokenType.EndIf &&
      this.tokens[pos + 2].tokenType === TokenType.StmtClose;

    if (!isValidCloseStatement) {
      throw new Error(`Malware close statement tokens at line ${this.tokens[pos].line}`);
    }

    this.advance(3);

    return new IfNodeExpr(ifMatchVariable, ifBranchTemplate, elseBranchTemplate);
  }

  private parseVariableExpr(): VariableExpr {
    const pos = this.current;
    const isValidVariableExpr =
      this.tokens[pos].tokenType === TokenType.VarOpen &&
      this.tokens[pos + 1].tokenType === TokenType.Identifier &&
      this.tokens[pos + 2].tokenType === TokenType.VarClose;

    if (!isValidVariableExpr) {
      throw new Error(`Invalid variable statement tokens at line ${this.tokens[pos].line}`);
    }

    this.advance(3);
    const variableName = this.tokens[pos + 1].lexeme.replace(/\s+$/, '');
    return new VariableExpr(variableName);
  }

  private parseEventHandler(): EventHandlerExpr | null {
    // @eventName="handlerName"
    if (!this.match(TokenType.AtSign)) {
      return null;
    }

    this.advance();
    if (!this.match(TokenType.AttrName)) {
      throw new Error(`Invalid event handler: expected event name at line ${this.peek().line}`);
    }

    const eventName = this.peek().lexeme;
    this.advance();

    if (!this.match(TokenType.Equal)) {
      throw new Error(
        `Invalid event handler: expected '=' after event name at line ${this.peek().line}`,
      );
    }
    this.advance();

    if (!this.match(TokenType.Quote)) {
      throw new Error(`Invalid event handler: expected quote at line ${this.peek().line}`);
    }
    this.advance();

    if (!this.match(TokenType.AttrValue)) {
      throw new Error(`Invalid event handler: expected handler name at line ${this.peek().line}`);
    }
    const handlerName = this.peek().lexeme.trim();
    this.advance();

    if (!this.match(TokenType.Quote)) {
      throw new Error(`Invalid event handler: expected closing quote at line ${this.peek().line}`);
    }
    this.advance();

    return new EventHandlerExpr(eventName, handlerName);
  }

  private parseAttributes(): { attributes: AttributeExpr[]; eventHandlers: EventHandlerExpr[] } {
    const attributes: AttributeExpr[] = [];
    const eventHandlers: EventHandlerExpr[] = [];

    while (!this.match(TokenType.TagClose)) {
      const eventHandler = this.parseEventHandler();
      if (eventHandler) {
        eventHandlers.push(eventHandler);
        continue;
      }

      let attrName = '';
      const attrValue = [];

      if (this.match(TokenType.AttrName)) {
        attrName = this.peek().lexeme;
        this.advance();

        while (
          !this.match(TokenType.AttrName) &&
          !this.match(TokenType.TagClose) &&
          !this.match(TokenType.AtSign)
        ) {
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

    return { attributes, eventHandlers };
  }

  private parseOpenTag() {
    const tagName = this.advance();
    const { attributes, eventHandlers } = this.parseAttributes();

    this.advance();
    return { openTagName: tagName.lexeme, attributes, eventHandlers };
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
    this.advance();
    const { openTagName, attributes, eventHandlers } = this.parseOpenTag();

    const children = [];
    while (!this.match(TokenType.TagEndClose)) {
      const expression = this.expression();
      children.push(expression);
    }

    if (this.peek().tokenType !== TokenType.TagEndClose) {
      throw new Error('Unexpected token type for close');
    }
    this.advance();

    const closeTagName = this.parseCloseTag();
    if (closeTagName !== openTagName) {
      throw new Error('Unexpected closeTagName for close');
    }

    return new ElementNodeExpr(openTagName, children, attributes, eventHandlers);
  }
  // parse methods end

  // main method: accept and parse first of next: <someTag>expr</someTag> or varStmt or ifElseStmt or forStmt or text
  public parse() {
    try {
      return this.expression();
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
