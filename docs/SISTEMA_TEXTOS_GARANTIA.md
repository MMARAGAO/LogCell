# Sistema de Textos de Garantia

## 📋 Descrição

Sistema para armazenar e gerenciar os textos de garantia que aparecem nas ordens de serviço e notas fiscais. Os textos são armazenados no banco de dados e podem ser atualizados sem precisar modificar o código.

## 🗄️ Estrutura do Banco de Dados

### Tabela: `textos_garantia`

| Coluna          | Tipo        | Descrição                          |
| --------------- | ----------- | ---------------------------------- |
| `id`            | SERIAL      | ID único do texto                  |
| `tipo_servico`  | VARCHAR(50) | Tipo do serviço (chave única)      |
| `dias_garantia` | INTEGER     | Quantidade de dias de garantia     |
| `titulo`        | TEXT        | Título que aparece no cabeçalho    |
| `clausulas`     | JSONB       | Array com as cláusulas da garantia |
| `ativo`         | BOOLEAN     | Se o texto está ativo              |
| `criado_em`     | TIMESTAMP   | Data de criação                    |
| `atualizado_em` | TIMESTAMP   | Data da última atualização         |

### Tipos de Serviço

- `servico_geral` - Serviço Geral (90 dias)
- `troca_vidro` - Troca de Vidro (sem garantia)
- `troca_tampa` - Troca de Tampa (sem garantia)
- `venda_aparelho` - Venda de Aparelho (180 dias)

## 🔧 Como Usar

### 1. No Frontend (React/Next.js)

#### Hook para buscar todos os textos:

```typescript
import { useTextosGarantia } from "@/hooks/useTextosGarantia";

function MeuComponente() {
  const { textosGarantia, loading, error } = useTextosGarantia();

  // textosGarantia é um array com todos os textos
}
```

#### Hook para buscar um texto específico:

```typescript
import { useTextoGarantiaPorTipo } from "@/hooks/useTextosGarantia";

function OrdemServico() {
  const { textoGarantia, loading } = useTextoGarantiaPorTipo("servico_geral");

  // textoGarantia contém o texto de garantia do serviço geral
}
```

#### Componente para exibir na tela:

```typescript
import { TextoGarantiaView } from '@/components/ordem-servico/TextoGarantiaView';

function OrdemServico({ textoGarantia }) {
  return (
    <TextoGarantiaView textoGarantia={textoGarantia} />
  );
}
```

#### Componente para impressão/PDF:

```typescript
import { TextoGarantiaPrint } from '@/components/ordem-servico/TextoGarantiaView';

function ImprimirOS({ textoGarantia }) {
  return (
    <TextoGarantiaPrint textoGarantia={textoGarantia} />
  );
}
```

### 2. Via API (Supabase)

#### Buscar texto específico:

```typescript
const { data, error } = await supabase.rpc("buscar_texto_garantia", {
  p_tipo_servico: "servico_geral",
});
```

#### Buscar todos os textos:

```typescript
const { data, error } = await supabase
  .from("textos_garantia")
  .select("*")
  .eq("ativo", true)
  .order("tipo_servico");
```

## 📝 Exemplo de Uso Completo

```typescript
import { useTextoGarantiaPorTipo } from '@/hooks/useTextosGarantia';
import { TextoGarantiaPrint } from '@/components/ordem-servico/TextoGarantiaView';

function GerarPDFOrdemServico({ ordemServico }) {
  // Determinar o tipo de serviço baseado na OS
  const tipoServico = determinarTipoServico(ordemServico);

  // Buscar o texto de garantia
  const { textoGarantia, loading } = useTextoGarantiaPorTipo(tipoServico);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="pdf-container">
      {/* Cabeçalho da OS */}
      <div>...</div>

      {/* Itens da OS */}
      <div>...</div>

      {/* Texto de Garantia */}
      {textoGarantia && (
        <TextoGarantiaPrint textoGarantia={textoGarantia} />
      )}
    </div>
  );
}

function determinarTipoServico(os) {
  // Lógica para determinar o tipo baseado nos serviços da OS
  if (os.servicos.some(s => s.nome.includes('Troca de Vidro'))) {
    return 'troca_vidro';
  }
  if (os.servicos.some(s => s.nome.includes('Troca de Tampa'))) {
    return 'troca_tampa';
  }
  if (os.tipo === 'venda') {
    return 'venda_aparelho';
  }
  return 'servico_geral';
}
```

## 🔒 Permissões

- **Leitura**: Todos os usuários autenticados
- **Inserção**: Apenas usuários com permissão `sistema.configuracoes` ou admins
- **Atualização**: Apenas usuários com permissão `sistema.configuracoes` ou admins
- **Exclusão**: Apenas usuários com permissão `sistema.configuracoes` ou admins

## 🔄 Atualizando Textos

Para atualizar um texto de garantia:

```sql
UPDATE textos_garantia
SET
  titulo = 'Novo título',
  dias_garantia = 120,
  clausulas = '[
    {"numero": 1, "texto": "Nova cláusula 1"},
    {"numero": 2, "texto": "Nova cláusula 2"}
  ]'::jsonb
WHERE tipo_servico = 'servico_geral';
```

## 📦 Arquivos Criados

1. `/docs/ADD_TEXTOS_GARANTIA.sql` - Script de criação da tabela
2. `/docs/INSERT_TEXTOS_GARANTIA.sql` - Script de inserção dos dados
3. `/types/garantia.ts` - Tipos TypeScript
4. `/hooks/useTextosGarantia.ts` - Hooks para buscar dados
5. `/components/ordem-servico/TextoGarantiaView.tsx` - Componentes de exibição

## ✅ Status

- ✅ Tabela criada no banco de dados
- ✅ Dados inseridos (4 tipos de garantia)
- ✅ Tipos TypeScript criados
- ✅ Hooks criados
- ✅ Componentes de visualização criados
- ✅ Políticas RLS configuradas
- ✅ Função helper `buscar_texto_garantia()` criada
