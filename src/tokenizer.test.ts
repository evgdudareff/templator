import { Tokenizer } from './tokenizer.ts';
import { VALIDATION_ERROR_MESSAGE } from './tokenizerValidator.ts';

const tokenizer = new Tokenizer();

test('It parses template with 2 variables and text into correct tokens', () => {
  const expectedTokens = [
    { type: 'text', value: 'Hello, ' },
    { type: 'var', name: 'name' },
    { type: 'text', value: '! And here is the second var ' },
    { type: 'var', name: 'surname' },
    { type: 'text', value: '.' },
  ];

  const result = tokenizer.parse('Hello, {{ name }}! And here is the second var {{surname}}.');

  if (result.success) {
    result.value.forEach((value, index) => {
      expect(value).toEqual(expectedTokens[index]);
    });
  }
});

test('It parses template with 1 variables and empty space around it', () => {
  const expectedTokens = [
    { type: 'text', value: 'Hello, ' },
    { type: 'var', name: 'name' },
    { type: 'text', value: '!' },
  ];

  const result = tokenizer.parse('Hello, {{    name }}!');

  if (result.success) {
    result.value.forEach((value, index) => {
      expect(value).toEqual(expectedTokens[index]);
    });
  }
});

test('It parses template with 1 variables without empty space around it', () => {
  const expectedTokens = [
    { type: 'text', value: 'Hello, ' },
    { type: 'var', name: 'name' },
    { type: 'text', value: '!' },
  ];

  const result = tokenizer.parse('Hello, {{name}}!');

  if (result.success) {
    result.value.forEach((value, index) => {
      expect(value).toEqual(expectedTokens[index]);
    });
  }
});

test('It parses template with 1 variables with emoji value', () => {
  const result = tokenizer.parse('{{ 😊 }}');

  if (result.success) {
    expect(result.value).toEqual([{ type: 'var', name: '😊' }]);
  }
});

test('It fails if variable is missed', () => {
  const result = tokenizer.parse('Hello, {{ name }}! And here is the second var {{ }}.');

  if (!result.success) {
    expect(result.error.message).toEqual(VALIDATION_ERROR_MESSAGE);
  }
});

test('It fails if variable is malformed', () => {
  const forbiddenStrings = ['Hello, {{ user<script>}}!', 'Hello, {{ config|{a:1} }}!'];

  forbiddenStrings.forEach((value, index) => {
    const result = tokenizer.parse(forbiddenStrings[index]);
    if (!result.success) {
      expect(result.error.message).toEqual(VALIDATION_ERROR_MESSAGE);
    }
  });
});
