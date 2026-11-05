# Fervo Checkout — demonstração
Protótipo de portfólio para organizar encomendas e acompanhar produção e vendas de uma pequena loja. Esta versão independente usa exclusivamente produtos, valores e registros fictícios.

## Experimente
Node.js 22 e npm: `npm ci`, `npm test`, `npm run dev`.
Abra http://localhost:3000. Selecione três chás para experimentar o combo, clique em **Simular pedido** e explore o gestor pelo aviso superior.

## Funcionalidades
- Cardápio responsivo e carrinho com combo de três unidades.
- Retirada/entrega e confirmação de pedido exclusivamente local.
- Gestor aberto para exploração: lotes, vendas, estoque, reposição e histórico.
- Exemplos iniciais de produção e venda; persistência no localStorage.

## Tecnologias
Next.js 15, React 19, TypeScript, Tailwind CSS e Lucide. Exportação HTML estática, sem backend, autenticação, banco remoto ou variáveis privadas.

## GitHub Pages
Destino: https://uhuvcl.github.io/fervo-checkout-demo/
No repositorio `uhuvcl/fervo-checkout-demo`, selecione Settings → Pages → Source → GitHub Actions. Pushes para main executam o workflow; nao sao necessarios secrets manuais.

Build local de publicacao: `npm ci`, `npm test`, `NEXT_PUBLIC_BASE_PATH=/fervo-checkout-demo npm run build`.
O arquivo public/.nojekyll e copiado automaticamente para out/. Sirva out/ montado no subdiretorio /fervo-checkout-demo/ para verificar os caminhos. Nao use npm start para exportacoes estaticas.
O desenvolvimento local continua com `npm run dev`, sem NEXT_PUBLIC_BASE_PATH.

## Limitações e privacidade
Não existe envio de WhatsApp, cobrança, Pix ou integração com a operação original. Não insira dados reais. Os campos do formulário não são enviados a servidores; o último pedido guarda apenas itens e total no navegador. Gestão e carrinho são fluxos independentes. Limpar os dados do site restaura os exemplos. Custos e preços são ilustrativos, sem valor comercial.
