Fixtures Overview
- This folder contains canonical fixtures to validate cross-language parity (TS core, Go CLI, VS Code extension).
- Consumers should parse these inputs and produce identical outputs according to Marker Spec v1.

Structure
- valid/
- invalid/
- edge/

How To Use
- For each `.lkt` input, tools should list parsed markers (filename, startLine, endLine, content size) and optionally extract to a temp dir.
- Tests must assert the same filenames and content across implementations.

