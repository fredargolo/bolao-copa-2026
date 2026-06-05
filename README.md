# Bolão Copa 2026 — site de acompanhamento

Página estática (verde, mobile-first) que mostra o **ranking ao vivo**, os **jogos por grupo** e os **12 grupos** da Copa 2026, lendo os dados da sua planilha do Google Sheets.

## Arquivos
- **index.html** — a página (não precisa editar).
- **config.js** — onde você cola a URL da API (1 linha).
- **Code.gs** — código do Apps Script (vai na planilha, **não** no GitHub; está aqui só como referência).

## Como publicar no GitHub Pages
1. Crie um repositório novo (ex.: `bolao-copa-2026`).
2. Suba os arquivos `index.html` e `config.js` (botão **Add file → Upload files**).
3. Vá em **Settings → Pages**.
4. Em **Build and deployment**, *Source* = **Deploy from a branch**; *Branch* = `main` / pasta `/ (root)` → **Save**.
5. Aguarde ~1 min. O link aparece no topo da página de Pages, algo como:
   `https://SEU-USUARIO.github.io/bolao-copa-2026/`
6. Esse link é o que você manda no grupo do WhatsApp.

## Como ligar na planilha (dados ao vivo)
1. Suba `Bolao_Copa_2026.xlsx` no Drive e **abra como Planilhas Google**.
2. Na planilha: **Extensões → Apps Script**, apague tudo e cole o conteúdo de `Code.gs`.
3. **Implantar → Nova implantação → App da Web**
   - *Executar como:* eu
   - *Quem tem acesso:* **Qualquer pessoa**
4. Copie a URL que termina em **`/exec`**.
5. Abra `config.js` no GitHub (**ícone de lápis** para editar), cole a URL entre as aspas e salve (Commit):
   ```js
   window.BOLAO_API_URL = "https://script.google.com/macros/s/XXXX/exec";
   ```
6. Recarregue o site. Deve aparecer o selo **AO VIVO** no topo.

> Enquanto `config.js` estiver vazio, o site mostra **dados de exemplo** — ótimo para testar o visual antes de conectar.

## Atualizar resultados
É só lançar os placares na aba **Gabarito** da planilha. O site reflete a cada refresh — não precisa republicar nada.
