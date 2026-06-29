/**
 * Bolão Copa 2026 — Backend (Google Apps Script)
 * Lê a planilha e devolve JSON com: ranking, jogos (Gabarito) e os palpites
 * de cada participante (para a "cartela" no site).
 *
 * PUBLICAR: Extensões > Apps Script (cole este arquivo) >
 * Implantar > Nova implantação > App da Web >
 *   Executar como: eu  |  Quem tem acesso: Qualquer pessoa  >  copie a URL /exec.
 */

var SHEET_RANKING  = 'Ranking';
var SHEET_GABARITO = 'Gabarito';
var N_PARTICIPANTES = 15;

var RANK_RANGE = 'B5:H19';   // B=Pos C=Nome D=Pontos E=Exato F=Simples G=Campeão H=Artilheiro
var FIX_RANGE  = 'A4:H75';   // A=Jogo B=Data C=Hora D=Grupo E=Mand F=Vis G=GolsMand H=GolsVis
var PAL_RANGE  = 'G4:H75';   // palpites do participante (Mand, Vis)
var PTS_RANGE  = 'I4:I75';   // pontos por jogo
var NOME_CEL   = 'D2';       // nome do participante
var TOTAL_CEL  = 'I88';      // total de pontos
var CLS_PICK   = 'E79:E82';  // palpite do top 4 (1º a 4º)
var CLS_PTS    = 'I79:I82';  // pontos do top 4
var GAB_STAND  = 'E79:E82';  // resultado oficial do top 4 (na aba Gabarito)

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var payload = {
    updatedAt: new Date().toISOString(),
    ranking:  readRanking(ss),
    fixtures: readFixtures(ss),
    players:  readPlayers(ss),
    standings: readStandings(ss)
  };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function readRanking(ss) {
  var sh = ss.getSheetByName(SHEET_RANKING);
  if (!sh) return [];
  var rows = sh.getRange(RANK_RANGE).getValues();
  var out = [];
  rows.forEach(function (v) {
    var nome = str(v[1]); if (!nome) return;
    out.push({ pos:num(v[0]), nome:nome, pts:num(v[2]), exato:num(v[3]),
               simples:num(v[4]), campeao:str(v[5]), art:str(v[6]) });
  });
  out.sort(function (a, b) { return b.pts - a.pts; });
  return out;
}

function readFixtures(ss) {
  var sh = ss.getSheetByName(SHEET_GABARITO);
  if (!sh) return [];
  var rows = sh.getRange(FIX_RANGE).getValues();
  return rows.filter(function (v) { return v[4] && v[5]; }).map(function (v) {
    return { jogo:num(v[0]), date:str(v[1]), time:str(v[2]), g:str(v[3]),
             home:str(v[4]), away:str(v[5]), hs:blankToNull(v[6]), as:blankToNull(v[7]) };
  });
}

function readPlayers(ss) {
  var out = [];
  for (var i = 1; i <= N_PARTICIPANTES; i++) {
    var sh = ss.getSheetByName('Participante ' + i);
    if (!sh) continue;
    var nome = str(sh.getRange(NOME_CEL).getValue());
    if (!nome) continue;
    var pal = sh.getRange(PAL_RANGE).getValues();
    var pts = sh.getRange(PTS_RANGE).getValues();
    var arr = [];
    for (var r = 0; r < pal.length; r++) {
      arr.push([ blankToNull(pal[r][0]), blankToNull(pal[r][1]), num(pts[r][0]) ]);
    }
    var clsP = sh.getRange(CLS_PICK).getValues();
    var clsT = sh.getRange(CLS_PTS).getValues();
    var classif = [], classifPts = [];
    for (var c = 0; c < clsP.length; c++) { classif.push(str(clsP[c][0])); classifPts.push(num(clsT[c][0])); }
    out.push({ nome: nome, total: num(sh.getRange(TOTAL_CEL).getValue()),
               palps: arr, classif: classif, classifPts: classifPts });
  }
  return out;
}

function readStandings(ss) {
  var sh = ss.getSheetByName(SHEET_GABARITO);
  if (!sh) return [];
  return sh.getRange(GAB_STAND).getValues().map(function (r) { return str(r[0]); });
}

// helpers
function num(x) { var n = Number(x); return isNaN(n) ? 0 : n; }
function str(x) { return (x === null || x === undefined) ? '' : String(x).trim(); }
function blankToNull(x) {
  if (x === '' || x === null || x === undefined) return null;
  var n = Number(x); return isNaN(n) ? null : n;
}
