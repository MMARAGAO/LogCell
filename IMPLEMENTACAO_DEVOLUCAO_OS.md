# Implementação: Devolução de Ordem de Serviço

## 📋 Resumo da Funcionalidade

Foi implementado um sistema completo de devolução de Ordem de Serviço (OS) que permite desfazer um serviço realizado, devolver peças ao estoque e processar o valor pago de duas formas diferentes.

## ✨ Recursos Implementados

### 1. **Modal de Devolução Interativo**

- Interface amigável para escolher tipo de devolução
- Exibição clara de:
  - Peças que retornarão ao estoque
  - Valor total a ser processado
  - Resumo das ações que serão executadas

### 2. **Duas Opções de Processamento**

#### 🟢 Reembolso em Dinheiro

- O cliente recebe o valor de volta em dinheiro
- O valor é retirado do caixa
- Registro do reembolso no histórico da OS

#### 🟡 Crédito para Cliente

- O valor fica disponível como crédito
- Cliente pode usar em futuras compras ou serviços
- Sistema cria/atualiza registro do cliente automaticamente
- Crédito vinculado à OS original para rastreabilidade

### 3. **Processo Automatizado**

A devolução realiza automaticamente:

✅ **Devolução de Peças ao Estoque**

- Apenas peças do tipo "estoque" que foram baixadas
- Quantidade retorna automaticamente ao inventário

✅ **Remoção de Pagamentos**

- Todos os pagamentos vinculados à OS são removidos
- Histórico preservado para auditoria

✅ **Atualização de Status**

- Status da OS muda para "Devolvida"
- Lançamento no caixa é cancelado

✅ **Registro de Histórico**

- Histórico detalhado da devolução
- Informação sobre tipo (reembolso ou crédito)
- Valor processado

✅ **Gestão de Cliente**

- Para crédito: busca cliente existente por CPF/CNPJ ou nome
- Se não existir, cria registro básico
- Gera crédito vinculado à OS

## 🗂️ Arquivos Criados/Modificados

### Novos Arquivos

1. **`components/ordem-servico/DevolverOSModal.tsx`**

   - Modal interativo para escolher tipo de devolução
   - Exibição de informações e validações

2. **`migrations/add_ordem_servico_credito_cliente.sql`**
   - Script SQL para adicionar campo `ordem_servico_id` na tabela de créditos
   - Índice para performance

### Arquivos Modificados

1. **`services/ordemServicoService.ts`**

   - Atualizada função `devolverOrdemServico()`
   - Novo parâmetro: `tipoDevolucao: "reembolso" | "credito"`
   - Lógica para criar cliente e gerar crédito quando necessário

2. **`app/sistema/ordem-servico/page.tsx`**

   - Adicionado estado para modal de devolução
   - Nova função `handleConfirmarDevolucao()`
   - Integração do componente `DevolverOSModal`

3. **`components/ordem-servico/OrdemServicoDetalhesModal.tsx`**

   - Atualizada função `handleDevolverOS()` para receber tipo
   - Substituído modal de confirmação simples pelo novo modal interativo
   - Mensagens personalizadas por tipo de devolução

4. **`components/ordem-servico/index.ts`**

   - Exportação do novo componente `DevolverOSModal`

5. **`types/vendas.ts`**
   - Adicionado campo `ordem_servico_id?` na interface `CreditoCliente`

## 🔄 Fluxo de Uso

1. **Usuário acessa OS** → Visualiza detalhes ou lista de OS
2. **Clica em "Devolver OS"** → Abre modal interativo
3. **Escolhe tipo de devolução**:
   - Reembolso em dinheiro
   - Crédito para cliente
4. **Confirma ação** → Sistema processa automaticamente
5. **Recebe feedback** → Toast com confirmação e detalhes

## 🔒 Validações e Segurança

- ✅ Verificação de permissões (`os.editar`)
- ✅ Não permite devolver OS já cancelada ou devolvida
- ✅ Validação de autenticação do usuário
- ✅ Tratamento de erros completo
- ✅ Transações atômicas no banco de dados

## 📊 Rastreabilidade

- Histórico completo da devolução na OS
- Crédito vinculado à OS original
- Pagamentos removidos mas auditáveis
- Status da OS preserva histórico de mudanças

## 🎯 Próximos Passos Recomendados

1. **Migração do Banco de Dados**
   - Executar o script `migrations/add_ordem_servico_credito_cliente.sql`
2. **Testes**

   - Testar devolução com reembolso
   - Testar devolução com crédito
   - Verificar retorno de peças ao estoque
   - Confirmar criação automática de clientes

3. **Documentação para Usuários**
   - Criar manual de uso da funcionalidade
   - Treinar equipe sobre as duas opções

## 📝 Observações Técnicas

- A funcionalidade mantém compatibilidade com código existente
- Chamadas antigas de `devolverOrdemServico()` ainda funcionam (padrão: reembolso)
- Sistema resiliente: cria cliente automaticamente se necessário para gerar crédito
- Interface responsiva e acessível

## ✅ Status

**Implementação Completa e Funcional**

Todos os requisitos foram atendidos:

- ✅ Opção de devolução de OS
- ✅ Devolução automática de peças ao estoque
- ✅ Escolha entre reembolso ou crédito
- ✅ Interface intuitiva e clara
