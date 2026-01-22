# SysML v2 Parser

A comprehensive SysML v2 parser built with [Langium](https://langium.org/), providing parsing, validation, and tooling support for the Systems Modeling Language version 2.

## Features

- **Full SysML v2 Grammar Support**
  - Definitions: `part def`, `action def`, `state def`, `requirement def`, `port def`, and more
  - Usages: `part`, `action`, `state`, `attribute`, `port`, etc.
  - Relationships: specialization, subsetting, redefinition, dependency
  - Expressions: arithmetic, logical, conditional, feature chains
  - Packages and imports (simple, wildcard, recursive)
  - Metadata and documentation

- **Validation**
  - Name uniqueness checking
  - Multiplicity bounds validation
  - Specialization cycle detection
  - Self-specialization prevention

- **Scoping**
  - Qualified name resolution (`A::B::C`)
  - Import handling (simple, wildcard `::*`, recursive `::**`)
  - Nested scope resolution
  - Visibility (public, private, protected)

- **CLI Tools**
  - `parse` - Parse SysML files and output AST
  - `validate` - Validate files and report diagnostics
  - `export` - Export to JSON/AST formats

## Installation

```bash
# Clone the repository
git clone https://github.com/zbigniewsobiecki/sysml-v2.git
cd sysml-v2

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### As a Library

```typescript
import { parseDocument, validateDocument } from 'sysml-parser';

// Parse SysML code
const result = await parseDocument(`
    package Vehicle {
        part def Car {
            part engine : Engine;
            part wheels : Wheel[4];
        }
        part def Engine;
        part def Wheel;
    }
`);

if (!result.hasErrors) {
    console.log('Parsed successfully!');
    console.log(result.ast);
}

// Validate SysML code
const validation = await validateDocument(`
    part def A :> A;  // Error: self-specialization
`);

for (const error of validation.errors) {
    console.log(`${error.range.start.line}: ${error.message}`);
}
```

### CLI

```bash
# Parse a file
npm run cli -- parse model.sysml

# Validate a file
npm run cli -- validate model.sysml

# Validate with JSON output
npm run cli -- validate model.sysml --format json

# Export AST
npm run cli -- export model.sysml --output model.json
```

## Project Structure

```
sysml-parser/
├── src/
│   ├── grammar/           # Langium grammar files
│   │   ├── sysml.langium  # Main SysML grammar
│   │   ├── kerml.langium  # KerML base grammar
│   │   └── common.langium # Shared rules
│   ├── language/          # Language services
│   │   ├── generated/     # Generated AST types
│   │   ├── scope-*.ts     # Scoping implementation
│   │   └── sysml-module.ts
│   ├── validation/        # Validation rules
│   │   ├── validator.ts   # Main validator
│   │   └── helpers/       # Validation helpers
│   ├── cli/               # CLI implementation
│   │   ├── commands/      # CLI commands
│   │   └── reporters/     # Output formatters
│   └── utils/             # Utilities
├── test/                  # Test suite
│   ├── grammar/           # Grammar tests
│   ├── validation/        # Validation tests
│   ├── scoping/           # Scoping tests
│   ├── integration/       # Integration tests
│   └── cli/               # CLI tests
└── syntaxes/              # TextMate grammar for syntax highlighting
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- test/grammar/definitions.test.ts
```

The test suite includes 621 tests covering:
- Grammar parsing for all SysML constructs
- Validation rules
- Scoping and name resolution
- CLI commands
- Integration scenarios

## SysML v2 Examples

### Part Definitions

```sysml
part def Vehicle {
    part engine : Engine;
    part wheels : Wheel[4];

    port fuelPort : FuelPort;
}

part def Engine :> PowerSource {
    attribute horsepower : Integer;
}
```

### Actions and States

```sysml
action def Drive {
    in destination : Location;

    action accelerate;
    action steer;
    action brake;

    succession first accelerate then steer;
}

state def VehicleState {
    state parked;
    state driving;
    state stopped;

    transition first parked accept start then driving;
    transition first driving accept stop then stopped;
}
```

### Requirements

```sysml
requirement def SafetyRequirement {
    subject vehicle : Vehicle;

    require constraint safeSpeed {
        vehicle.speed <= 120
    }
}
```

### Packages and Imports

```sysml
package Automotive {
    package Components {
        part def Engine;
        part def Transmission;
    }

    package Vehicles {
        import Components::*;

        part def Car {
            part engine : Engine;
            part transmission : Transmission;
        }
    }
}
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Acknowledgments

- Built with [Langium](https://langium.org/) - Language Engineering for TypeScript
- Based on the [SysML v2](https://www.omgsysml.org/SysML-2.htm) specification by OMG
