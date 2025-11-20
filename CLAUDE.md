# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Templator** is a template engine that parses HTML templates with dynamic syntax support. It transforms template strings into either DOM elements or HTML strings. The engine supports:
- Variable interpolation: `{{ variableName }}`
- Conditional rendering: `{% if condition %} ... {% else %} ... {% endif %}`
- Iteration: `{% for item in collection %} ... {% endfor %}`
- Event handlers: `@click="handlerName"`, `@mouseover="handlerName"`, etc.

The project demonstrates classic compiler architecture with clean separation between lexical analysis (scanner), syntax analysis (parser), and interpretation (visitor pattern).

## Common Commands

### Build & Development
```bash
npm run build          # Build library with Parcel to dist/
npm start             # Serve demo at demo/index.html with hot reload
```

### Testing & Quality
```bash
npm test              # Run Jest tests with ES modules support (NODE_OPTIONS=--experimental-vm-modules)
npm test -- --watch  # Run tests in watch mode
npm test -- path/to/test.ts  # Run specific test file
npm run lint          # Check code with ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run check         # Run lint and format together
```

### TypeScript
Configuration in `tsconfig.json`:
- Target: ESNext
- Strict mode enabled
- DOM and ESNext library support
- Imports can include TypeScript extensions

## Architecture & Pipeline

The project follows a **three-stage compiler architecture**:

### Stage 1: Scanner (Lexical Analysis)
**File**: `src/compiler/scanner/scanner.ts`

Converts template strings into tokens using a **mode stack system**:
- Maintains parsing context (Text, OpenTag, AttrName, VarIdentifier, Statement, etc.)
- Recognizes HTML tags, attributes, variables (`{{ }}`), and control flow statements (`{% %}`)
- Produces token stream with type, lexeme, and line information

**Token Categories**:
- HTML: `TagOpen`, `TagClose`, `TagEndClose`, `TagName`
- Attributes: `AttrName`, `AttrValue`, `Equal`, `Quote`, `AtSign`
- Event handlers: `AtSign` (`@`), then `AttrName` (event name)
- Variables: `VarOpen` (`{{`), `VarClose` (`}}`), `Identifier`
- Statements: `StmtOpen` (`{%`), `StmtClose` (`%}`), `If`, `Else`, `For`, `In`, etc.

### Stage 2: Parser (Syntax Analysis)
**File**: `src/compiler/parser/parser.ts`

Builds an Abstract Syntax Tree (AST) from tokens using recursive descent parsing.

**Grammar Supports**:
- Element nodes with attributes (attributes support variables and conditionals)
- Event handlers on elements (e.g., `@click="handlerName"`)
- Text nodes
- Variable expressions (supports dot notation like `user.name`)
- If/else blocks
- For loops with collection iteration
- Variables in multiple contexts (element content, attributes, control flow)

**Key Methods**:
- `parse()`: Main entry point
- `parseElementNode()`: Parse HTML elements and attached event handlers
- `parseAttributes()`: Parse element attributes and event handlers (returns both)
- `parseEventHandler()`: Parse `@eventName="handlerName"` syntax
- `parseIfElse()`: Parse conditional blocks
- `parseForStmt()`: Parse loops

### Stage 3: Interpreter (Execution via Visitor Pattern)
**Files**:
- `src/core/expressions.ts` - AST node definitions & Visitor interface
- `src/interpreters/stringInterpreter.ts` - Renders to HTML string
- `src/interpreters/domInterpreter.ts` - Renders to DOM elements

**AST Nodes**:
- `TextNodeExpr` - Plain text content
- `ElementNodeExpr` - HTML element with tag name, attributes, and eventHandlers
- `AttributeExpr` - Element attribute with name and value
- `VariableExpr` - Template variable reference
- `IfNodeExpr` - Conditional block
- `ForNodeExpr` - Loop iteration
- `EventHandlerExpr` - Event handler binding (NOT an AccepterInterface, stored in ElementNodeExpr)

**Visitor Pattern Benefits**:
- AST nodes are decoupled from operations
- Easy to add new output formats without modifying nodes
- Multiple interpretation strategies from single AST

**Supported Visitors**:
1. `StringInterpreter` - Produces HTML string with whitespace normalization (ignores event handlers)
2. `DomInterpreter` - Produces DOM elements for browser with event handler attachment

**Event Handlers** (DomInterpreter only):
- Defined in template: `<button @click="onButtonClick">Click</button>`
- Passed to DomInterpreter constructor as second parameter: `new DomInterpreter(context, handlers)`
- Each handler receives `(event: Event, context: Record<string, unknown>)` parameters
- Handlers are automatically attached via `addEventListener` during DOM creation

### Data Flow Example

```
Input: {% for user in users %}<li @click="onUserClick">{{ user.name }}</li>{% endfor %}
        ↓
[Scanner] → [ForNode, ElementNode, VariableNode, EventHandlerNode, ...]
        ↓
[Parser] → ForNodeExpr {
             iterVar: user,
             collection: users,
             bodyTemplate: ElementNodeExpr {
               tagName: 'li',
               eventHandlers: [EventHandlerExpr { eventName: 'click', handlerName: 'onUserClick' }],
               children: [VariableNode]
             }
           }
        ↓
[Interpreter] → StringInterpreter (ignores handlers) OR DomInterpreter (attaches handlers)
        ↓
Output: <li>John</li><li>Jane</li> OR HTMLElement[] with click listeners
```

## Code Organization

```
src/
├── index.ts                                # Entry point & demo usage
├── types.ts                                # Shared types (ResultType<T, E>)
├── core/
│   └── expressions.ts                      # AST nodes & Visitor interface
├── compiler/
│   ├── constants.ts                        # TokenType enum, ScannerMode, keywords
│   ├── token.ts                            # Token type definition
│   ├── scanner/
│   │   ├── scanner.ts                      # Tokenization (lexical analysis)
│   │   └── scanner.test.ts                 # Scanner tests
│   └── parser/
│       ├── parser.ts                       # AST building (syntax analysis)
│       └── parser.test.ts                  # Parser tests
└── interpreters/
    ├── domInterpreter.ts                   # DOM rendering visitor
    ├── domInterpreter.test.ts              # DOM interpreter tests
    ├── stringInterpreter.ts                # String rendering visitor
    └── stringInterpreter.test.ts           # String rendering tests
```

## Key Design Patterns

1. **Visitor Pattern**: Each AST node has `accept<R>(visitor: ExpVisitorInterface<R>): R` method. Visitors implement logic for each node type without modifying node classes.

2. **Mode Stack**: Scanner uses a stack to track parsing context, enabling context-aware tokenization that properly handles nested HTML tags, attributes, and template syntax.

3. **Recursive Descent Parsing**: Parser uses recursive methods for each grammar rule, making the parsing logic straightforward and maintainable.

4. **Strategy Pattern**: Multiple interpreter implementations (StringInterpreter, DomInterpreter) for different output formats, all working with the same AST.

## Development Notes

### Testing Strategy
- **Scanner tests**: Validate token generation for various template structures
- **Parser tests**: Validate AST structure and grammar correctness
- **Interpreter tests**: Validate rendering output and context variable handling

### When Adding Features
1. Add token type to `TokenType` enum in `src/compiler/constants.ts`
2. Update scanner mode logic in `src/compiler/scanner/scanner.ts` if needed
3. Update parser grammar and methods in `src/compiler/parser/parser.ts`
4. Add AST node type in `src/core/expressions.ts` if needed
5. Implement visitor methods in interpreter classes in `src/interpreters/`
6. Add tests alongside the implementation files

### Configuration
- **ESLint**: Uses @eslint/js and typescript-eslint, ignores node_modules, dist, coverage, markdown
- **Prettier**: 100 char line width, 2 space tabs, single quotes, trailing commas
- **TypeScript**: Strict mode enabled, ES modules, DOM library support

## Current Implementation (V2)

The template engine uses a full compiler architecture with proper compiler stages:
- Complete HTML parsing with proper tag and attribute handling
- Variable interpolation with dot notation (e.g., `user.profile.name`)
- Conditional rendering with if/else blocks
- Loop support with for...in iteration
- Event handler binding via `@eventName="handlerName"` syntax (DomInterpreter only)
- AST-based architecture enabling multiple interpretation strategies
- Multiple output formats (HTML strings and DOM elements)

### Event Handler Architecture

Event handlers are **NOT** part of the visitor pattern. Instead, they are:
- Stored directly in `ElementNodeExpr.eventHandlers: EventHandlerExpr[]`
- Parsed by `Parser.parseEventHandler()` method
- Attached by `DomInterpreter` during element creation via `addEventListener`
- Ignored by `StringInterpreter` (not included in HTML output)

This design keeps event handling logic separate from the core visitor pattern, as handlers are DOM-specific concerns that don't apply to string rendering.

### Example with Event Handlers

```typescript
const interpreter = new DomInterpreter(
  { users: [{ name: 'Alice' }, { name: 'Bob' }] },
  {
    onUserClick: (event, context) => {
      console.log(`Clicked on: ${(event.target as HTMLElement).textContent}`);
    }
  }
);
```

Template: `<button @click="onUserClick">Click me</button>`
