import { Scanner } from '../compiler/scanner/scanner.ts';
import { Parser } from '../compiler/parser/parser.ts';
import { DomInterpreter } from './domInterpreter.ts';

describe('DomInterpreter', () => {
  test('should create basic DOM elements without variables', () => {
    const template = `
      <h1 class="awesome" id="1234">
        <span>Hello</span>
        Some text
      </h1>
    `;

    const scanner = new Scanner(template);
    const tokens = scanner.startScan();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    if (!ast) throw new Error('AST is null');

    const interpreter = new DomInterpreter({});
    const result = ast[0].accept(interpreter);

    expect(result).toBeInstanceOf(HTMLElement);
    expect((result as HTMLElement).tagName).toBe('H1');
    expect((result as HTMLElement).getAttribute('class')).toBe('awesome');
    expect((result as HTMLElement).getAttribute('id')).toBe('1234');
    expect(result.textContent).toContain('Hello');
    expect(result.textContent).toContain('Some text');
  });

  test('should interpolate variables in element content', () => {
    const template = `<p>Hello {{ name }}, you are {{ age }} years old</p>`;

    const scanner = new Scanner(template);
    const tokens = scanner.startScan();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    if (!ast) throw new Error('AST is null');

    const ctx = { name: 'Alice', age: '25' };
    const interpreter = new DomInterpreter(ctx);
    const result = ast[0].accept(interpreter);

    expect(result).toBeInstanceOf(HTMLElement);
    expect((result as HTMLElement).tagName).toBe('P');
    expect(result.textContent).toContain('Hello Alice');
    expect(result.textContent).toContain('25');
    expect(result.textContent).toContain('years old');
  });

  test('should render conditional blocks based on context', () => {
    const template = `
      <div>
        {% if isLoggedIn %}
          <p>Welcome, {{ username }}!</p>
        {% else %}
          <p>Please log in</p>
        {% endif %}
      </div>
    `;

    const scanner = new Scanner(template);
    const tokens = scanner.startScan();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    if (!ast) throw new Error('AST is null');

    // Test with isLoggedIn = true
    const interpreterLoggedIn = new DomInterpreter({
      isLoggedIn: true,
      username: 'John',
    });
    const resultLoggedIn = ast[0].accept(interpreterLoggedIn);

    expect(resultLoggedIn).toBeInstanceOf(HTMLElement);
    expect(resultLoggedIn.textContent).toContain('Welcome, John!');
    expect(resultLoggedIn.textContent).not.toContain('Please log in');

    // Test with isLoggedIn = false
    const interpreterNotLoggedIn = new DomInterpreter({
      isLoggedIn: false,
    });
    const resultNotLoggedIn = ast[0].accept(interpreterNotLoggedIn);

    expect(resultNotLoggedIn).toBeInstanceOf(HTMLElement);
    expect(resultNotLoggedIn.textContent).not.toContain('Welcome');
    expect(resultNotLoggedIn.textContent).toContain('Please log in');
  });
});
