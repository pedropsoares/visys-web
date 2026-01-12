# Semantic Core

Public contract:
- tokenize(text): Token[]
- normalizeWord(token): string
- normalizeContext(phrase): string
- buildContextId(normalized): string

Examples (golden):

Input: "Hello, world!"
tokenize =>
[
  { kind: "WORD", value: "Hello" },
  { kind: "PUNCT", value: "," },
  { kind: "SPACE", value: " " },
  { kind: "WORD", value: "world" },
  { kind: "PUNCT", value: "!" }
]
normalizeWord("Hello") => "hello"
normalizeContext("Hello,   world!") => "hello world"

Input: "don’t stop"
tokenize includes "don’t" as a WORD token
normalizeContext("don’t stop") => "dont stop"

Input: "don't stop"
tokenize includes "don't" as a WORD token
normalizeContext("don't stop") => "don't stop"
