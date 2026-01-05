# Templator

Лёгкий шаблонизатор для обработки HTML-шаблонов с поддержкой динамического синтаксиса. Templator использует полную архитектуру компилятора (сканер → парсер → интерпретатор) для преобразования строк шаблонов в элементы DOM или HTML-строки.

## Возможности

- **Интерполяция переменных**: `{{ variableName }}` с поддержкой точечной нотации (`{{ user.profile.name }}`)
- **Условный рендеринг**: `{% if condition %} ... {% else %} ... {% endif %}`
- **Итерация по коллекциям**: `{% for item in collection %} ... {% endfor %}`
- **Обработчики событий**: `@click="handlerName"`, `@mouseover="handlerName"` и т.д.
- **Множественные форматы вывода**: рендеринг в элементы DOM или HTML-строки
- **Поддержка TypeScript**: полностью типизирован с определениями TypeScript
- **Архитектура компилятора**: чистое разделение ответственности между этапами сканера, парсера и интерпретатора

## Установка

```bash
npm install templator
```

## Быстрый старт

### Рендеринг в DOM (браузер)

```typescript
import { Scanner, Parser, DomInterpreter } from 'templator';

const template = `
  {% for user in users %}
    <li @click="onUserClick">{{ user.name }}</li>
  {% endfor %}
`;

const scanner = new Scanner(template);
const tokens = scanner.startScan();
const parser = new Parser(tokens);
const ast = parser.parse();

const interpreter = new DomInterpreter(
  {
    users: [
      { name: 'Alice' },
      { name: 'Bob' }
    ]
  },
  {
    onUserClick: (event, context) => {
      console.log('User clicked:', event.target.textContent);
    }
  }
);

const domElement = ast[0].accept(interpreter);
document.getElementById('app').appendChild(domElement);
```

### Рендеринг в строку (SSR/бэкенд)

```typescript
import { Scanner, Parser, StringInterpreter } from 'templator';

const template = `
  <h1>{{ title }}</h1>
  {% if loggedIn %}
    <p>Welcome, {{ user.name }}!</p>
  {% else %}
    <p>Please log in</p>
  {% endif %}
`;

const scanner = new Scanner(template);
const tokens = scanner.startScan();
const parser = new Parser(tokens);
const ast = parser.parse();

const interpreter = new StringInterpreter({
  title: 'My App',
  loggedIn: true,
  user: { name: 'Alice' }
});

const html = ast[0].accept(interpreter);
console.log(html);
// Output: <h1>My App</h1><p>Welcome, Alice!</p>
```

## Документация API

### Scanner

Преобразует строки шаблонов в поток токенов.

```typescript
const scanner = new Scanner(templateString);
const tokens = scanner.startScan();
```

### Parser

Строит абстрактное синтаксическое дерево (AST) из токенов, используя рекурсивный спуск.

```typescript
const parser = new Parser(tokens);
const ast = parser.parse(); // Returns Array<ExpVisitorInterface>
```

### DomInterpreter

Преобразует AST в элементы DOM с подключением обработчиков событий.

```typescript
const interpreter = new DomInterpreter(
  context,           // Data context: Record<string, unknown>
  handlers           // Event handlers: Record<string, (event: Event, context: any) => void>
);
const domElement = ast[0].accept(interpreter);
```

### StringInterpreter

Преобразует AST в HTML-строку (игнорирует обработчики событий).

```typescript
const interpreter = new StringInterpreter(context);
const html = ast[0].accept(interpreter);
```

## Справка по синтаксису

### Переменные

Получайте доступ к свойствам контекста с помощью точечной нотации:

```
{{ user }}
{{ user.name }}
{{ user.profile.email }}
```

### Условия

```
{% if condition %}
  <p>Shown when true</p>
{% else %}
  <p>Shown when false</p>
{% endif %}
```

### Циклы

```
{% for item in collection %}
  <li>{{ item.name }}</li>
{% endfor %}
```

### Обработчики событий (только DOM)

Прикрепляйте обработчики событий к элементам:

```
<button @click="onButtonClick">Click me</button>
<input @input="onInputChange" />
```

Предоставляйте обработчики при создании DomInterpreter:

```typescript
{
  onButtonClick: (event, context) => { /* ... */ },
  onInputChange: (event, context) => { /* ... */ }
}
```

## Архитектура

Templator следует трёхэтапной архитектуре компилятора:

1. **Scanner (лексический анализ)**: преобразует строки шаблонов в токены
2. **Parser (синтаксический анализ)**: строит AST из токенов
3. **Interpreter (выполнение)**: проходит по AST с использованием паттерна visitor

Это чистое разделение даёт:
- Множественные форматы вывода (DOM, строка и т.д.)
- Простоту расширения для новых функций
- Чёткую обработку ошибок на каждом этапе

## Лицензия

MIT © e.dudarev
