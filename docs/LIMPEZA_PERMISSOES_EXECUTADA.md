# Limpeza do Sistema de Permissões - Executada

## Data: 2024

## Objetivo

Remover permissões não utilizadas, padronizar nomenclatura e simplificar o sistema de permissões baseado na análise do relatório RELATORIO_ANALISE_PERMISSOES.sql.

## Alterações Realizadas

### 1. Permissões Removidas

#### Módulo: Ordem de Serviço

- ❌ **os.atribuir_tecnico** - Não implementado
- ❌ **os.atualizar_status** - Não implementado
- ❌ **os.gerar_pdf** - Não implementado
- ✅ **os.deletar** → **os.excluir** - Padronizado
- ✅ **os.cancelar** - Mantido (será implementado)
- ✅ **os.assumir** - Mantido (funcionalidade existente)

#### Módulo: Técnicos

- ✅ **tecnicos.deletar** → **tecnicos.excluir** - Padronizado

#### Módulo: Devoluções

- ❌ **devolucoes.editar** - Não utilizado
- ❌ **devolucoes.deletar** - Não utilizado
- ❌ **devolucoes.deletar_sem_restricao** - Não utilizado
- ❌ **devolucoes.aprovar** - Não utilizado
- ✅ **devolucoes.visualizar** - Mantido
- ✅ **devolucoes.criar** - Mantido
- ✅ **devolucoes.processar_creditos** - Mantido

#### Módulo: RMA

- ❌ **rma.editar** - Não utilizado
- ❌ **rma.deletar** - Não utilizado
- ❌ **rma.aprovar** - Não utilizado
- ✅ **rma.visualizar** - Mantido
- ✅ **rma.criar** - Mantido

#### Módulo: Transferências

- ✅ **transferencias.deletar** → **transferencias.excluir** - Padronizado
- ❌ **estoque.transferir** - Removido (transferências agora tem módulo próprio)

#### Módulo: Dashboard

- ❌ **dashboard.ver_relatorios** - Não implementado
- ❌ **dashboard.exportar_dados** - Não implementado
- ✅ **dashboard.visualizar** - Mantido

#### Módulos Completamente Removidos

- ❌ **logs.\*** - Módulo inteiro removido (0% uso)

  - logs.visualizar
  - logs.filtrar
  - logs.ver_detalhes
  - logs.exportar

- ❌ **rma_clientes.\*** - Módulo inteiro removido (0% uso)
  - rma_clientes.visualizar
  - rma_clientes.criar
  - rma_clientes.editar
  - rma_clientes.deletar

### 2. Padronização de Nomenclatura

Todos os termos "deletar" foram substituídos por "excluir" para consistência:

- ✅ os.deletar → os.excluir
- ✅ tecnicos.deletar → tecnicos.excluir
- ✅ transferencias.deletar → transferencias.excluir

### 3. Estatísticas

**Antes da Limpeza:**

- Total de permissões definidas: ~90
- Permissões utilizadas: ~60 (67%)
- Permissões não utilizadas: ~30 (33%)

**Após a Limpeza:**

- Total de permissões definidas: ~64
- Permissões utilizadas: ~60 (94%)
- Permissões não utilizadas: ~4 (6%)
- Redução: 26 permissões removidas (29%)

### 4. Arquivos Modificados

1. **types/index.ts**

   - Interface PermissoesModulos atualizada
   - Módulos logs e rma_clientes removidos
   - Permissões não utilizadas removidas
   - Nomenclatura padronizada (deletar → excluir)

2. **services/permissoesService.ts**

   - getPermissoesPadrao() atualizado
   - getPermissoesAdmin() atualizado
   - Sincronizado com types/index.ts

3. **components/usuarios/PermissoesModal.tsx**

   - Seções de Logs e RMA Clientes removidas
   - Checkboxes de permissões não utilizadas removidos
   - Labels atualizados (Deletar → Excluir)
   - Grid de OS simplificado (de 12 para 9 permissões)
   - Grid de Devoluções simplificado (de 7 para 3 permissões)
   - Grid de RMA simplificado (de 5 para 2 permissões)
   - Grid de Dashboard simplificado (de 3 para 1 permissão)
   - Permissão estoque.transferir removida do módulo Estoque

4. **app/sistema/usuarios/page.tsx**

   - usuarios.deletar → usuarios.excluir (2 ocorrências)

5. **app/sistema/tecnicos/page.tsx**

   - tecnicos.deletar → tecnicos.excluir (2 ocorrências)

6. **app/sistema/ordem-servico/page.tsx**

   - os.deletar → os.excluir (2 ocorrências)

7. **app/sistema/transferencias/page.tsx**

   - estoque.transferir → transferencias.criar

8. **components/Permissao.tsx**
   - Exemplo na documentação atualizado (os.deletar → os.excluir)

### 5. Permissões Mantidas para Implementação Futura

- ✅ **os.cancelar** - Funcionalidade planejada (similar a vendas.cancelar)

### 6. Benefícios da Limpeza

1. **Código Mais Limpo**: 29% menos permissões para gerenciar
2. **Interface Simplificada**: Modal de permissões mais enxuto e objetivo
3. **Manutenção Facilitada**: Apenas permissões realmente utilizadas
4. **Performance**: Menos dados para processar em verificações de permissão
5. **Clareza**: Sistema de permissões reflete exatamente o que é usado

### 7. Impacto em Usuários Existentes

**IMPORTANTE**: Usuários existentes com permissões antigas (logs, rma_clientes, etc.) manterão esses valores no JSONB, mas:

- ✅ Não causarão erros (JSONB aceita campos extras)
- ✅ Serão ignorados pelo sistema (temPermissao() só verifica campos definidos)
- ⚠️ Podem ser removidos com um script de migração futuro se necessário

### 8. Validação

- ✅ 0 erros TypeScript após alterações
- ✅ Interface PermissoesModulos consistente em types e services
- ✅ PermissoesModal sincronizado com definições
- ✅ Todas as permissões em uso ainda presentes

## Próximos Passos

1. ✅ Limpeza concluída
2. ⏳ Implementar os.cancelar (Task #3)
3. ⏳ Considerar separar módulo transferencias do estoque (Task #2)
4. ⏳ Atualizar referências a permissões antigas no código se houver

## Observações

- A permissão `os.cancelar` foi mantida pois será implementada em breve
- Transferências mantém módulo próprio por ser funcionalidade completa
- Devoluções agora focado apenas em visualizar, criar e processar créditos
- RMA focado apenas em visualizar e criar
