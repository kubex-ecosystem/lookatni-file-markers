#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const FS = String.fromCharCode(28);
const demo = () => {
    console.log('🚀 LookAtni File Markers Demo v4.0');
    console.log('Creating demo with invisible markers...');
    const content = `# LookAtni Demo Code

//${FS}/ hello.js /${FS}//
console.log('Hello, LookAtni with invisible markers!');
console.log('This is working perfectly!');

const message = 'Bem-vindo ao futuro!';
console.log(message);

//${FS}/ style.css /${FS}//
body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

//${FS}/ index.html /${FS}//
<!DOCTYPE html>
<html>
<head>
    <title>LookAtni Demo</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>🚀 LookAtni File Markers</h1>
        <p>Marcadores invisíveis funcionando!</p>
    </div>
    <script src="hello.js"></script>
</body>
</html>

//${FS}/ README.md /${FS}//
# LookAtni Demo

Demonstração com marcadores invisíveis!

## Como usar

\`\`\`bash
tsx extractFiles.ts demo-code.txt ./extracted
\`\`\`

Pronto! 🎉
`;
    fs.writeFileSync('demo-code.txt', content);
    console.log('✅ Demo criada: demo-code.txt');
    const markers = content.split('\n').filter(line => line.includes(`//${FS}/`));
    console.log(`📊 Encontrados ${markers.length} marcadores invisíveis:`);
    markers.forEach((marker, i) => {
        const match = marker.match(new RegExp(`//${FS}/ (.+) /${FS}//`));
        if (match) {
            console.log(`  ${i + 1}. ${match[1]}`);
        }
    });
    console.log('\n🚀 Teste agora:');
    console.log('  tsx extractFiles.ts demo-code.txt ./demo-extracted');
};
demo();
