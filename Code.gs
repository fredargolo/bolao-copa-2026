/**
 * Bolão Copa 2026 — Backend (Google Apps Script)
 * --------------------------------------------------
 * Lê a planilha do bolão (abas "Ranking" e "Gabarito") e devolve um JSON
 * que a página verde (GitHub Pages) consome para mostrar tudo ao vivo.
 *
 * COMO PUBLICAR:
 * 1) Suba o arquivo Bolao_Copa_2026.xlsx no Google Drive e abra como Planilhas Google.
 * 2) Na planilha: Extensões > Apps Script. Apague o conteúdo e cole este arquivo.
 * 3) Implantar > Nova implantação > tipo "App da Web".
 *      - Executar como: Eu (seu e-mail)
 *      - Quem tem acesso: Qualquer pessoa
 * 4) Copie a URL que termina em /exec e cole em CONFIG.API_URL na página.
 *
 * Teste rápido: abra a URL /exec no navegador — deve aparecer o JSON.
 */

// Ajuste aqui se você renomear as abas:
var SHEET_RANKING  = 'Ranking';
var SHEET_GABARITO = 'Gabarito';

// Layout da planilha (não precisa mexer se você usou a planilha que eu gerei):
var RANK_RANGE = 'B5:H19';   // 15 participantes: B=Pos C=Nome D=Pontos E=Exato F=Simples G=Campeão H=Artilheiro
var FIX_RANGE  = 'A4:H75';   // 72 jogos: A=Jogo B=Data C=Hora D=Grupo E=Mandante F=Visitante G=GolsMand H=GolsVis

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var payload = {
    updatedAt: new Date().toISOString(),
    ranking: readRanking(ss),
    fixtures: readFixtures(ss)
  };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function readRanking(ss) {
  var sh = ss.getSheetByName(SHEET_RANKING);
  if (!sh) return [];
  var rows = sh.getRange(RANK_RANGE).getValues(); // [B,C,D,E,F,G,H]
  var out = [];
  rows.forEach(function (v) {
    var nome = (v[1] === null || v[1] === undefined) ? '' : String(v[1]).trim();
    if (!nome) return;                 // pula participantes ainda sem nome
    out.push({
      pos: num(v[0]),
      nome: nome,
      pts: num(v[2]),
      exato: num(v[3]),
      simples: num(v[4]),
      campeao: str(v[5]),
      art: str(v[6])
    });
  });
  // já vem ordenado da planilha, mas garantimos por pontos:
  out.sort(function (a, b) { return b.pts - a.pts; });
  return out;
}

function readFixtures(ss) {
  var sh = ss.getSheetByName(SHEET_GABARITO);
  if (!sh) return [];
  var rows = sh.getRange(FIX_RANGE).getValues(); // [A..H]
  return rows
    .filter(function (v) { return v[4] && v[5]; }) // tem mandante e visitante
    .map(function (v) {
      return {
        jogo: num(v[0]),
        date: str(v[1]),
        time: str(v[2]),
        g: str(v[3]),
        home: str(v[4]),
        away: str(v[5]),
        hs: blankToNull(v[6]),
        as: blankToNull(v[7])
      };
    });
}

// helpers
function num(x) { var n = Number(x); return isNaN(n) ? 0 : n; }
function str(x) { return (x === null || x === undefined) ? '' : String(x).trim(); }
function blankToNull(x) {
  if (x === '' || x === null || x === undefined) return null;
  var n = Number(x); return isNaN(n) ? null : n;
}
