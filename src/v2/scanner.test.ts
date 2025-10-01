import { Scanner } from './scanner.ts';

test('It produces correct tokens for template without vars and statements', () => {
  const expectedTokens = [
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 1 },
    { tokenType: 'TAG_NAME', lexeme: 'h1', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'class', line: 1 },
    { tokenType: 'EQUAL', lexeme: '=', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'TEXT', lexeme: 'awesome', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'id', line: 1 },
    { tokenType: 'EQUAL', lexeme: '=', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'TEXT', lexeme: '1234', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'data-user-on', line: 1 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 1 },
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 2 },
    { tokenType: 'TAG_NAME', lexeme: 'span', line: 2 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 2 },
    { tokenType: 'TEXT', lexeme: 'Scanner', line: 2 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 2 },
    { tokenType: 'TAG_NAME', lexeme: 'span', line: 2 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 2 },
    { tokenType: 'TEXT', lexeme: 'Some text\n    ', line: 3 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 3 },
    { tokenType: 'TAG_NAME', lexeme: 'h1', line: 3 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 3 },
  ];

  const scanner = new Scanner(`
    <h1 class="awesome" id="1234" data-user-on>
        <span>Scanner</span>
        Some text
    </h1>
`);

  const tokens = scanner.startScan();

  tokens.forEach((value, index) => {
    expect(value).toEqual(expectedTokens[index]);
  });
});
