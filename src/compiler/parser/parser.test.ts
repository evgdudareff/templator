import { Scanner } from '../scanner/scanner.ts';
import { Parser } from './parser.ts';
import {
  ElementNodeExpr,
  TextNodeExpr,
  VariableExpr,
  IfNodeExpr,
  ForNodeExpr,
} from '../../core/expressions.ts';

test('It parses a simple template without vars and statements', () => {
  const scanner = new Scanner(`
    <h1 class="awesome" id="1234" data-user-on>
        <span>Scanner</span>
        Some text
    </h1>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0] as ElementNodeExpr;

  expect(parsed.attributes[2].name).toBe('data-user-on');

  const firstChild = parsed.children[0][0] as ElementNodeExpr;
  expect(firstChild.tagName).toBe('span');
  expect(firstChild.children[0][0] as TextNodeExpr).toEqual(
    expect.objectContaining({
      value: 'Scanner',
    }),
  );

  const secondChild = parsed.children[1][0] as TextNodeExpr;
  expect(secondChild.value).toBe('Some text\n    ');
});

test('It parses a template with 2 vars', () => {
  const scanner = new Scanner(`
    <h1 class="class-1 {{customClass1}} class-2 {{customClass2}}" id="1234" data-user-on>
        <span>Scanner</span>
        Some text
    </h1>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0] as ElementNodeExpr;

  const customClassVars = parsed.attributes[0].value.filter(
    (v) => v instanceof VariableExpr,
  ) as VariableExpr[];

  expect(customClassVars).toHaveLength(2);
  expect(customClassVars[0].name).toContain('customClass1');
  expect(customClassVars[1].name).toContain('customClass2');
});

test('It parses a template with 1 var as tag child', () => {
  const scanner = new Scanner(`
    <h1 id="1234">
        <span>{{customText}}</span>
    </h1>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0] as ElementNodeExpr;

  const spanChild = parsed.children[0][0] as ElementNodeExpr;
  const varExpr = spanChild.children[0][0] as VariableExpr;
  expect(varExpr).toEqual(
    expect.objectContaining({
      name: 'customText',
    }),
  );
});

test('It parses a template with if else statement and vars', () => {
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
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0] as ElementNodeExpr;

  const ifNodeExpr = parsed.children[0][0] as IfNodeExpr;
  expect(ifNodeExpr.matchVariable).toEqual(
    expect.objectContaining({
      name: 'isLoggedIn',
    }),
  );

  const ifBranchTemplate = ifNodeExpr.ifBranchTemplate[0] as ElementNodeExpr;
  expect(ifBranchTemplate.children[0][0]).toEqual(
    expect.objectContaining({
      value: 'Welcome, ',
    }),
  );

  const ifBranchUserVar = ifBranchTemplate.children[1][0] as VariableExpr;
  expect(ifBranchUserVar).toEqual(
    expect.objectContaining({
      name: 'username',
    }),
  );

  const elseBranchTemplate = ifNodeExpr.elseBranchTemplate![0] as ElementNodeExpr;
  expect(elseBranchTemplate!.children[0][0]).toEqual(
    expect.objectContaining({
      value: 'Please log in',
    }),
  );
});

test('It parses a template with if else statement in attribute value', () => {
  const scanner = new Scanner(`
   <button class="{% if isPrimary %}btn-primary{% else %}btn-secondary{% endif %}" data-qa="{% if isPrimary %} main-title {% endif %}">
  Click me
</button>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0] as ElementNodeExpr;

  const classAttribute = parsed.attributes[0];
  const complexValues = classAttribute.value.filter((v) => v instanceof IfNodeExpr);

  expect(complexValues).toHaveLength(1);

  const ifNodeExpr = complexValues[0] as IfNodeExpr;

  expect(ifNodeExpr.matchVariable).toEqual(
    expect.objectContaining({
      name: 'isPrimary',
    }),
  );
  expect(ifNodeExpr.ifBranchTemplate[0]).toEqual(
    expect.objectContaining({
      value: 'btn-primary',
    }),
  );
  expect(ifNodeExpr.elseBranchTemplate![0]).toEqual(
    expect.objectContaining({
      value: 'btn-secondary',
    }),
  );
});

test('It parses a template with for in statement', () => {
  const scanner = new Scanner(`
     <ul>
      {% for user in users %}
        <li>{{ user.name }}</li>
      {% endfor %}
    </ul>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0] as ElementNodeExpr;

  const forNodeExpr = parsed.children[0][0] as ForNodeExpr;
  expect(forNodeExpr.iterVariable).toEqual(
    expect.objectContaining({
      name: 'user',
    }),
  );
  expect(forNodeExpr.collectionVariable).toEqual(
    expect.objectContaining({
      name: 'users',
    }),
  );

  const liChild = forNodeExpr.bodyTemplate[0] as ElementNodeExpr;
  const userNameVar = liChild.children[0][0] as VariableExpr;
  expect(userNameVar).toEqual(
    expect.objectContaining({
      name: 'user.name',
    }),
  );
});
