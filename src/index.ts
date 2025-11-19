import { Scanner } from './compiler/scanner/scanner.js';
import { Parser } from './compiler/parser/parser.js';
import { DomInterpreter } from './interpreters/domInterpreter.js';

export const render = () => {
  const scanner = new Scanner(`
     <li class="abs bcd">test </li>
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];
  const domInterpreter = new DomInterpreter({
    users: [{ name: 'John' }, { name: 'Jane' }, { name: 'Doe' }],
  });
  const result = parsed.accept(domInterpreter);
  document.body.appendChild(result);
};
