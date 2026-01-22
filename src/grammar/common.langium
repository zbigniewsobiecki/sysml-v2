// Common terminal rules shared between KerML and SysML
// Based on SysML v2 specification EBNF grammar

grammar SysMLCommon

// ============================================================
// Entry rule - will be overridden in main grammar
// ============================================================
entry RootNamespace:
    {infer RootNamespace}
    namespaceElements+=NamespaceMember*;

NamespaceMember:
    {infer NamespaceMember}
    visibility=Visibility?
    element=MemberElement;

MemberElement:
    Package | PartDefinition | PartUsage | Comment;

Package:
    'package' name=Name BodyOrEmpty;

PartDefinition:
    isAbstract?='abstract'? 'part' 'def' name=Name BodyOrEmpty;

PartUsage:
    'part' name=Name (':' typings+=QualifiedName (',' typings+=QualifiedName)*)? BodyOrEmpty;

Comment:
    'comment' name=Name? 'about' about+=QualifiedName (',' about+=QualifiedName)* CommentBody;

fragment BodyOrEmpty:
    body=NamespaceBody | ';';

NamespaceBody:
    '{' members+=NamespaceMember* '}';

// ============================================================
// Names and Qualified Names
// ============================================================
Name:
    ID | UNRESTRICTED_NAME;

QualifiedName:
    names+=Name ('::' names+=Name)*;

// ============================================================
// Visibility
// ============================================================
Visibility returns string:
    'public' | 'private' | 'protected';

// ============================================================
// Terminal Rules
// ============================================================

// Basic identifier: starts with letter or underscore, followed by letters, digits, underscores
terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;

// Unrestricted name: any characters within single quotes
terminal UNRESTRICTED_NAME: /'([^'\\]|\\.)*'/;

// String literal: double-quoted string with escape sequences
terminal STRING: /"([^"\\]|\\.)*"/;

// Integer literal: decimal, binary, octal, or hexadecimal
terminal INTEGER:
    /0[xX][0-9a-fA-F]+/ |           // Hexadecimal
    /0[bB][01]+/ |                   // Binary
    /0[oO][0-7]+/ |                  // Octal
    /[0-9]+/;                        // Decimal

// Real number literal: decimal with optional exponent
terminal REAL:
    /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?/ |
    /[0-9]+[eE][+-]?[0-9]+/;

// Regular comment (line comment)
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

// Block comment
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;

// Documentation comment (preserved in AST in real implementation)
terminal DOCUMENTATION_COMMENT: /\/\*\*[\s\S]*?\*\//;

// Note comment
terminal NOTE_COMMENT: /\/\*\*<[\s\S]*?\*\//;

// Comment body for comment declarations
terminal CommentBody: /\/\*[\s\S]*?\*\//;

// Whitespace
hidden terminal WS: /\s+/;
