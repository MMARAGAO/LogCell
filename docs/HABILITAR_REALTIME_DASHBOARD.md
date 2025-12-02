# ⚠️ SOLUÇÃO: HABILITAR REALTIME MANUALMENTE NO DASHBOARD

## 🔧 O erro "mismatch between server and client bindings" significa:

O Supabase Realtime Server precisa ser configurado manualmente no Dashboard.

---

## 📋 PASSO A PASSO (OBRIGATÓRIO):

### 1️⃣ Acesse o Supabase Dashboard

```
https://app.supabase.com
```

### 2️⃣ Vá em Database > Replication

```
Menu lateral esquerdo: Database
Aba superior: Replication
```

### 3️⃣ Habilite MANUALMENTE cada tabela:

**Para cada tabela abaixo, clique em "Enable":**

#### ✅ Tabela: `permissoes`

- Clique no botão **"Enable"** ou **"Add table"**
- Marque **todos** os eventos:
  - ☑️ INSERT
  - ☑️ UPDATE
  - ☑️ DELETE
- Clique em **"Save"**

#### ✅ Tabela: `notificacoes`

- Repita o processo acima

#### ✅ Tabela: `notificacoes_usuarios`

- Repita o processo acima

#### ✅ Tabela: `vendas`

- Repita o processo acima

#### ✅ Tabela: `itens_venda`

- Repita o processo acima

#### ✅ Tabela: `pagamentos_venda`

- Repita o processo acima

#### ✅ Tabela: `estoque_lojas`

- Repita o processo acima

#### ✅ Tabela: `transferencias`

- Repita o processo acima

---

## 🎯 Verificação

Após habilitar todas as tabelas, você deve ver uma lista similar a:

```
Table Name              | Events
------------------------|------------------
estoque_lojas           | INSERT, UPDATE, DELETE
itens_venda             | INSERT, UPDATE, DELETE
notificacoes            | INSERT, UPDATE, DELETE
notificacoes_usuarios   | INSERT, UPDATE, DELETE
pagamentos_venda        | INSERT, UPDATE, DELETE
permissoes              | INSERT, UPDATE, DELETE
transferencias          | INSERT, UPDATE, DELETE
vendas                  | INSERT, UPDATE, DELETE
```

---

## 🔄 Após Habilitar

1. **Recarregue o sistema**: `Ctrl+Shift+R`

2. **Verifique o console (F12)**:

   ```
   ✅ Inscrito para updates de permissões em tempo real
   ✅ [REALTIME:vendas] Conectado ao Realtime de vendas
   ```

3. **Teste com duas abas**:
   - Altere permissões em uma aba
   - Veja atualização automática na outra

---

## ❓ Por que o SQL não funcionou?

O script SQL (`EXECUTAR_AGORA_REALTIME.sql`) adiciona as tabelas à **publicação PostgreSQL**, mas o **Supabase Realtime Server** (que roda separadamente) precisa ser configurado via Dashboard para "escutar" essas tabelas.

É como configurar duas coisas:

1. ✅ Banco de dados pronto para enviar mudanças (SQL) ← FEITO
2. ⚠️ Servidor Realtime configurado para receber (Dashboard) ← PRECISA FAZER

---

## 🎬 Screenshot de Referência

A tela de Replication deve parecer com isso:

```
┌─────────────────────────────────────────┐
│ Database > Replication                  │
├─────────────────────────────────────────┤
│                                         │
│ Tables                                  │
│ ┌─────────────────────┐                │
│ │ + Add table         │ ← Clique aqui  │
│ └─────────────────────┘                │
│                                         │
│ ✓ permissoes         [Edit] [Remove]  │
│   Events: INSERT, UPDATE, DELETE       │
│                                         │
│ ✓ vendas             [Edit] [Remove]  │
│   Events: INSERT, UPDATE, DELETE       │
│                                         │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Acessei Supabase Dashboard
- [ ] Fui em Database > Replication
- [ ] Habilitei `permissoes` com INSERT, UPDATE, DELETE
- [ ] Habilitei `notificacoes` com INSERT, UPDATE, DELETE
- [ ] Habilitei `notificacoes_usuarios` com INSERT, UPDATE, DELETE
- [ ] Habilitei `vendas` com INSERT, UPDATE, DELETE
- [ ] Habilitei `itens_venda` com INSERT, UPDATE, DELETE
- [ ] Habilitei `pagamentos_venda` com INSERT, UPDATE, DELETE
- [ ] Habilitei `estoque_lojas` com INSERT, UPDATE, DELETE
- [ ] Habilitei `transferencias` com INSERT, UPDATE, DELETE
- [ ] Recarreguei o sistema (Ctrl+Shift+R)
- [ ] Vi mensagem "✅ Inscrito para updates" no console

---

**Após completar estes passos, o Realtime funcionará! 🎉**
