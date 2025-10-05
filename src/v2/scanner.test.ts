import { Scanner } from './scanner.ts';

test('It produces correct tokens for template without vars and statements', () => {
  const expectedTokens = [
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 1 },
    { tokenType: 'TAG_NAME', lexeme: 'h1', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'class', line: 1 },
    { tokenType: 'EQUAL', lexeme: '=', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_VALUE', lexeme: 'awesome', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'id', line: 1 },
    { tokenType: 'EQUAL', lexeme: '=', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_VALUE', lexeme: '1234', line: 1 },
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

test('It produces correct tokens for template with 2 vars', () => {
  const expectedTokens = [
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 1 },
    { tokenType: 'TAG_NAME', lexeme: 'h1', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'class', line: 1 },
    { tokenType: 'EQUAL', lexeme: '=', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_VALUE', lexeme: 'class-1', line: 1 },
    { tokenType: 'VAR_OPEN', lexeme: '{{', line: 1 },
    { tokenType: 'IDENTIFIER', lexeme: 'customClass1', line: 1 },
    { tokenType: 'VAR_CLOSE', lexeme: '}}', line: 1 },
    { tokenType: 'ATTR_VALUE', lexeme: 'class-2', line: 1 },
    { tokenType: 'VAR_OPEN', lexeme: '{{', line: 1 },
    { tokenType: 'IDENTIFIER', lexeme: 'customClass2', line: 1 },
    { tokenType: 'VAR_CLOSE', lexeme: '}}', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'id', line: 1 },
    { tokenType: 'EQUAL', lexeme: '=', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_VALUE', lexeme: '1234', line: 1 },
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
    <h1 class="class-1 {{customClass1}} class-2 {{customClass2}}" id="1234" data-user-on>
        <span>Scanner</span>
        Some text
    </h1>
`);

  const tokens = scanner.startScan();

  tokens.forEach((value, index) => {
    expect(value).toEqual(expectedTokens[index]);
  });
});

test('It produces correct tokens for template with 1 var as tag child', () => {
  const expectedTokens = [
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 1 },
    { tokenType: 'TAG_NAME', lexeme: 'h1', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'id', line: 1 },
    { tokenType: 'EQUAL', lexeme: '=', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'ATTR_VALUE', lexeme: '1234', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 1 },
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 2 },
    { tokenType: 'TAG_NAME', lexeme: 'span', line: 2 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 2 },
    { tokenType: 'VAR_OPEN', lexeme: '{{', line: 2 },
    { tokenType: 'IDENTIFIER', lexeme: 'customText', line: 2 },
    { tokenType: 'VAR_CLOSE', lexeme: '}}', line: 2 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 2 },
    { tokenType: 'TAG_NAME', lexeme: 'span', line: 2 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 2 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 3 },
    { tokenType: 'TAG_NAME', lexeme: 'h1', line: 3 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 3 },
  ];

  const scanner = new Scanner(`
    <h1 id="1234">
        <span>{{customText}}</span>
    </h1>
  `);

  const tokens = scanner.startScan();

  tokens.forEach((value, index) => {
    expect(value).toEqual(expectedTokens[index]);
  });
});

test('It produces correct tokens for template with if else statement and vars', () => {
  const expectedTokens = [
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 1 },
    { tokenType: 'TAG_NAME', lexeme: 'div', line: 1 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 1 },
    { tokenType: 'STMT_OPEN', lexeme: '{%', line: 2 },
    { tokenType: 'IF', lexeme: 'if', line: 2 },
    { tokenType: 'IDENTIFIER', lexeme: 'isLoggedIn', line: 2 },
    { tokenType: 'STMT_CLOSE', lexeme: '%}', line: 2 },
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 3 },
    { tokenType: 'TAG_NAME', lexeme: 'p', line: 3 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 3 },
    { tokenType: 'TEXT', lexeme: 'Welcome, ', line: 3 },
    { tokenType: 'VAR_OPEN', lexeme: '{{', line: 3 },
    { tokenType: 'IDENTIFIER', lexeme: 'username ', line: 3 },
    { tokenType: 'VAR_CLOSE', lexeme: '}}', line: 3 },
    { tokenType: 'TEXT', lexeme: '!', line: 3 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 3 },
    { tokenType: 'TAG_NAME', lexeme: 'p', line: 3 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 3 },
    { tokenType: 'STMT_OPEN', lexeme: '{%', line: 4 },
    { tokenType: 'ELSE', lexeme: 'else', line: 4 },
    { tokenType: 'STMT_CLOSE', lexeme: '%}', line: 4 },
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 5 },
    { tokenType: 'TAG_NAME', lexeme: 'p', line: 5 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 5 },
    { tokenType: 'TEXT', lexeme: 'Please log in', line: 5 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 5 },
    { tokenType: 'TAG_NAME', lexeme: 'p', line: 5 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 5 },
    { tokenType: 'STMT_OPEN', lexeme: '{%', line: 6 },
    { tokenType: 'END_IF', lexeme: 'endif', line: 6 },
    { tokenType: 'STMT_CLOSE', lexeme: '%}', line: 6 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 7 },
    { tokenType: 'TAG_NAME', lexeme: 'div', line: 7 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 7 },
  ];

  const scanner = new Scanner(`
    <div>
      {% if isLoggedIn %}
        <p>Welcome, {{ username }}!</p>
      {% else %}
        <p>Please log in</p>
      {% endif %}
    </div>
    `);

  const tokens = scanner.startScan();

  tokens.forEach((value, index) => {
    expect(value).toEqual(expectedTokens[index]);
  });
});

test('It produces correct tokens for template with if else statement in attribute value', () => {
  const expectedTokens = [
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 1 },
    { tokenType: 'TAG_NAME', lexeme: 'button', line: 1 },
    { tokenType: 'ATTR_NAME', lexeme: 'class', line: 1 },
    { tokenType: 'EQUAL', lexeme: '=', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'STMT_OPEN', lexeme: '{%', line: 1 },
    { tokenType: 'IF', lexeme: 'if', line: 1 },
    { tokenType: 'IDENTIFIER', lexeme: 'isPrimary', line: 1 },
    { tokenType: 'STMT_CLOSE', lexeme: '%}', line: 1 },
    { tokenType: 'ATTR_VALUE', lexeme: 'btn-primary', line: 1 },
    { tokenType: 'STMT_OPEN', lexeme: '{%', line: 1 },
    { tokenType: 'ELSE', lexeme: 'else', line: 1 },
    { tokenType: 'STMT_CLOSE', lexeme: '%}', line: 1 },
    { tokenType: 'ATTR_VALUE', lexeme: 'btn-secondary', line: 1 },
    { tokenType: 'STMT_OPEN', lexeme: '{%', line: 1 },
    { tokenType: 'END_IF', lexeme: 'endif', line: 1 },
    { tokenType: 'STMT_CLOSE', lexeme: '%}', line: 1 },
    { tokenType: 'QUOTE', lexeme: '"', line: 1 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 1 },
    { tokenType: 'TEXT', lexeme: 'Click me\n', line: 2 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 2 },
    { tokenType: 'TAG_NAME', lexeme: 'button', line: 2 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 2 },
  ];

  const scanner = new Scanner(`
   <button class="{% if isPrimary %}btn-primary{% else %}btn-secondary{% endif %}">
  Click me
</button>
    `);

  const tokens = scanner.startScan();

  tokens.forEach((value, index) => {
    expect(value).toEqual(expectedTokens[index]);
  });
});

test('It produces correct tokens for template with for in statement', () => {
  const expectedTokens = [
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 1 },
    { tokenType: 'TAG_NAME', lexeme: 'ul', line: 1 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 1 },
    { tokenType: 'STMT_OPEN', lexeme: '{%', line: 2 },
    { tokenType: 'FOR', lexeme: 'for', line: 2 },
    { tokenType: 'IDENTIFIER', lexeme: 'user', line: 2 },
    { tokenType: 'IN', lexeme: 'in', line: 2 },
    { tokenType: 'IDENTIFIER', lexeme: 'users', line: 2 },
    { tokenType: 'STMT_CLOSE', lexeme: '%}', line: 2 },
    { tokenType: 'TAG_OPEN', lexeme: '<', line: 3 },
    { tokenType: 'TAG_NAME', lexeme: 'li', line: 3 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 3 },
    { tokenType: 'VAR_OPEN', lexeme: '{{', line: 3 },
    { tokenType: 'IDENTIFIER', lexeme: 'user.name ', line: 3 },
    { tokenType: 'VAR_CLOSE', lexeme: '}}', line: 3 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 3 },
    { tokenType: 'TAG_NAME', lexeme: 'li', line: 3 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 3 },
    { tokenType: 'STMT_OPEN', lexeme: '{%', line: 4 },
    { tokenType: 'END_FOR', lexeme: 'endfor', line: 4 },
    { tokenType: 'STMT_CLOSE', lexeme: '%}', line: 4 },
    { tokenType: 'TAG_END_CLOSE', lexeme: '</', line: 5 },
    { tokenType: 'TAG_NAME', lexeme: 'ul', line: 5 },
    { tokenType: 'TAG_CLOSE', lexeme: '>', line: 5 },
  ];

  const scanner = new Scanner(`
     <ul>
      {% for user in users %}
        <li>{{ user.name }}</li>
      {% endfor %}
    </ul>
  `);

  const tokens = scanner.startScan();

  tokens.forEach((value, index) => {
    expect(value).toEqual(expectedTokens[index]);
  });
});
