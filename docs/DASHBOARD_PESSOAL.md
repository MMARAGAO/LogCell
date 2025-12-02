# Dashboard Pessoal

## 📊 Visão Geral

O Dashboard Pessoal é uma tela personalizada que exibe métricas e informações importantes para cada usuário individualmente. Diferente do dashboard geral da empresa, este foco é no desempenho pessoal do usuário.

## ✨ Funcionalidades

### Métricas Principais

1. **Vendas de Hoje**

   - Valor total em vendas realizadas no dia
   - Quantidade de vendas
   - Ícone: Carrinho de compras

2. **Ticket Médio**

   - Cálculo automático do valor médio por venda
   - Baseado nas vendas do dia
   - Ícone: Cifrão

3. **Total do Mês**

   - Valor acumulado de vendas no mês
   - Quantidade total de vendas
   - Ícone: Gráfico crescente

4. **Meta Mensal**
   - Percentual de atingimento da meta
   - Valor faltante para completar a meta
   - Ícone: Alvo

### Progresso de Metas

#### Meta Diária

- Valor da meta: R$ 384,62/dia (meta mensal ÷ 26 dias úteis)
- Barra de progresso visual
- Cores dinâmicas:
  - 🟢 Verde: ≥ 100% (meta atingida)
  - 🟡 Amarelo: 50-99%
  - 🔴 Vermelho: < 50%
- Badge de conquista ao atingir 100%

#### Meta Mensal

- Valor padrão: R$ 10.000,00 (configurável)
- Barra de progresso visual
- Cores dinâmicas:
  - 🟢 Verde: ≥ 100%
  - 🟡 Amarelo: 70-99%
  - 🔴 Vermelho: < 70%
- Badge de conquista ao atingir 100%

### Ordens de Serviço (para Técnicos)

Se o usuário for um técnico, exibe:

- **Aguardando**: OS pendentes de início
- **Em Andamento**: OS sendo trabalhadas
- **Concluídas no Mês**: Total de OS finalizadas

### Últimas Vendas

Lista das últimas 5 vendas do dia, mostrando:

- Número da venda
- Horário da venda
- Valor total
- Design responsivo com cards

## 🎯 Como Usar

### Acessar o Dashboard Pessoal

1. Fazer login no sistema
2. No menu lateral, clicar em **"Meu Dashboard"**
3. A tela será carregada com os dados do usuário logado

### Atualizar Dados

- Clicar no botão "Atualizar Dados" no final da página
- Os dados são recarregados automaticamente ao entrar na página

## 🔐 Permissões

- **Todos os usuários** têm acesso ao seu próprio dashboard pessoal
- Os dados exibidos são filtrados por:
  - Usuário logado (vendas criadas por ele)
  - Loja do usuário (se aplicável)
  - Técnico responsável (para OS)

## 💡 Configurações

### Meta Mensal

Atualmente, a meta mensal é definida no código:

```typescript
const [metaMensal, setMetaMensal] = useState(10000);
```

**Próximos passos**: Criar uma tela de configurações onde o usuário ou administrador possa definir metas personalizadas.

### Dias Úteis

O cálculo da meta diária usa 26 dias úteis como padrão:

```typescript
const diasUteis = 26;
const metaDiariaValor = metaMensal / diasUteis;
```

## 📱 Responsividade

O dashboard é totalmente responsivo:

- **Desktop**: Grid de 4 colunas para métricas principais
- **Tablet**: Grid de 2 colunas
- **Mobile**: Grid de 1 coluna

## 🎨 Design

### Cores das Bordas (Cards)

- Vendas de Hoje: Azul primário
- Ticket Médio: Verde (success)
- Total do Mês: Amarelo (warning)
- Meta Mensal: Roxo secundário

### Ícones

Todos os ícones são do pacote `lucide-react`:

- ShoppingCart, DollarSign, TrendingUp, Target
- Calendar, Clock, Award, CheckCircle, AlertCircle

## 🚀 Tecnologias Utilizadas

- **Next.js 15**: Framework React
- **HeroUI**: Biblioteca de componentes
- **Supabase**: Backend e banco de dados
- **TypeScript**: Tipagem estática
- **Lucide Icons**: Ícones modernos

## 📊 Estrutura de Dados

### Métricas Pessoais

```typescript
interface MetricasPessoais {
  vendasHoje: {
    total: number;
    quantidade: number;
    ticket_medio: number;
  };
  vendasMes: {
    total: number;
    quantidade: number;
  };
  metaMensal: {
    valor: number;
    progresso: number;
    faltando: number;
  };
  metaDiaria: {
    valor: number;
    progresso: number;
    faltando: number;
  };
  ordensServico: {
    aguardando: number;
    em_andamento: number;
    concluidas_mes: number;
  };
  ultimasVendas: Array<{
    id: string;
    numero_venda: number;
    valor_total: number;
    criado_em: string;
  }>;
}
```

## 📁 Arquivos Principais

- **Componente**: `/components/dashboard/DashboardPessoal.tsx`
- **Página**: `/app/sistema/dashboard-pessoal/page.tsx`
- **Menu**: `/components/Sidebar.tsx` (item "Meu Dashboard")

## 🔄 Melhorias Futuras

1. **Configuração de Metas**

   - Tela para definir metas personalizadas por usuário
   - Metas diferentes por período (semanal, mensal, trimestral)

2. **Gráficos de Evolução**

   - Gráfico de vendas ao longo do mês
   - Comparação com meses anteriores

3. **Notificações**

   - Alertas quando atingir metas
   - Lembretes de metas diárias

4. **Ranking**

   - Posição do usuário no ranking de vendas
   - Top performers do mês

5. **Exportação**
   - Exportar relatório de desempenho em PDF
   - Relatório mensal automático

## 🐛 Troubleshooting

### Dashboard não carrega

- Verificar permissões do usuário no banco de dados
- Conferir se o usuário está autenticado
- Verificar console do navegador para erros

### Métricas zeradas

- Verificar se há vendas criadas pelo usuário
- Confirmar que `criado_por` nas vendas está correto
- Verificar filtro de loja (se aplicável)

### OS não aparecem (técnicos)

- Verificar se `tipo_usuario` é "tecnico"
- Conferir se `tecnico_responsavel` está preenchido nas OS
- Verificar permissões de visualização
