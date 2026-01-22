// KerML Expression Grammar
// Defines the expression hierarchy with operator precedence

grammar KerMLExpressions

// ============================================================
// Expression Hierarchy (precedence from lowest to highest)
// ============================================================

// Level 0: Conditional expression (lowest precedence)
Expression:
    ConditionalExpression;

ConditionalExpression infers Expression:
    NullCoalescingExpression ({infer ConditionalExpression.condition=current} '?' thenExpr=Expression ':' elseExpr=ConditionalExpression)?;

// Level 1: Null coalescing
NullCoalescingExpression infers Expression:
    ImpliesExpression ({infer NullCoalescingExpression.left=current} '??' right=ImpliesExpression)*;

// Level 2: Implies (logical implication)
ImpliesExpression infers Expression:
    OrExpression ({infer ImpliesExpression.left=current} ('implies' | '=>') right=OrExpression)*;

// Level 3: Or (logical disjunction)
OrExpression infers Expression:
    XorExpression ({infer OrExpression.left=current} ('or' | '|') right=XorExpression)*;

// Level 4: Xor (exclusive or)
XorExpression infers Expression:
    AndExpression ({infer XorExpression.left=current} 'xor' right=AndExpression)*;

// Level 5: And (logical conjunction)
AndExpression infers Expression:
    EqualityExpression ({infer AndExpression.left=current} ('and' | '&') right=EqualityExpression)*;

// Level 6: Equality
EqualityExpression infers Expression:
    ClassificationExpression ({infer EqualityExpression.left=current} operator=EqualityOperator right=ClassificationExpression)*;

EqualityOperator returns string:
    '==' | '!=' | '===' | '!==';

// Level 7: Classification
ClassificationExpression infers Expression:
    RelationalExpression ({infer ClassificationExpression.left=current} operator=ClassificationOperator type=QualifiedName)?;

ClassificationOperator returns string:
    'hastype' | 'istype' | '@' | 'as' | 'meta';

// Level 8: Relational
RelationalExpression infers Expression:
    RangeExpression ({infer RelationalExpression.left=current} operator=RelationalOperator right=RangeExpression)?;

RelationalOperator returns string:
    '<' | '>' | '<=' | '>=';

// Level 9: Range expression
RangeExpression infers Expression:
    AdditiveExpression ({infer RangeExpression.left=current} '..' right=AdditiveExpression)?;

// Level 10: Additive
AdditiveExpression infers Expression:
    MultiplicativeExpression ({infer AdditiveExpression.left=current} operator=AdditiveOperator right=MultiplicativeExpression)*;

AdditiveOperator returns string:
    '+' | '-';

// Level 11: Multiplicative
MultiplicativeExpression infers Expression:
    ExponentiationExpression ({infer MultiplicativeExpression.left=current} operator=MultiplicativeOperator right=ExponentiationExpression)*;

MultiplicativeOperator returns string:
    '*' | '/' | '%';

// Level 12: Exponentiation (right associative)
ExponentiationExpression infers Expression:
    UnaryExpression ({infer ExponentiationExpression.left=current} ('**' | '^') right=ExponentiationExpression)?;

// Level 13: Unary
UnaryExpression infers Expression:
    {infer UnaryExpression} operator=UnaryOperator operand=UnaryExpression |
    ExtentExpression;

UnaryOperator returns string:
    '+' | '-' | '!' | '~' | 'not';

// Level 14: Extent
ExtentExpression infers Expression:
    {infer ExtentExpression} 'all' type=QualifiedName |
    PrimaryExpression;

// ============================================================
// Primary Expressions
// ============================================================

PrimaryExpression infers Expression:
    BaseExpression ({infer FeatureChainExpression.source=current} ('.' feature=FeatureReference)+)?;

FeatureReference:
    name=QualifiedName;

BaseExpression infers Expression:
    LiteralExpression |
    NameExpression |
    InvocationExpression |
    BodyExpression |
    MetadataAccessExpression |
    BracketExpression |
    '(' Expression ')';

// Literal expressions
LiteralExpression:
    LiteralBoolean |
    LiteralInteger |
    LiteralReal |
    LiteralString |
    LiteralNull;

LiteralBoolean:
    value?='true' | 'false';

LiteralInteger:
    value=INTEGER;

LiteralReal:
    value=REAL;

LiteralString:
    value=STRING;

LiteralNull:
    {infer LiteralNull} 'null';

// Name reference expression
NameExpression:
    name=QualifiedName;

// Invocation (function call)
InvocationExpression:
    name=QualifiedName '(' (arguments+=Argument (',' arguments+=Argument)*)? ')';

Argument:
    (name=Name '=>')? value=Expression;

// Body expression (block returning value)
BodyExpression:
    '{' statements+=Expression* '}';

// Metadata access
MetadataAccessExpression:
    source=QualifiedName '.' '@' metadata=QualifiedName;

// Bracket expression (indexing, filtering)
BracketExpression:
    '[' expression=Expression ']';

// ============================================================
// Qualified Name (imported from common)
// ============================================================

QualifiedName:
    names+=Name ('::' names+=Name)*;

Name:
    ID | UNRESTRICTED_NAME;

// ============================================================
// Terminal Rules
// ============================================================

terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;
terminal UNRESTRICTED_NAME: /'([^'\\]|\\.)*'/;
terminal STRING: /"([^"\\]|\\.)*"/;
terminal INTEGER: /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|[0-9]+/;
terminal REAL: /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?|[0-9]+[eE][+-]?[0-9]+/;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal WS: /\s+/;
