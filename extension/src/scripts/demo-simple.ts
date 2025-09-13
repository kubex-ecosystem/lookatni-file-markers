#!/usr/bin/env node

/**
 * Script de demonstração simplificado do LookAtni v4.0
 */

import * as fs from 'fs';

// Caractere invisível File Separator (ASCII 28)
const FS = String.fromCharCode(28);

// Demo simples
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
    
    // Mostrar marcadores
    const markers = content.split('\n').filter(line => line.includes(`//${FS}/`));
    console.log(`📊 Encontrados ${markers.length} marcadores invisíveis:`);
    markers.forEach((marker, i) => {
        const match = marker.match(new RegExp(`//${FS}/ (.+) /${FS}//`));
        if (match) {
            console.log(`  ${i+1}. ${match[1]}`);
        }
    });
    
    console.log('\n🚀 Teste agora:');
    console.log('  tsx extractFiles.ts demo-code.txt ./demo-extracted');
};

demo();
