# Como usar a câmera do iPhone com o servidor local

## Configuração realizada:

Foi adicionado o script `dev:https` que configura HTTPS automático para desenvolvimento.

## Como usar:

### Opção 1: HTTPS Local (Recomendado para iPhone)

1. **Inicie o servidor com HTTPS:**

   ```bash
   npm run dev:https
   ```

2. **Encontre o IP do seu PC:**

   - Abra o PowerShell e execute: `ipconfig`
   - Procure por "Adaptador de Rede sem Fio" ou "Ethernet"
   - Anote o "Endereço IPv4" (exemplo: 192.168.1.100)

3. **No iPhone:**
   - Conecte-se à mesma rede WiFi do seu PC
   - Abra o Safari
   - Acesse: `https://[SEU_IP]:3000`
   - Exemplo: `https://192.168.1.100:3000`
4. **Aceite o certificado:**

   - O navegador mostrará um aviso de certificado não confiável
   - Clique em "Avançado" ou "Detalhes"
   - Clique em "Continuar" ou "Aceitar risco"
   - Isso é normal em desenvolvimento local

5. **Permita o acesso à câmera:**
   - Quando a página abrir, permita o acesso à câmera
   - Agora o scanner deve funcionar!

### Opção 2: Desenvolvimento Normal (só localhost)

```bash
npm run dev
```

## Portas utilizadas:

- **3000**: HTTPS (acesse do iPhone)
- **3001**: HTTP Next.js (interno)

## Troubleshooting:

### Se o iPhone não conectar:

1. **Verifique o Firewall do Windows:**

   - Pressione Windows + R
   - Digite: `wf.msc`
   - Vá em "Regras de Entrada"
   - Certifique-se que Node.js está permitido

2. **Crie uma regra de firewall:**
   ```powershell
   New-NetFirewallRule -DisplayName "Next.js Dev HTTPS" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

### Se aparecer "NET::ERR_CERT_INVALID":

Isso é esperado! Clique em "Avançado" → "Continuar para [site]"

### Verificar se o servidor está rodando:

No navegador do PC, acesse: `https://localhost:3000`

## Dica:

Para facilitar, você pode criar um QR Code com o endereço HTTPS e escanear no iPhone!
