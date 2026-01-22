// SysML v2 Grammar
// Systems Modeling Language version 2.0
// Built on KerML (Kernel Modeling Language)

grammar SysML

// ============================================================
// Root Entry Point
// ============================================================

entry RootNamespace:
    {infer RootNamespace}
    namespaceElements+=NamespaceElement*;

NamespaceElement:
    Import | AliasMember | OwningMembership;

// ============================================================
// Imports
// ============================================================

Import:
    visibility=VisibilityIndicator?
    'import' isAll?='all'? importRef=ImportReference ';';

// Import reference handles qualified names with optional wildcard/recursive suffixes
// After each '::', check if it's '**', '*', or another name part
ImportReference:
    names+=NamePart ('::' (isRecursive?='**' | isWildcard?='*' | names+=NamePart))*;

// ============================================================
// Namespace Members
// ============================================================

OwningMembership:
    visibility=VisibilityIndicator?
    element=Element;

AliasMember:
    visibility=VisibilityIndicator?
    'alias' aliasName=Name 'for' target=QualifiedName ';';

// ============================================================
// Element (main dispatch)
// ============================================================

Element:
    // Annotations
    Comment | Documentation | TextualRepresentation | MetadataUsage |
    // Namespace elements
    Package | LibraryPackage |
    // KerML elements
    TypeDecl | Classifier | Class | DataType | Struct | Association |
    Behavior | FunctionDecl | Predicate | Interaction |
    Feature | Connector | BindingConnector | Succession | ItemFlow |
    // SysML Definitions
    AttributeDefinition | EnumerationDefinition | OccurrenceDefinition |
    ItemDefinition | PartDefinition | ConnectionDefinition | InterfaceDefinition |
    PortDefinition | FlowConnectionDefinition | AllocationDefinition |
    ActionDefinition | StateDefinition | CalculationDefinition | ConstraintDefinition |
    RequirementDefinition | ConcernDefinition | CaseDefinition |
    AnalysisCaseDefinition | VerificationCaseDefinition | UseCaseDefinition |
    ViewDefinition | ViewpointDefinition | RenderingDefinition | MetadataDefinition |
    // SysML Usages - order matters: specific keywords first, AttributeUsage last (has optional keyword)
    EnumerationUsage | OccurrenceUsage |
    ItemUsage | PartUsage | ConnectionUsage | InterfaceUsage |
    PortUsage | FlowConnectionUsage | AllocationUsage | Allocate |
    ActionUsage | StateUsage | CalculationUsage | ConstraintUsage |
    RequirementUsage | ConcernUsage | CaseUsage |
    AnalysisCaseUsage | VerificationCaseUsage | UseCaseUsage |
    ViewUsage | ViewpointUsage | RenderingUsage |
    AttributeUsage |  // Last because 'attribute' keyword is optional
    // Additional KerML relationship declarations
    Specialization | Subclassification | FeatureTypingDecl |
    Subsetting | Redefinition | Dependency;

// Shorthand allocate syntax: allocate x to y;
Allocate:
    'allocate' ConnectorEndsFragment ';';

// ============================================================
// Annotations
// ============================================================

// Shared structure for annotations (Comment, Documentation)
fragment AnnotationBaseFragment:
    name=Name?
    ('about' about+=QualifiedName (',' about+=QualifiedName)*)?
    ('language' language=STRING)?;

Comment:
    'comment' AnnotationBaseFragment body=COMMENT_BODY;

Documentation:
    'doc' AnnotationBaseFragment body=COMMENT_BODY;

TextualRepresentation:
    'rep' name=Name? 'language' language=STRING body=COMMENT_BODY;

// ============================================================
// Namespaces and Packages
// ============================================================

Package:
    'package' name=Name? PackageBody;

// Library package - isStandard is set to true when 'standard' keyword present
LibraryPackage:
    (isStandard?='standard')? 'library' 'package' name=Name? PackageBody;

PackageBody:
    {infer PackageBody} ';' | {infer PackageBody} '{' elements+=NamespaceElement* '}';

// ============================================================
// KerML Core Types
// ============================================================

TypeDecl:
    TypePrefixFragment 'type' name=Name? TypeSpecializationFragment? TypeBodyRule;

Classifier:
    TypePrefixFragment 'classifier' name=Name? TypeSpecializationFragment? TypeBodyRule;

Class:
    TypePrefixFragment 'class' name=Name? TypeSpecializationFragment? TypeBodyRule;

DataType:
    TypePrefixFragment 'datatype' name=Name? TypeSpecializationFragment? TypeBodyRule;

Struct:
    TypePrefixFragment 'struct' name=Name? TypeSpecializationFragment? TypeBodyRule;

Association:
    TypePrefixFragment 'assoc' isStruct?='struct'? name=Name? TypeSpecializationFragment? TypeBodyRule;

Behavior:
    TypePrefixFragment 'behavior' name=Name? TypeSpecializationFragment? TypeBodyRule;

FunctionDecl:
    TypePrefixFragment 'function' name=Name? TypeSpecializationFragment? TypeBodyRule;

Predicate:
    TypePrefixFragment 'predicate' name=Name? TypeSpecializationFragment? TypeBodyRule;

Interaction:
    TypePrefixFragment 'interaction' name=Name? TypeSpecializationFragment? TypeBodyRule;

fragment TypePrefixFragment:
    visibility=VisibilityIndicator?
    isAbstract?='abstract'?
    isSufficient?='all'?;

fragment TypeSpecializationFragment:
    multiplicity=MultiplicityBounds?
    ((':>' | 'specializes') specializations+=QualifiedName (',' specializations+=QualifiedName)*)?
    (('~' | 'conjugate') conjugatedType=QualifiedName)?
    ('disjoint' 'from' disjointTypes+=QualifiedName (',' disjointTypes+=QualifiedName)*)?;

TypeBodyRule:
    {infer TypeBodyRule} ';' | {infer TypeBodyRule} '{' elements+=TypeBodyElement* '}';

TypeBodyElement:
    NamespaceElement | RelationshipElement | FeatureMember;

RelationshipElement:
    Specialization | Subclassification | FeatureTypingDecl | Subsetting | Redefinition;

// ============================================================
// KerML Features
// ============================================================

Feature:
    FeaturePrefixFragment 'feature'? name=Name? FeatureDeclarationFragment body=FeatureBodyRule;

// FeaturePrefixFragment - sequential order for modifiers
// Order: visibility, direction, abstract, readonly, derived, end, composite, portion
fragment FeaturePrefixFragment:
    visibility=VisibilityIndicator?
    direction=FeatureDirectionKind?
    isAbstract?='abstract'?
    isReadonly?='readonly'?
    isDerived?='derived'?
    isEnd?='end'?
    isComposite?='composite'?
    isPortion?='portion'?;

FeatureDirectionKind returns string:
    'in' | 'out' | 'inout';

fragment FeatureDeclarationFragment:
    ((':' | 'typed' 'by') featureTypes+=FeatureTypeRef (',' featureTypes+=FeatureTypeRef)*)?
    multiplicity=MultiplicityBounds?
    ((':>' | 'subsets') subsets+=QualifiedName (',' subsets+=QualifiedName)*)?
    ((':>>' | 'redefines') redefines+=QualifiedName (',' redefines+=QualifiedName)*)?
    ('references' references+=QualifiedName (',' references+=QualifiedName)*)?
    (valueDefault?='default'? (valueInitial?='=' | valueBinding?=':=' | valueComputed?='::=') valueExpression=OwnedExpression)?;

FeatureTypeRef:
    isDefault?='default'? type=QualifiedName;

FeatureBodyRule:
    {infer FeatureBodyRule} ';' | {infer FeatureBodyRule} '{' elements+=FeatureBodyElement* '}';

FeatureBodyElement:
    RelationshipElement | FeatureMember | NamespaceElement;

FeatureMember:
    visibility=VisibilityIndicator? feature=Feature;

// ============================================================
// Connectors
// ============================================================

// Fragment for connector end pairs (source to target)
// Used by: Connector, Connection, Interface, Flow, Allocation usages
fragment ConnectorEndsFragment:
    sourceEnd=ConnectorEnd 'to' targetEnd=ConnectorEnd;

Connector:
    FeaturePrefixFragment 'connector' name=Name? ConnectorDecl body=FeatureBodyRule;

ConnectorDecl:
    ((':' | 'typed' 'by') connectorTypes+=QualifiedName (',' connectorTypes+=QualifiedName)*)?
    'from'? ConnectorEndsFragment;

ConnectorEnd:
    (endName=Name 'references'?)? target=FeatureChainRef multiplicity=MultiplicityBounds?;

// FeatureChainRef supports both qualified names (A::B) and feature chains (a.b)
FeatureChainRef:
    names+=NamePart (('::' | '.') names+=NamePart)*;

BindingConnector:
    FeaturePrefixFragment 'binding' name=Name? 'of' sourceEnd=ConnectorEnd '=' targetEnd=ConnectorEnd ';';

Succession:
    FeaturePrefixFragment 'succession' name=Name? SuccessionDecl body=FeatureBodyRule;

SuccessionDecl:
    ((':' | 'typed' 'by') successionTypes+=QualifiedName (',' successionTypes+=QualifiedName)*)?
    'first'? sourceEnd=ConnectorEnd ('then' targetEnds+=ConnectorEnd)+;

ItemFlow:
    FeaturePrefixFragment 'flow' name=Name? ItemFlowDecl body=FeatureBodyRule;

ItemFlowDecl:
    ('of' itemName=Name? (':' itemTypes+=QualifiedName (',' itemTypes+=QualifiedName)*)?)?
    'from' ConnectorEndsFragment;

// ============================================================
// SysML DEFINITIONS
// ============================================================

// --- Attribute Definition ---
AttributeDefinition:
    TypePrefixFragment 'attribute' 'def' name=Name? TypeSpecializationFragment? body=TypeBodyRule;

// --- Enumeration Definition ---
EnumerationDefinition:
    TypePrefixFragment 'enum' 'def' name=Name? TypeSpecializationFragment? EnumerationBodyRule;

EnumerationBodyRule:
    {infer EnumerationBodyRule} ';' | {infer EnumerationBodyRule} '{' (values+=EnumerationUsage | elements+=NamespaceElement)* '}';

// --- Occurrence Definition ---
OccurrenceDefinition:
    TypePrefixFragment 'occurrence' 'def' name=Name? TypeSpecializationFragment? ('lifecycle' lifecycleClass=QualifiedName)? TypeBodyRule;

// --- Item Definition ---
ItemDefinition:
    TypePrefixFragment 'item' 'def' name=Name? TypeSpecializationFragment? body=TypeBodyRule;

// --- Part Definition ---
PartDefinition:
    TypePrefixFragment 'part' 'def' name=Name? TypeSpecializationFragment? body=TypeBodyRule;

// --- Connection Definition ---
ConnectionDefinition:
    TypePrefixFragment 'connection' 'def' name=Name? TypeSpecializationFragment? body=TypeBodyRule;

// --- Interface Definition ---
InterfaceDefinition:
    TypePrefixFragment 'interface' 'def' name=Name? TypeSpecializationFragment? body=TypeBodyRule;

// --- Port Definition ---
PortDefinition:
    TypePrefixFragment isConjugated?='conjugate'? 'port' 'def' name=Name? TypeSpecializationFragment? body=TypeBodyRule;

// --- Flow Connection Definition ---
FlowConnectionDefinition:
    TypePrefixFragment 'flow' 'def' name=Name? TypeSpecializationFragment? body=TypeBodyRule;

// --- Allocation Definition ---
AllocationDefinition:
    TypePrefixFragment 'allocation' 'def' name=Name? TypeSpecializationFragment? TypeBodyRule;

// --- Action Definition ---
ActionDefinition:
    TypePrefixFragment 'action' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? ActionBodyRule;

ParameterListPart:
    '(' (parameters+=ParameterMember (',' parameters+=ParameterMember)*)? ')';

ParameterMember:
    {infer ParameterMember}
    direction=FeatureDirectionKind?
    (paramName=Name)?
    ((':' | 'typed' 'by') paramTypes+=QualifiedName (',' paramTypes+=QualifiedName)*)?
    (multiplicity=MultiplicityBounds)?
    ((valueInitial?='=' | valueBinding?=':=') valueExpression=OwnedExpression)?;

ActionBodyRule:
    {infer ActionBodyRule} ';' | {infer ActionBodyRule} '{' elements+=ActionBodyElement* '}';

ActionBodyElement:
    NamespaceElement | ActionUsage | SuccessionUsage | IfThenAction | ForLoopAction | WhileLoopAction |
    AssignmentAction | SendAction | AcceptAction | PerformAction | AssertConstraint;

// --- State Definition ---
StateDefinition:
    TypePrefixFragment isParallel?='parallel'? 'state' 'def' name=Name? TypeSpecializationFragment? body=StateBodyRule;

StateBodyRule:
    {infer StateBodyRule} ';' | {infer StateBodyRule} '{' elements+=StateBodyElement* '}';

StateBodyElement:
    NamespaceElement | StateUsage | TransitionUsage | EntryAction | ExitAction | DoAction;

EntryAction:
    'entry' action=ActionUsage;

ExitAction:
    'exit' action=ActionUsage;

DoAction:
    'do' action=ActionUsage;

// --- Calculation Definition ---
CalculationDefinition:
    TypePrefixFragment 'calc' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? ReturnTypePart? CalculationBodyRule;

ReturnTypePart:
    'return' returnName=Name? (':' returnTypes+=QualifiedName (',' returnTypes+=QualifiedName)*)?;

CalculationBodyRule:
    {infer CalculationBodyRule} ';' | {infer CalculationBodyRule} '{' elements+=CalculationBodyElement* result=ResultExpressionRule? '}';

CalculationBodyElement:
    NamespaceElement | AttributeUsage | ActionUsage | ReturnUsage;

// Return statement in calc body: return result : Real;
ReturnUsage:
    'return' returnName=Name? ((':' | 'typed' 'by') returnTypes+=QualifiedName (',' returnTypes+=QualifiedName)*)? ';';

ResultExpressionRule:
    expression=OwnedExpression;

// --- Constraint Definition ---
ConstraintDefinition:
    TypePrefixFragment 'constraint' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? ConstraintBodyRule;

ConstraintBodyRule:
    {infer ConstraintBodyRule} ';' | {infer ConstraintBodyRule} '{' elements+=ConstraintBodyElement* constraintExpr=OwnedExpression? '}';

ConstraintBodyElement:
    NamespaceElement | AttributeUsage;

// --- Requirement Definition ---
// Supports optional requirement id: requirement def 'REQ-001' ReqName;
RequirementDefinition:
    TypePrefixFragment 'requirement' 'def' reqId=UNRESTRICTED_NAME? name=Name? TypeSpecializationFragment? ParameterListPart? RequirementBodyRule;

RequirementBodyRule:
    {infer RequirementBodyRule} ';' | {infer RequirementBodyRule} '{' elements+=RequirementBodyElement* '}';

RequirementBodyElement:
    NamespaceElement | Documentation | RequirementUsage | ConstraintUsage |
    SubjectUsage | FramedConcern | AssumeConstraint | RequireConstraint |
    ObjectiveMember | StakeholderMember | ActorMember;

SubjectUsage:
    'subject' name=Name? ((':' | 'typed' 'by') subjectTypes+=QualifiedName)? multiplicity=MultiplicityBounds? body=FeatureBodyRule;

FramedConcern:
    'frame' framedConcern=ConcernUsage;

AssumeConstraint:
    'assume' 'constraint'? assumed=ConstraintUsage;

RequireConstraint:
    'require' 'constraint'? required=ConstraintUsage;

ObjectiveMember:
    'objective' objective=RequirementUsage;

StakeholderMember:
    'stakeholder' (stakeholder=PartUsage | inlineStakeholder=InlinePartDecl);

ActorMember:
    'actor' (actor=PartUsage | inlineActor=InlinePartDecl);

// Inline part declaration for actor/stakeholder (without 'part' keyword)
InlinePartDecl:
    name=Name? ((':' | 'typed' 'by') types+=QualifiedName (',' types+=QualifiedName)*)? ';';

// --- Concern Definition ---
ConcernDefinition:
    TypePrefixFragment 'concern' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? RequirementBodyRule;

// --- Case Definition ---
CaseDefinition:
    TypePrefixFragment 'case' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? CaseBodyRule;

CaseBodyRule:
    {infer CaseBodyRule} ';' | {infer CaseBodyRule} '{' elements+=CaseBodyElement* '}';

CaseBodyElement:
    NamespaceElement | SubjectUsage | ObjectiveMember | ActorMember | ActionUsage | ResultsBlock;

// Results block for analysis cases - contains feature members (attributes, etc.)
ResultsBlock:
    'results' '{' elements+=FeatureBodyElement* '}';

// --- Analysis Case Definition ---
AnalysisCaseDefinition:
    TypePrefixFragment 'analysis' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? CaseBodyRule;

// --- Verification Case Definition ---
VerificationCaseDefinition:
    TypePrefixFragment 'verification' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? CaseBodyRule;

// --- Use Case Definition ---
UseCaseDefinition:
    TypePrefixFragment 'use' 'case' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? UseCaseBodyRule;

UseCaseBodyRule:
    {infer UseCaseBodyRule} ';' | {infer UseCaseBodyRule} '{' elements+=UseCaseBodyElement* '}';

UseCaseBodyElement:
    NamespaceElement | SubjectUsage | ObjectiveMember | ActorMember | ActionUsage | IncludeUseCaseUsage;

IncludeUseCaseUsage:
    'include' included=UseCaseUsage;

// --- View Definition ---
ViewDefinition:
    TypePrefixFragment 'view' 'def' name=Name? TypeSpecializationFragment? ViewBodyRule;

ViewBodyRule:
    {infer ViewBodyRule} ';' | {infer ViewBodyRule} '{' elements+=ViewBodyElement* '}';

ViewBodyElement:
    NamespaceElement | ViewUsage | RenderingUsage | ExposeElement | FilterElement;

ExposeElement:
    'expose' exposed=QualifiedName ';';

FilterElement:
    'filter' filterExpr=OwnedExpression ';';

// --- Viewpoint Definition ---
ViewpointDefinition:
    TypePrefixFragment 'viewpoint' 'def' name=Name? TypeSpecializationFragment? ParameterListPart? RequirementBodyRule;

// --- Rendering Definition ---
RenderingDefinition:
    TypePrefixFragment 'rendering' 'def' name=Name? TypeSpecializationFragment? TypeBodyRule;

// --- Metadata Definition ---
MetadataDefinition:
    TypePrefixFragment 'metadata' 'def' name=Name? ('about' about+=QualifiedName (',' about+=QualifiedName)*)? TypeSpecializationFragment? TypeBodyRule;

// ============================================================
// SysML USAGES
// ============================================================

// --- Attribute Usage ---
AttributeUsage:
    FeaturePrefixFragment 'attribute'? name=Name? FeatureDeclarationFragment body=FeatureBodyRule;

// --- Enumeration Usage (for enum literal values) ---
// Supports both 'enum' and 'variant' keywords
EnumerationUsage:
    ('enum' | 'variant') name=Name? ((':' | 'typed' 'by') enumType=QualifiedName)? ';';

// --- Occurrence Usage ---
OccurrenceUsage:
    FeaturePrefixFragment 'occurrence' name=Name? FeatureDeclarationFragment body=FeatureBodyRule;

// --- Item Usage ---
ItemUsage:
    FeaturePrefixFragment 'item' name=Name? FeatureDeclarationFragment body=FeatureBodyRule;

// --- Part Usage ---
PartUsage:
    FeaturePrefixFragment isRef?='ref'? 'part' name=Name? FeatureDeclarationFragment body=FeatureBodyRule;

// --- Connection Usage ---
ConnectionUsage:
    FeaturePrefixFragment 'connection' name=Name? ConnectionUsageDecl body=FeatureBodyRule;

ConnectionUsageDecl:
    {infer ConnectionUsageDecl}
    ((':' | 'typed' 'by') connectionTypes+=QualifiedName (',' connectionTypes+=QualifiedName)*)?
    ('connect' ConnectorEndsFragment)?;

// --- Interface Usage ---
InterfaceUsage:
    FeaturePrefixFragment 'interface' name=Name? InterfaceUsageDecl body=FeatureBodyRule;

InterfaceUsageDecl:
    {infer InterfaceUsageDecl}
    ((':' | 'typed' 'by') interfaceTypes+=QualifiedName (',' interfaceTypes+=QualifiedName)*)?
    ('connect' ConnectorEndsFragment)?;

// --- Port Usage ---
PortUsage:
    FeaturePrefixFragment isConjugated?='conjugate'? 'port' name=Name? FeatureDeclarationFragment body=FeatureBodyRule;

// --- Flow Connection Usage ---
FlowConnectionUsage:
    FeaturePrefixFragment 'flow' name=Name? FlowConnectionUsageDecl body=FeatureBodyRule;

FlowConnectionUsageDecl:
    {infer FlowConnectionUsageDecl}
    // Support typing: flow x : Type;
    ((':' | 'typed' 'by') flowTypes+=QualifiedName (',' flowTypes+=QualifiedName)*)?
    ('of' itemName=Name? (':' itemTypes+=QualifiedName (',' itemTypes+=QualifiedName)*)?)?
    ('from' ConnectorEndsFragment)?;

// --- Allocation Usage ---
AllocationUsage:
    FeaturePrefixFragment 'allocation' name=Name? AllocationUsageDecl body=FeatureBodyRule;

AllocationUsageDecl:
    {infer AllocationUsageDecl}
    ((':' | 'typed' 'by') allocationTypes+=QualifiedName (',' allocationTypes+=QualifiedName)*)?
    ('allocate' ConnectorEndsFragment)?;

// --- Action Usage ---
ActionUsage:
    FeaturePrefixFragment 'action' name=Name? FeatureDeclarationFragment ParameterListPart? ActionBodyRule;

// --- Succession Usage ---
SuccessionUsage:
    FeaturePrefixFragment ('succession' | 'first') sourceEnd=ConnectorEnd 'then' targetEnd=ConnectorEnd ';';

// --- Action Statements ---
IfThenAction:
    'if' condition=OwnedExpression thenBody=ActionBodyRule ('else' (elseIf=IfThenAction | elseBody=ActionBodyRule))?;

ForLoopAction:
    'for' loopVariable=Name (':' loopVariableType=QualifiedName)? 'in' sequence=OwnedExpression body=ActionBodyRule;

WhileLoopAction:
    'while' condition=OwnedExpression ('until' untilCondition=OwnedExpression)? body=ActionBodyRule;

AssignmentAction:
    'assign'? target=QualifiedName ':=' value=OwnedExpression ';';

SendAction:
    'send' payload=OwnedExpression ('via' via=QualifiedName)? 'to' receiver=QualifiedName ';';

AcceptAction:
    'accept' acceptName=Name? ((':' | 'typed' 'by') acceptTypes+=QualifiedName)? ('via' via=QualifiedName)? ';';

PerformAction:
    'perform' (performedRef=QualifiedName ';' | performed=ActionUsage);

// --- State Usage ---
StateUsage:
    FeaturePrefixFragment isParallel?='parallel'? 'state' name=Name? FeatureDeclarationFragment StateBodyRule;

// --- Transition Usage ---
TransitionUsage:
    'transition' name=Name? TransitionDecl TransitionBodyRule;

TransitionDecl:
    {infer TransitionDecl}
    ('first' sourceState=QualifiedName)?
    trigger=TriggerActionPart?
    guard=GuardExpressionPart?
    effect=EffectActionPart?
    ('then' targetState=QualifiedName)?;

TriggerActionPart:
    'accept' triggerPayload=QualifiedName;

GuardExpressionPart:
    'if' guardExpr=OwnedExpression;

EffectActionPart:
    'do' (effectAction=InlineAction | effectBody=ActionBodyRule);

// Inline action reference for use in transitions (no body terminator required)
InlineAction:
    'action' actionName=Name? ((':' | 'typed' 'by') actionTypes+=QualifiedName (',' actionTypes+=QualifiedName)*)?;

TransitionBodyRule:
    {infer TransitionBodyRule} ';' | {infer TransitionBodyRule} '{' elements+=NamespaceElement* '}';

// --- Calculation Usage ---
CalculationUsage:
    FeaturePrefixFragment 'calc' name=Name? FeatureDeclarationFragment ParameterListPart? ReturnTypePart? CalculationBodyRule;

// --- Constraint Usage ---
ConstraintUsage:
    FeaturePrefixFragment 'constraint' name=Name? FeatureDeclarationFragment ParameterListPart? ConstraintBodyRule;

AssertConstraint:
    isNegated?='not'? 'assert' 'constraint'? asserted=ConstraintUsage;

// --- Requirement Usage ---
RequirementUsage:
    FeaturePrefixFragment 'requirement' name=Name? FeatureDeclarationFragment ParameterListPart? RequirementBodyRule;

// --- Concern Usage ---
ConcernUsage:
    FeaturePrefixFragment 'concern' name=Name? FeatureDeclarationFragment RequirementBodyRule;

// --- Case Usage ---
CaseUsage:
    FeaturePrefixFragment 'case' name=Name? FeatureDeclarationFragment ParameterListPart? CaseBodyRule;

// --- Analysis Case Usage ---
AnalysisCaseUsage:
    FeaturePrefixFragment 'analysis' name=Name? FeatureDeclarationFragment ParameterListPart? CaseBodyRule;

// --- Verification Case Usage ---
VerificationCaseUsage:
    FeaturePrefixFragment 'verification' name=Name? FeatureDeclarationFragment ParameterListPart? CaseBodyRule;

// --- Use Case Usage ---
UseCaseUsage:
    FeaturePrefixFragment 'use' 'case' name=Name? FeatureDeclarationFragment ParameterListPart? UseCaseBodyRule;

// --- View Usage ---
ViewUsage:
    FeaturePrefixFragment 'view' name=Name? FeatureDeclarationFragment ViewBodyRule;

// --- Viewpoint Usage ---
ViewpointUsage:
    FeaturePrefixFragment 'viewpoint' name=Name? FeatureDeclarationFragment RequirementBodyRule;

// --- Rendering Usage ---
RenderingUsage:
    FeaturePrefixFragment 'rendering' name=Name? FeatureDeclarationFragment TypeBodyRule;

// --- Metadata Usage ---
MetadataUsage:
    // '#' prefix metadata can be standalone (no terminator needed when preceding an element)
    '#' type=QualifiedName (';' | '{' metadataElements+=MetadataBodyElement* '}')?
    // '@' metadata can also be standalone when preceding an element
    | '@' name=Name? ((':' | 'typed' 'by') metaTypes+=QualifiedName)? (';' | '{' atElements+=MetadataBodyElement* '}')?;

MetadataBodyOpt:
    {infer MetadataBodyOpt} ';' | {infer MetadataBodyOpt} '{' elements+=MetadataBodyElement* '}';

MetadataBodyElement:
    'attribute'? featureName=Name ('=' featureValue=MetadataValue | (':' featureType=QualifiedName) ('=' featureValue=MetadataValue)?) ';';

MetadataValue:
    LiteralValue | valueRef=QualifiedName | '[' (values+=MetadataValue (',' values+=MetadataValue)*)? ']';

LiteralValue:
    LiteralBoolean | LiteralInteger | LiteralReal | LiteralString | LiteralNull | LiteralDefault;

LiteralBoolean:
    value?='true' | {infer LiteralBoolean} 'false';

LiteralInteger:
    value=INTEGER;

LiteralReal:
    value=REAL;

LiteralString:
    value=STRING;

LiteralNull:
    {infer LiteralNull} 'null';

LiteralDefault:
    {infer LiteralDefault} 'default';

// ============================================================
// KerML Relationships (standalone declarations)
// ============================================================

Specialization:
    'specialization' name=Name? 'subtype' subtype=QualifiedName (':>' | 'specializes') supertype=QualifiedName ';';

Subclassification:
    'subclassification' name=Name? 'subclassifier' subclassifier=QualifiedName (':>' | 'specializes') superclassifier=QualifiedName ';';

FeatureTypingDecl:
    'featuring' name=Name? 'typed' typedFeature=QualifiedName (':' | 'by') featureType=QualifiedName ';';

Subsetting:
    'subset' name=Name? subsettingFeature=QualifiedName (':>' | 'subsets') subsettedFeature=QualifiedName ';';

Redefinition:
    'redefinition' name=Name? redefiningFeature=QualifiedName (':>>' | 'redefines') redefinedFeature=QualifiedName ';';

Dependency:
    'dependency' name=Name? 'from' clients+=QualifiedName (',' clients+=QualifiedName)* 'to' suppliers+=QualifiedName (',' suppliers+=QualifiedName)* ';';

// ============================================================
// Multiplicity
// ============================================================

MultiplicityBounds:
    '[' (lowerBound=MultiplicityBoundValue '..')? upperBound=MultiplicityBoundValue ']';

MultiplicityBoundValue returns string:
    INTEGER | '*';

// ============================================================
// Expressions
// ============================================================

OwnedExpression:
    ConditionalExpression;

ConditionalExpression infers OwnedExpression:
    NullCoalescingExpression ({infer ConditionalExpression.condition=current} '?' thenExpr=OwnedExpression ':' elseExpr=ConditionalExpression)?;

NullCoalescingExpression infers OwnedExpression:
    ImpliesExpression ({infer NullCoalescingExpression.left=current} '??' right=ImpliesExpression)*;

ImpliesExpression infers OwnedExpression:
    OrExpression ({infer ImpliesExpression.left=current} ('implies' | '=>') right=OrExpression)*;

OrExpression infers OwnedExpression:
    XorExpression ({infer OrExpression.left=current} ('or' | '|') right=XorExpression)*;

XorExpression infers OwnedExpression:
    AndExpression ({infer XorExpression.left=current} 'xor' right=AndExpression)*;

AndExpression infers OwnedExpression:
    EqualityExpression ({infer AndExpression.left=current} ('and' | '&') right=EqualityExpression)*;

EqualityExpression infers OwnedExpression:
    ClassificationExpression ({infer EqualityExpression.left=current} operator=EqualityOperator right=ClassificationExpression)*;

EqualityOperator returns string:
    '==' | '!=' | '===' | '!==';

ClassificationExpression infers OwnedExpression:
    RelationalExpression ({infer ClassificationExpression.operand=current} operator=ClassificationOperator classType=QualifiedName)?;

ClassificationOperator returns string:
    'hastype' | 'istype' | '@' | 'as' | 'meta';

RelationalExpression infers OwnedExpression:
    RangeExpression ({infer RelationalExpression.left=current} operator=RelationalOperator right=RangeExpression)?;

RelationalOperator returns string:
    '<' | '>' | '<=' | '>=';

RangeExpression infers OwnedExpression:
    AdditiveExpression ({infer RangeExpression.left=current} '..' right=AdditiveExpression)?;

AdditiveExpression infers OwnedExpression:
    MultiplicativeExpression ({infer AdditiveExpression.left=current} operator=AdditiveOperator right=MultiplicativeExpression)*;

AdditiveOperator returns string:
    '+' | '-';

MultiplicativeExpression infers OwnedExpression:
    ExponentiationExpression ({infer MultiplicativeExpression.left=current} operator=MultiplicativeOperator right=ExponentiationExpression)*;

MultiplicativeOperator returns string:
    '*' | '/' | '%';

ExponentiationExpression infers OwnedExpression:
    UnaryExpression ({infer ExponentiationExpression.left=current} ('**' | '^') right=ExponentiationExpression)?;

UnaryExpression infers OwnedExpression:
    {infer UnaryExpression} operator=UnaryOperator operand=UnaryExpression |
    ExtentExpression;

UnaryOperator returns string:
    '+' | '-' | '!' | '~' | 'not';

ExtentExpression infers OwnedExpression:
    {infer ExtentExpression} 'all' extentType=QualifiedName |
    PrimaryExpression;

PrimaryExpression infers OwnedExpression:
    BaseExpression ({infer FeatureChainExpression.source=current} ('.' members+=FeatureReferenceMember)+)?;

// Feature reference member - can be a simple reference or a method invocation
FeatureReferenceMember:
    featureRef=QualifiedName ('(' (arguments+=OwnedExpression (',' arguments+=OwnedExpression)*)? ')')?;

BaseExpression infers OwnedExpression:
    LiteralExpression |
    FeatureReferenceExpression |
    InvocationExpression |
    BodyExpression |
    '(' OwnedExpression ')';

LiteralExpression:
    LiteralBoolean | LiteralInteger | LiteralReal | LiteralString | LiteralNull | LiteralDefault;

FeatureReferenceExpression:
    referent=QualifiedName;

InvocationExpression:
    invoked=QualifiedName '(' (arguments+=OwnedExpression (',' arguments+=OwnedExpression)*)? ')';

BodyExpression:
    '{' (statements+=OwnedExpression (',' statements+=OwnedExpression)*)? '}';

// ============================================================
// Common Elements
// ============================================================

QualifiedName:
    names+=NamePart ('::' names+=NamePart)*;

NamePart returns string:
    ID | UNRESTRICTED_NAME;

Name returns string:
    ID | UNRESTRICTED_NAME;

VisibilityIndicator returns string:
    'public' | 'private' | 'protected';

// ============================================================
// Terminal Rules
// ============================================================

terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;
terminal UNRESTRICTED_NAME: /'([^'\\]|\\.)*'/;
terminal STRING: /"([^"\\]|\\.)*"/;
// REAL must come before INTEGER so that "3.14" is matched as REAL, not "3" as INTEGER
terminal REAL: /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?|[0-9]+[eE][+-]?[0-9]+/;
terminal INTEGER: /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|[0-9]+/;
// COMMENT_BODY for doc/comment text blocks - uses /** to differentiate from ML_COMMENT
terminal COMMENT_BODY: /\/\*\*[\s\S]*?\*\//;
hidden terminal ML_COMMENT: /\/\*(?!\*)[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
hidden terminal WS: /\s+/;
