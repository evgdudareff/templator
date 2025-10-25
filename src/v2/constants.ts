export enum TokenType {
  // SINGLE CHARACTERS
  Equal = 'EQUAL', // =
  TagClose = 'TAG_CLOSE', // >
  Quote = 'QUOTE', // "

  // DOUBLE CHARACTERS
  TagOpen = 'TAG_OPEN', // <alphabetic
  TagEndClose = 'TAG_END_CLOSE', // </
  VarOpen = 'VAR_OPEN', // {{
  VarClose = 'VAR_CLOSE', // }}
  StmtOpen = 'STMT_OPEN', // {%
  StmtClose = 'STMT_CLOSE', // %}

  // LITERALS
  TagName = 'TAG_NAME', // div, img ...
  AttrName = 'ATTR_NAME', // class, id ...
  AttrValue = 'ATTR_VALUE', // attribute text value
  Text = 'TEXT', // other text
  Identifier = 'IDENTIFIER', // variable name

  //KEYWORDS
  If = 'IF', // if
  Else = 'ELSE', // else
  EndIf = 'END_IF', // endif
  For = 'FOR', // for
  In = 'IN', // in
  EndFor = 'END_FOR', // endfor
}

// expression - (elementNode | textNode | var | ifNode | forNode)*
// elementNode - TagOpen TagName (attribute)* TagClose expression TagEndClose TagName TagClose
// textNode - Text
// attribute - AttrName | AttrName Equal Quote attributeValue+ Quote
// attributeValue = AttrValue | var | ifNode
// ifNode - StmtOpen If identifier StmtClose expression (StmtOpen Else StmtClose expression)? StmtOpen EndIf StmtClose
// forNode - StmtOpen For identifier In identifier StmtClose expression  StmtOpen EndFor StmtClose
// var - VarOpen identifier VarClose

export enum ScannerMode {
  OpenTag = 'OPEN_TAG',
  CloseTag = 'CLOSE_TAG',
  AttrName = 'ATTR_NAME',
  AttrValue = 'ATTR_VALUE',
  VarIdentifier = 'VAR_IDENTIFIER',
  Text = 'TEXT',
  Statement = 'STATEMENT',
}

export const keywordTokenTypeMap = {
  if: TokenType.If,
  else: TokenType.Else,
  endif: TokenType.EndIf,
  for: TokenType.For,
  in: TokenType.In,
  endfor: TokenType.EndFor,
};
