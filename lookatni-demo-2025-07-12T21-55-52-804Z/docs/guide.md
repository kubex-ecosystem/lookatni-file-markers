# LookAtni Usage Guide

## What are markers?

Markers use the syntax: `//m/ filename /m//`

## Example:

```
//m/ src/example.js /m//
console.log('This content belongs to src/example.js');
const demo = true;

//m/ README.md /m//
# Another File
This content belongs to README.md
```

## Benefits:
- Easy file identification
- Preserves directory structure  
- Supports validation
- Works with any text format
