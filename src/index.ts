import { Scanner } from './compiler/scanner/scanner.js';
import { Parser } from './compiler/parser/parser.js';
import { DomInterpreter } from './interpreters/domInterpreter.js';

export const render = () => {
  const scanner = new Scanner(`
    {% for user in users %}
      <li class="user-item" @click="onUserClick">
        <span class="user-name">{{ user.name }}</span>
      </li>
    {% endfor %}
  `);

  const tokens = scanner.startScan();
  const parser = new Parser(tokens);
  const parsed = parser.parse()![0];

  const domInterpreter = new DomInterpreter(
    {
      users: [
        { name: 'John Doe' },
        { name: 'Jane Smith' },
        { name: 'Bob Johnson' },
        { name: 'Alice Williams' },
      ],
    },
    {
      onUserClick: (event) => {
        const target = event.target as HTMLElement;
        const name = target.textContent || 'Unknown';
        console.log(`Clicked on: ${name}`);
      },
    },
  );

  const result = parsed.accept(domInterpreter);
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.appendChild(result);
  }
};
