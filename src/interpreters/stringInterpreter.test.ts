import { Scanner } from '../compiler/scanner/scanner.ts';
import { Parser } from '../compiler/parser/parser.ts';
import { StringInterpreter } from './stringInterpreter.ts';

test('It renders a template without excess whitespace', () => {
  const scanner = new Scanner(`
    <h1 class="awesome" id="1234" data-user-on>
        <span>Scanner</span>
        Some text
    </h1>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];
  const stringInterpreter = new StringInterpreter({});

  const result = parsed.accept(stringInterpreter);
  expect(result).toBe(
    `<h1 class="awesome" id="1234" data-user-on><span>Scanner</span>Some text</h1>`,
  );
});

test('It handles text with multiple spaces and newlines', () => {
  const scanner = new Scanner(`
    <div>
      Text   with    multiple    spaces
      and
      newlines
    </div>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];
  const stringInterpreter = new StringInterpreter({});

  const result = parsed.accept(stringInterpreter);
  expect(result).toBe(`<div>Text with multiple spaces and newlines</div>`);
});

test('It preserves meaningful punctuation spacing', () => {
  const scanner = new Scanner(`
    <p>Hello,   world. How are  you?</p>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];
  const stringInterpreter = new StringInterpreter({});

  const result = parsed.accept(stringInterpreter);
  expect(result).toBe(`<p>Hello, world. How are you?</p>`);
});

test('It handles complex punctuation and spacing', () => {
  const scanner = new Scanner(`
    <p>Hello,   world! Are you   ready?   Yes, I am!</p>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];
  const stringInterpreter = new StringInterpreter({});

  const result = parsed.accept(stringInterpreter);
  expect(result).toBe(`<p>Hello, world! Are you ready? Yes, I am!</p>`);
});

test('It renders a template with variables', () => {
  const scanner = new Scanner(`
    <h1 class="{{customClass}}" id="{{id}}">
        <span>{{greeting}}</span>
        Welcome,   {{ username }}!
    </h1>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];
  const stringInterpreter = new StringInterpreter({
    customClass: 'welcome-header',
    id: '1234',
    greeting: 'Hello',
    username: 'User',
  });

  const result = parsed.accept(stringInterpreter);
  expect(result).toBe(`<h1 class="welcome-header" id="1234"><span>Hello</span>Welcome, User!</h1>`);
});

test('It handles conditional rendering with complex whitespace', () => {
  const scanner = new Scanner(`
    <div>
      {% if isLoggedIn %}
        <p>  Welcome,   {{ username }}!  </p>
      {% else %}
        <p>  Please   log   in  </p>
      {% endif %}
    </div>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];

  const interpreterLoggedIn = new StringInterpreter({
    isLoggedIn: true,
    username: 'John',
  });

  const resultLoggedIn = parsed.accept(interpreterLoggedIn);
  expect(resultLoggedIn).toBe(`<div><p>Welcome, John!</p></div>`);

  const interpreterNotLoggedIn = new StringInterpreter({
    isLoggedIn: false,
  });

  const resultNotLoggedIn = parsed.accept(interpreterNotLoggedIn);
  expect(resultNotLoggedIn).toBe(`<div><p>Please log in</p></div>`);
});

test('It renders for loop with whitespace', () => {
  const scanner = new Scanner(`
    <ul>
      {% for user in users %}
        <li>  {{ user.name }}  </li>
      {% endfor %}
    </ul>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];

  const interpreter = new StringInterpreter({
    users: [{ name: 'John' }, { name: 'Jane' }, { name: 'Doe' }],
  });

  const result = parsed.accept(interpreter);
  expect(result).toBe(`<ul><li>John</li><li>Jane</li><li>Doe</li></ul>`);
});

test('It handles missing context variables with whitespace', () => {
  const scanner = new Scanner(`
    <div>
      <p>  {{ missing }}  </p>
      {% if nonExistent %}
        <span>This should not render</span>
      {% endif %}
      {% for item in emptyList %}
        <strong>  {{ item }}  </strong>
      {% endfor %}
    </div>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];

  const interpreter = new StringInterpreter({});

  const result = parsed.accept(interpreter);
  expect(result).toBe(`<div><p></p></div>`);
});
