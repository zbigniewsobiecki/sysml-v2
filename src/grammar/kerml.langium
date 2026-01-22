// KerML (Kernel Modeling Language) Grammar
// The foundation language for SysML v2

grammar KerML

// ============================================================
// Root and Namespace
// ============================================================

entry RootNamespace:
    {infer RootNamespace}
    namespaceElements+=NamespaceElement*;

NamespaceElement:
    Import | AliasMember | NamespaceMember;

// ============================================================
// Imports
// ============================================================

Import:
    visibility=VisibilityIndicator?
    'import' isAll?='all'? importRef=ImportReference ';';

ImportReference:
    name=QualifiedName (isRecursive?='::' '**' | '::' '*')?;

// ============================================================
// Namespace Members
// ============================================================

NamespaceMember:
    visibility=VisibilityIndicator?
    element=Element;

AliasMember:
    visibility=VisibilityIndicator?
    'alias' name=Name 'for' target=QualifiedName ';';

// ============================================================
// Elements (Abstract base)
// ============================================================

Element:
    Comment | Documentation | TextualRepresentation |
    Namespace | Package |
    Type | Classifier | Class | DataType | Structure | Association | AssociationStructure |
    Feature | Step | Expression | BooleanExpression |
    Function | Predicate | Behavior | Interaction |
    Connector | BindingConnector | Succession | ItemFlow |
    Metaclass | MetadataFeature |
    Multiplicity | Specialization | FeatureTyping | Subclassification |
    Subsetting | Redefinition | FeatureInverting | TypeFeaturing |
    Dependency;

// ============================================================
// Annotations
// ============================================================

Comment:
    'comment' name=Name? (aboutMembership+=AboutMembership)? body=COMMENT_BODY;

AboutMembership:
    'about' about+=QualifiedName (',' about+=QualifiedName)*;

Documentation:
    'doc' name=Name? body=COMMENT_BODY;

TextualRepresentation:
    'rep' name=Name? 'language' language=STRING body=COMMENT_BODY;

// ============================================================
// Namespaces and Packages
// ============================================================

Namespace:
    prefixes+=NamespacePrefix*
    'namespace' name=Name? NamespaceBody;

Package:
    prefixes+=NamespacePrefix*
    'package' name=Name? NamespaceBody;

fragment NamespacePrefix:
    visibility=VisibilityIndicator? isStandard?='standard'? isLibrary?='library'?;

fragment NamespaceBody:
    ';' | '{' namespaceElements+=NamespaceElement* '}';

// ============================================================
// Types
// ============================================================

Type:
    prefixes+=TypePrefix*
    'type' name=Name? TypeDeclaration NamespaceBody;

fragment TypePrefix:
    visibility=VisibilityIndicator?
    isAbstract?='abstract'?
    isSufficient?='all'?;

fragment TypeDeclaration:
    (multiplicity=MultiplicityBounds)?
    (specialization=SpecializationPart)?
    (conjugation=ConjugationPart)?
    (disjoining=DisjoiningPart)?
    (intersecting=IntersectingPart)?
    (differencing=DifferencingPart)?
    (unioning=UnioningPart)?;

SpecializationPart:
    (':>' | 'specializes') types+=QualifiedName (',' types+=QualifiedName)*;

ConjugationPart:
    '~' type=QualifiedName;

DisjoiningPart:
    'disjoint' 'from' types+=QualifiedName (',' types+=QualifiedName)*;

IntersectingPart:
    'intersects' types+=QualifiedName (',' types+=QualifiedName)*;

DifferencingPart:
    'differences' types+=QualifiedName (',' types+=QualifiedName)*;

UnioningPart:
    'unions' types+=QualifiedName (',' types+=QualifiedName)*;

// ============================================================
// Classifiers
// ============================================================

Classifier:
    prefixes+=TypePrefix*
    'classifier' name=Name? TypeDeclaration NamespaceBody;

Class:
    prefixes+=TypePrefix*
    'class' name=Name? TypeDeclaration NamespaceBody;

DataType:
    prefixes+=TypePrefix*
    'datatype' name=Name? TypeDeclaration NamespaceBody;

Structure:
    prefixes+=TypePrefix*
    'struct' name=Name? TypeDeclaration NamespaceBody;

Association:
    prefixes+=TypePrefix*
    'assoc' name=Name? TypeDeclaration NamespaceBody;

AssociationStructure:
    prefixes+=TypePrefix*
    'assoc' 'struct' name=Name? TypeDeclaration NamespaceBody;

// ============================================================
// Features
// ============================================================

Feature:
    prefixes+=FeaturePrefix*
    'feature'? name=Name? FeatureDeclaration FeatureBody;

fragment FeaturePrefix:
    visibility=VisibilityIndicator?
    direction=FeatureDirection?
    isAbstract?='abstract'?
    isReadonly?='readonly'?
    isDerived?='derived'?
    isEnd?='end'?
    isComposite?='composite'?
    isPortion?='portion'?;

FeatureDirection returns string:
    'in' | 'out' | 'inout';

fragment FeatureDeclaration:
    (typing=FeatureTypingPart)?
    (multiplicity=MultiplicityBounds)?
    (specialization=FeatureSpecializationPart)?
    (valueExpression=FeatureValue)?;

FeatureTypingPart:
    (':' | 'typed' 'by') types+=QualifiedName (',' types+=QualifiedName)*;

FeatureSpecializationPart:
    (subsetting=SubsettingPart)?
    (redefinition=RedefinitionPart)?;

SubsettingPart:
    (':>' | 'subsets') features+=QualifiedName (',' features+=QualifiedName)*;

RedefinitionPart:
    (':>>' | 'redefines') features+=QualifiedName (',' features+=QualifiedName)*;

FeatureValue:
    isDefault?='default'? (isInitial?='=' | ':=' | '::=') value=ExpressionBody;

fragment FeatureBody:
    ';' | '{' featureElements+=FeatureElement* '}';

FeatureElement:
    NamespaceElement | TypeRelationship;

TypeRelationship:
    Specialization | FeatureTyping | Subclassification |
    Subsetting | Redefinition | FeatureInverting | TypeFeaturing;

// ============================================================
// Behaviors and Steps
// ============================================================

Behavior:
    prefixes+=TypePrefix*
    'behavior' name=Name? TypeDeclaration NamespaceBody;

Step:
    prefixes+=FeaturePrefix*
    'step' name=Name? FeatureDeclaration FeatureBody;

Function:
    prefixes+=TypePrefix*
    'function' name=Name? TypeDeclaration NamespaceBody;

Predicate:
    prefixes+=TypePrefix*
    'predicate' name=Name? TypeDeclaration NamespaceBody;

Interaction:
    prefixes+=TypePrefix*
    'interaction' name=Name? TypeDeclaration NamespaceBody;

// ============================================================
// Expressions (as Features)
// ============================================================

Expression:
    prefixes+=FeaturePrefix*
    'expr' name=Name? FeatureDeclaration FeatureBody;

BooleanExpression:
    prefixes+=FeaturePrefix*
    'bool' name=Name? FeatureDeclaration FeatureBody;

// ============================================================
// Connectors
// ============================================================

Connector:
    prefixes+=FeaturePrefix*
    'connector' name=Name? ConnectorDeclaration FeatureBody;

fragment ConnectorDeclaration:
    (typing=FeatureTypingPart)?
    'from'? sourceEnd=ConnectorEnd 'to' targetEnd=ConnectorEnd;

ConnectorEnd:
    (name=Name references?='references'?)? feature=QualifiedName (multiplicity=MultiplicityBounds)?;

BindingConnector:
    prefixes+=FeaturePrefix*
    'binding' name=Name? 'of' sourceEnd=ConnectorEnd '=' targetEnd=ConnectorEnd ';';

Succession:
    prefixes+=FeaturePrefix*
    'succession' name=Name? SuccessionDeclaration FeatureBody;

fragment SuccessionDeclaration:
    (typing=FeatureTypingPart)?
    'first'? sourceEnd=ConnectorEnd 'then' targetEnd=ConnectorEnd;

ItemFlow:
    prefixes+=FeaturePrefix*
    'flow' name=Name? ItemFlowDeclaration FeatureBody;

fragment ItemFlowDeclaration:
    (item=ItemFeature)?
    'from' sourceEnd=ConnectorEnd 'to' targetEnd=ConnectorEnd;

ItemFeature:
    'of' (name=Name)? (typing=FeatureTypingPart)?;

// ============================================================
// Relationships
// ============================================================

Specialization:
    'specialization' name=Name? 'subtype' subtype=QualifiedName 'specializes' supertype=QualifiedName ';';

FeatureTyping:
    'featuring' name=Name? 'typed' typedFeature=QualifiedName 'by' featureType=QualifiedName ';';

Subclassification:
    'subclassification' name=Name? 'subclassifier' subclassifier=QualifiedName 'specializes' superclassifier=QualifiedName ';';

Subsetting:
    'subset' name=Name? 'subset' subsettingFeature=QualifiedName 'subsets' subsettedFeature=QualifiedName ';';

Redefinition:
    'redefinition' name=Name? 'redefines' redefiningFeature=QualifiedName 'by' redefinedFeature=QualifiedName ';';

FeatureInverting:
    'inverting' name=Name? 'inverse' featureInverted=QualifiedName 'of' invertingFeature=QualifiedName ';';

TypeFeaturing:
    'featuring' name=Name? 'of' featureOfType=QualifiedName 'by' featuringType=QualifiedName ';';

Dependency:
    prefixes+=NamespacePrefix*
    'dependency' name=Name? 'from' clients+=QualifiedName (',' clients+=QualifiedName)* 'to' suppliers+=QualifiedName (',' suppliers+=QualifiedName)* ';';

// ============================================================
// Metadata
// ============================================================

Metaclass:
    prefixes+=TypePrefix*
    'metaclass' name=Name? TypeDeclaration NamespaceBody;

MetadataFeature:
    '@' name=Name? (':' | 'typed' 'by')? type=QualifiedName MetadataBody;

fragment MetadataBody:
    ';' | '{' metadataElements+=MetadataBodyElement* '}';

MetadataBodyElement:
    feature=Name '=' value=MetadataValue ';';

MetadataValue:
    LiteralValue | QualifiedName | '[' (values+=MetadataValue (',' values+=MetadataValue)*)? ']';

LiteralValue:
    LiteralBooleanValue | LiteralIntegerValue | LiteralRealValue | LiteralStringValue | LiteralNullValue;

LiteralBooleanValue:
    value?='true' | {infer LiteralBooleanValue} 'false';

LiteralIntegerValue:
    value=INTEGER;

LiteralRealValue:
    value=REAL;

LiteralStringValue:
    value=STRING;

LiteralNullValue:
    {infer LiteralNullValue} 'null';

// ============================================================
// Multiplicity
// ============================================================

Multiplicity:
    'multiplicity' name=Name? MultiplicityBounds? (':>' | 'subsets')? subsets=QualifiedName? ';';

MultiplicityBounds:
    '[' (lowerBound=MultiplicityBound '..')? upperBound=MultiplicityBound ']';

MultiplicityBound:
    INTEGER | '*';

// ============================================================
// Expression Bodies
// ============================================================

ExpressionBody:
    OperatorExpression | FeatureReferenceExpression | LiteralExpression | NullExpression |
    InvocationExpression | BodyExpressionMember | '(' ExpressionBody ')';

OperatorExpression:
    left=ExpressionBody operator=Operator right=ExpressionBody;

Operator returns string:
    '+' | '-' | '*' | '/' | '%' | '**' | '^' |
    '==' | '!=' | '<' | '>' | '<=' | '>=' |
    'and' | 'or' | 'xor' | 'not' | 'implies' |
    '&' | '|' | '!' | '~' |
    '..' | '??' | '=>';

FeatureReferenceExpression:
    expression=QualifiedName;

LiteralExpression:
    LiteralBooleanValue | LiteralIntegerValue | LiteralRealValue | LiteralStringValue;

NullExpression:
    {infer NullExpression} 'null';

InvocationExpression:
    type=QualifiedName '(' (arguments+=ExpressionBody (',' arguments+=ExpressionBody)*)? ')';

BodyExpressionMember:
    '{' statements+=ExpressionBody* '}';

// ============================================================
// Common
// ============================================================

QualifiedName:
    names+=Name ('::' names+=Name)*;

Name:
    ID | UNRESTRICTED_NAME;

VisibilityIndicator returns string:
    'public' | 'private' | 'protected';

// ============================================================
// Terminal Rules
// ============================================================

terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;
terminal UNRESTRICTED_NAME: /'([^'\\]|\\.)*'/;
terminal STRING: /"([^"\\]|\\.)*"/;
terminal INTEGER: /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|[0-9]+/;
terminal REAL: /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?|[0-9]+[eE][+-]?[0-9]+/;
terminal COMMENT_BODY: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal WS: /\s+/;
