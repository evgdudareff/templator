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
  Text = 'TEXT', // attribute value, other text
  identifier = 'IDENTIFIER', // variable name

  //KEYWORDS
  If = 'IF', // if
  Else = 'ELSE', // else
  EndIf = 'END_IF', // endif
  For = 'FOR', // for
  In = 'IN', // in
  EndFor = 'END_FOR', // endfor
}

export enum ScannerMode {
  OpenTag = 'OPEN_TAG',
  CloseTag = 'CLOSE_TAG',
  AttrName = 'ATTR_NAME',
  AttrValue = 'ATTR_VALUE',
  VarIdentifier = 'VAR_IDENTIFIER',
  Text = 'TEXT',
}
