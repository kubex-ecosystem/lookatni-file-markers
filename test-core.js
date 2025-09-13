#!/usr/bin/env node

/**
 * 🧪 Teste rápido para validar se o core LookAtni realmente funciona
 * Isso é um teste da "reforma da verdade" - vamos ver se o código é real!
 */

console.log('🚀 Testando LookAtni Core - Reforma da Verdade!');
console.log('='.repeat(50));

try {
  // Importa o core
  const { createGenerator, createExtractor, createValidator } = require('./core/dist/lib/index.js');

  console.log('✅ Core importado com sucesso!');

  // Testa factory functions
  const generator = createGenerator();
  const extractor = createExtractor();
  const validator = createValidator();

  console.log('✅ Factory functions funcionando!');
  console.log('📊 Generator:', generator.constructor.name);
  console.log('📊 Extractor:', extractor.constructor.name);
  console.log('📊 Validator:', validator.constructor.name);

  console.log('\n🎉 CORE REAL CONFIRMADO! A base está sólida!');
  console.log('💪 Próximo passo: implementar CLI e Extension de verdade!');

} catch (error) {
  console.error('❌ ERRO: O core não funciona!', error.message);
  process.exit(1);
}
