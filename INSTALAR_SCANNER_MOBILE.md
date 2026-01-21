# 📦 Instalação de Dependências - Scanner Mobile

## Dependência Necessária

Para o funcionamento do novo scanner mobile de códigos de barras e QR Code, é necessário instalar a biblioteca **@zxing/library**.

## 🚀 Instalação Rápida

### Usando npm:
```bash
npm install @zxing/library
```

### Usando yarn:
```bash
yarn add @zxing/library
```

## 📋 Verificação

Após a instalação, verifique se a dependência foi adicionada ao `package.json`:

```json
{
  "dependencies": {
    "@zxing/library": "^0.20.0"
  }
}
```

## ✅ Teste de Funcionamento

1. Execute o projeto:
   ```bash
   npm start
   ```

2. Acesse a página de Livros

3. Clique em "Escanear" (em mobile) ou "Digite o ISBN" (em desktop)

4. Se aparecer o dialog com as abas "Câmera" e "Digitar ISBN", a instalação foi bem-sucedida!

## 🔧 Troubleshooting

### Erro: Cannot find module '@zxing/library'

**Solução:**
```bash
npm install @zxing/library --save
```

### Erro de permissão no npm

**Solução:**
```bash
sudo npm install @zxing/library
```

### Cache corrompido

**Solução:**
```bash
npm cache clean --force
npm install
```

## 📱 Testando o Scanner

### Em Desktop:
- Será usado o componente `BarcodeScannerDialog` (entrada manual de ISBN)

### Em Mobile:
- Será usado o componente `MobileBarcodeScanner` (câmera + entrada manual)

## 🌐 Navegadores Suportados

### Câmera (MediaDevices API):
- ✅ Chrome/Edge (mobile e desktop)
- ✅ Safari (iOS 11+)
- ✅ Firefox (mobile e desktop)
- ⚠️ Requer HTTPS (ou localhost)

### Detecção de Códigos:
- ✅ Código de Barras (EAN-13, EAN-8, UPC-A, etc)
- ✅ QR Code
- ✅ ISBN-10 e ISBN-13

## 📝 Comandos Úteis

### Verificar versão instalada:
```bash
npm list @zxing/library
```

### Atualizar para última versão:
```bash
npm update @zxing/library
```

### Remover e reinstalar:
```bash
npm uninstall @zxing/library
npm install @zxing/library
```

## 🎯 Próximo Passo

Após instalar a dependência, acesse: [MELHORIAS_MOBILE_v3.5.2.md](MELHORIAS_MOBILE_v3.5.2.md) para ver todas as melhorias implementadas.

---

**Data:** 21 de Janeiro de 2026  
**Versão:** 3.5.2
