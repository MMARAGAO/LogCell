# 🔧 Guia de Ajuste do Código - Sistema de Estoque

## 📋 O Que Mudar

Seu sistema está usando **dois campos diferentes** para registrar movimentações:

- `quantidade_alterada` (sistema antigo - via triggers)
- `quantidade` (sistema novo - via código)

**Você deve usar APENAS `quantidade`** e parar de preencher `quantidade_alterada` no código.

---

## 🎯 Arquivos que Precisam de Ajuste

### 1. **services/rmaService.ts** (Linha ~514) ⚠️ CRÍTICO

**ANTES:**
\`\`\`typescript
const { error: erroHistorico } = await supabase
.from("historico_estoque")
.insert({
id_produto: params.produto_id,
id_loja: params.loja_id,
usuario_id: params.criado_por,
quantidade_anterior: quantidadeAtual,
quantidade_nova: novaQuantidade,
quantidade_alterada: quantidadeMovimentacao, // ❌ REMOVER
tipo_movimentacao: params.tipo_movimentacao,
motivo: params.motivo,
observacao: \`RMA #\${params.rma_id}\`,
});
\`\`\`

**DEPOIS:**
\`\`\`typescript
const { error: erroHistorico } = await supabase
.from("historico_estoque")
.insert({
id_produto: params.produto_id,
id_loja: params.loja_id,
usuario_id: params.criado_por,
quantidade: Math.abs(quantidadeMovimentacao), // ✅ ADICIONAR (sempre positivo)
quantidade_anterior: quantidadeAtual,
quantidade_nova: novaQuantidade,
tipo_movimentacao: params.tipo_movimentacao,
motivo: params.motivo,
observacao: \`RMA #\${params.rma_id}\`,
});
\`\`\`

---

### 2. **services/vendasService.ts** (Linhas ~811 e ~884) ⚠️ CRÍTICO

**Local 1 - Devolução (Linha ~811):**
\`\`\`typescript
// ANTES
quantidade_alterada: itemAntigo.quantidade, // ❌

// DEPOIS
quantidade: itemAntigo.quantidade, // ✅
\`\`\`

**Local 2 - Baixa (Linha ~884):**
\`\`\`typescript
// ANTES
quantidade_alterada: -itemNovo.quantidade, // ❌

// DEPOIS
quantidade: itemNovo.quantidade, // ✅ (sempre positivo, tipo_movimentacao define se é entrada/saída)
\`\`\`

---

### 3. **components/ordem-servico/OrdemServicoFormModal.tsx** (Linha ~771) ⚠️ CRÍTICO

**ANTES:**
\`\`\`typescript
quantidade_alterada: -peca.quantidade, // ❌
\`\`\`

**DEPOIS:**
\`\`\`typescript
quantidade: peca.quantidade, // ✅ (sempre positivo)
\`\`\`

---

## 📊 Regra de Ouro

### ❌ NÃO FAÇA:

\`\`\`typescript
quantidade_alterada: -10 // Negativo para saída
quantidade_alterada: +10 // Positivo para entrada
\`\`\`

### ✅ FAÇA:

\`\`\`typescript
quantidade: 10, // Sempre positivo
tipo_movimentacao: 'saida' // Define se é entrada ou saída
\`\`\`

---

## 🔍 Lógica de Cálculo Correta

### No código TypeScript/React (visualização):

\`\`\`typescript
// Para calcular estoque baseado no histórico:
const calcularEstoque = (historico: HistoricoEstoque[]) => {
return historico.reduce((total, item) => {
// Novo sistema (campo quantidade)
if (item.quantidade !== null) {
if (['entrada', 'devolucao_venda', 'transferencia_entrada'].includes(item.tipo_movimentacao)) {
return total + item.quantidade;
}
if (['saida', 'venda', 'quebra', 'baixa_edicao_venda', 'transferencia_saida'].includes(item.tipo_movimentacao)) {
return total - item.quantidade;
}
}

    // Sistema antigo (campo quantidade_alterada) - para compatibilidade
    if (item.quantidade_alterada !== null && item.tipo_movimentacao === 'ajuste') {
      return total + item.quantidade_alterada; // Já tem o sinal
    }

    return total;

}, 0);
};
\`\`\`

---

## 📁 Arquivos de Visualização (Não Críticos)

Estes arquivos apenas **exibem** dados, não precisam de ajuste urgente:

- ✅ `components/estoque/HistoricoEstoqueModal.tsx` - Apenas exibe
- ✅ `components/estoque/TransferenciaModal.tsx` - Apenas exibe
- ✅ `services/historicoEstoqueService.ts` - Leitura apenas

**Mas você pode melhorar** adicionando fallback para o novo campo:

\`\`\`typescript
// Exemplo de exibição com fallback:
const quantidadeExibida = item.quantidade ?? Math.abs(item.quantidade_alterada ?? 0);
\`\`\`

---

## 🎯 Checklist de Implementação

- [ ] Ajustar `services/rmaService.ts` (linha ~514)
- [ ] Ajustar `services/vendasService.ts` (linhas ~811 e ~884)
- [ ] Ajustar `components/ordem-servico/OrdemServicoFormModal.tsx` (linha ~771)
- [ ] Testar criação de RMA
- [ ] Testar devolução de venda
- [ ] Testar edição de venda
- [ ] Testar criação de ordem de serviço
- [ ] Verificar se estoque está sincronizando corretamente

---

## 🚨 IMPORTANTE

**O trigger `trigger_validar_estoque_saida` agora está ATIVO!**

Ele vai **bloquear** qualquer tentativa de venda/saída com estoque insuficiente.

Se você tentar fazer uma saída sem estoque, vai receber:
\`\`\`
ERROR: Estoque insuficiente! Disponível: 0, Necessário: 1
HINT: Verifique o estoque antes de realizar a operação
\`\`\`

Certifique-se de **validar o estoque no frontend** antes de enviar a operação.

---

## 🧪 Script de Teste

Execute este script após fazer as alterações:

\`\`\`sql
-- Testar se novo registro está usando campo correto
SELECT
criado_em,
tipo_movimentacao,
quantidade, -- ✅ Deve estar preenchido
quantidade_alterada, -- ❌ Deve estar NULL
motivo
FROM historico_estoque
WHERE id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
ORDER BY criado_em DESC
LIMIT 10;
\`\`\`

---

## 📞 Dúvidas?

Se precisar de ajuda para implementar algum ajuste específico, me avise qual arquivo e eu ajudo com o código exato! 🚀
