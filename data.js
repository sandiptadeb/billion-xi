// Player dataset.
// Values are APPROXIMATE Transfermarkt-style market values (EUR millions, used 1:1 as $m in-game)
// and approximate league stats, written from memory. Edit freely.
//
// P(name, nationality, position, birthYear, finalValue, seasons)
//   finalValue = valuation used for the final portfolio evaluation (summer 2026)
//   seasons    = 10 rows, one per season 2016/17 .. 2025/26:
//                [club, leagueCode, marketValue, apps, goals, assists, cleanSheets, avgRating]
//                or null if the player was not yet a senior regular (only allowed at the start).

const LEAGUES = {
  EPL: "Premier League", LL: "LaLiga", SA: "Serie A", BL: "Bundesliga", L1: "Ligue 1",
  POR: "Liga Portugal", ERE: "Eredivisie", CH: "Championship (ENG 2nd tier)", SEG: "LaLiga 2 (ESP 2nd tier)",
  BL2: "2. Bundesliga (GER 2nd tier)", SPL: "Saudi Pro League", MLS: "Major League Soccer",
  HNL: "HNL (Croatia)", SCO: "Scottish Premiership", CSL: "Chinese Super League", TSL: "Süper Lig (Turkey)",
  ARG: "Liga Profesional (Argentina)", BRA: "Brasileirão (Brazil)", RPL: "Russian Premier League",
  GEO: "Erovnuli Liga (Georgia)", NOR: "Eliteserien (Norway)", SWE: "Allsvenskan (Sweden)",
  BEL: "Belgian Pro League", K1: "K League 1 (Korea)",
  ENG3: "League One (ENG 3rd tier)", SB: "Serie B (ITA 2nd tier)", EED: "Eerste Divisie (NED 2nd tier)",
  AUT: "Austrian Bundesliga", SUI: "Swiss Super League", SRB: "Serbian SuperLiga", MX: "Liga MX (Mexico)",
  QSL: "Qatar Stars League", ECU: "LigaPro (Ecuador)",
};

const PLAYERS = [];
function P(name, nat, pos, born, now, seasons) {
  PLAYERS.push({ id: PLAYERS.length + 1, name, nat, pos, born, now, s: seasons });
}

// ---------------- GOALKEEPERS ----------------
P("Alisson Becker", "Brazil", "GK", 1992, 15, [
  ["AS Roma","SA",18,2,0,0,1,6.6],["AS Roma","SA",60,37,0,0,17,7.2],["Liverpool","EPL",90,38,0,0,21,7.2],
  ["Liverpool","EPL",80,29,0,0,13,7.0],["Liverpool","EPL",80,33,0,0,10,6.9],["Liverpool","EPL",60,36,0,0,20,7.1],
  ["Liverpool","EPL",45,37,0,0,14,7.0],["Liverpool","EPL",35,28,0,0,8,7.0],["Liverpool","EPL",25,28,0,0,9,6.9],
  ["Liverpool","EPL",18,28,0,0,9,6.9]]);
P("Ederson", "Brazil", "GK", 1993, 15, [
  ["Benfica","POR",20,27,0,0,16,7.0],["Manchester City","EPL",40,36,0,0,18,7.0],["Manchester City","EPL",60,38,0,0,20,6.9],
  ["Manchester City","EPL",56,35,0,0,16,6.8],["Manchester City","EPL",56,36,0,0,19,6.9],["Manchester City","EPL",40,37,0,0,20,6.9],
  ["Manchester City","EPL",40,35,0,0,11,6.8],["Manchester City","EPL",40,33,0,0,10,6.8],["Manchester City","EPL",30,26,0,0,7,6.7],
  ["Fenerbahçe","TSL",20,28,0,0,10,6.9]]);
P("Thibaut Courtois", "Belgium", "GK", 1992, 18, [
  ["Chelsea","EPL",45,36,0,0,16,7.0],["Chelsea","EPL",60,35,0,0,12,6.9],["Real Madrid","LL",65,27,0,0,7,6.7],
  ["Real Madrid","LL",60,34,0,0,18,7.0],["Real Madrid","LL",60,38,0,0,14,7.0],["Real Madrid","LL",60,36,0,0,13,7.1],
  ["Real Madrid","LL",45,35,0,0,12,7.0],["Real Madrid","LL",35,1,0,0,1,6.9],["Real Madrid","LL",25,35,0,0,11,6.9],
  ["Real Madrid","LL",22,34,0,0,13,7.1]]);
P("Jan Oblak", "Slovenia", "GK", 1993, 15, [
  ["Atlético Madrid","LL",65,30,0,0,18,7.1],["Atlético Madrid","LL",80,37,0,0,22,7.3],["Atlético Madrid","LL",90,37,0,0,20,7.2],
  ["Atlético Madrid","LL",100,38,0,0,18,7.0],["Atlético Madrid","LL",90,38,0,0,18,7.1],["Atlético Madrid","LL",70,38,0,0,8,6.8],
  ["Atlético Madrid","LL",40,38,0,0,18,7.0],["Atlético Madrid","LL",30,38,0,0,9,6.8],["Atlético Madrid","LL",25,38,0,0,15,7.0],
  ["Atlético Madrid","LL",18,33,0,0,11,6.9]]);
P("Marc-André ter Stegen", "Germany", "GK", 1992, 8, [
  ["Barcelona","LL",30,36,0,0,11,6.8],["Barcelona","LL",60,37,0,0,18,7.1],["Barcelona","LL",90,35,0,0,12,7.1],
  ["Barcelona","LL",90,36,0,0,13,7.0],["Barcelona","LL",70,28,0,0,8,6.8],["Barcelona","LL",60,35,0,0,13,6.8],
  ["Barcelona","LL",35,38,0,0,26,7.2],["Barcelona","LL",28,28,0,0,9,6.8],["Barcelona","LL",18,7,0,0,2,6.7],
  ["Barcelona","LL",12,3,0,0,0,6.6]]);
P("Gianluigi Donnarumma", "Italy", "GK", 1999, 40, [
  ["AC Milan","SA",35,38,0,0,12,6.9],["AC Milan","SA",40,38,0,0,13,6.8],["AC Milan","SA",50,35,0,0,12,6.9],
  ["AC Milan","SA",60,38,0,0,11,6.9],["AC Milan","SA",60,37,0,0,14,7.0],["Paris Saint-Germain","L1",65,24,0,0,11,6.9],
  ["Paris Saint-Germain","L1",45,37,0,0,14,6.9],["Paris Saint-Germain","L1",40,30,0,0,10,6.8],["Paris Saint-Germain","L1",40,29,0,0,10,6.9],
  ["Manchester City","EPL",40,32,0,0,13,7.0]]);
P("Mike Maignan", "France", "GK", 1995, 25, [
  ["Lille","L1",4,12,0,0,3,6.7],["Lille","L1",12,38,0,0,10,6.9],["Lille","L1",20,38,0,0,15,7.0],
  ["Lille","L1",20,28,0,0,11,6.9],["Lille","L1",32,38,0,0,21,7.1],["AC Milan","SA",40,32,0,0,17,7.0],
  ["AC Milan","SA",40,21,0,0,6,6.9],["AC Milan","SA",40,32,0,0,9,6.9],["AC Milan","SA",35,35,0,0,8,6.8],
  ["AC Milan","SA",28,34,0,0,14,7.0]]);
P("Emiliano Martínez", "Argentina", "GK", 1992, 15, [
  ["Getafe","SEG",2,7,0,0,2,6.6],["Getafe","LL",3,5,0,0,1,6.6],["Reading","CH",4,18,0,0,3,6.7],
  ["Arsenal","EPL",6,9,0,0,3,6.9],["Aston Villa","EPL",25,38,0,0,15,7.0],["Aston Villa","EPL",28,36,0,0,10,6.9],
  ["Aston Villa","EPL",28,36,0,0,11,6.9],["Aston Villa","EPL",28,34,0,0,9,6.9],["Aston Villa","EPL",25,36,0,0,10,7.0],
  ["Aston Villa","EPL",20,32,0,0,9,6.8]]);
P("Diogo Costa", "Portugal", "GK", 1999, 40, [
  null,null,null,
  null,["FC Porto","POR",3,2,0,0,1,6.6],["FC Porto","POR",18,34,0,0,19,7.0],
  ["FC Porto","POR",40,33,0,0,21,7.1],["FC Porto","POR",45,33,0,0,15,7.0],["FC Porto","POR",40,33,0,0,14,6.9],
  ["FC Porto","POR",40,32,0,0,20,7.0]]);
P("Gregor Kobel", "Switzerland", "GK", 1997, 40, [
  null,null,["FC Augsburg","BL",4,16,0,0,3,6.8],
  ["VfB Stuttgart","BL2",5,33,0,0,12,6.9],["VfB Stuttgart","BL",10,33,0,0,7,6.9],["Borussia Dortmund","BL",30,29,0,0,8,6.9],
  ["Borussia Dortmund","BL",35,25,0,0,8,7.0],["Borussia Dortmund","BL",40,28,0,0,13,7.0],["Borussia Dortmund","BL",40,33,0,0,9,6.9],
  ["Borussia Dortmund","BL",40,33,0,0,12,7.0]]);

// ---------------- DEFENDERS ----------------
P("Virgil van Dijk", "Netherlands", "DEF", 1991, 12, [
  ["Southampton","EPL",30,21,1,0,8,7.1],["Liverpool","EPL",60,14,0,0,5,7.0],["Liverpool","EPL",90,38,4,2,21,7.5],
  ["Liverpool","EPL",80,38,5,1,15,7.3],["Liverpool","EPL",80,5,1,0,2,7.0],["Liverpool","EPL",45,34,3,1,21,7.3],
  ["Liverpool","EPL",40,32,3,1,11,7.0],["Liverpool","EPL",30,36,2,2,11,7.2],["Liverpool","EPL",23,37,3,1,13,7.3],
  ["Liverpool","EPL",18,36,3,1,11,7.0]]);
P("Rúben Dias", "Portugal", "DEF", 1997, 50, [
  null,["Benfica","POR",15,26,1,0,13,7.0],["Benfica","POR",40,31,3,0,14,7.1],
  ["Benfica","POR",40,32,3,0,16,7.1],["Manchester City","EPL",70,32,1,0,15,7.3],["Manchester City","EPL",75,29,2,1,14,7.1],
  ["Manchester City","EPL",80,26,0,0,11,7.0],["Manchester City","EPL",80,30,0,1,12,7.0],["Manchester City","EPL",70,26,1,0,8,6.9],
  ["Manchester City","EPL",55,30,1,0,11,7.0]]);
P("Trent Alexander-Arnold", "England", "DEF", 1998, 55, [
  ["Liverpool","EPL",1,7,0,0,3,6.6],["Liverpool","EPL",15,19,1,1,8,6.9],["Liverpool","EPL",60,29,1,12,17,7.4],
  ["Liverpool","EPL",110,38,4,13,15,7.5],["Liverpool","EPL",80,36,2,7,10,7.1],["Liverpool","EPL",80,32,2,12,16,7.6],
  ["Liverpool","EPL",65,37,2,9,10,7.1],["Liverpool","EPL",70,28,3,4,8,7.3],["Liverpool","EPL",75,33,3,6,12,7.2],
  ["Real Madrid","LL",65,18,1,3,6,6.9]]);
P("Andrew Robertson", "Scotland", "DEF", 1994, 7, [
  ["Hull City","EPL",6,24,1,1,3,6.8],["Liverpool","EPL",15,22,1,5,10,7.0],["Liverpool","EPL",65,36,0,11,20,7.3],
  ["Liverpool","EPL",70,36,2,12,15,7.3],["Liverpool","EPL",65,38,1,7,10,7.1],["Liverpool","EPL",60,29,3,10,16,7.4],
  ["Liverpool","EPL",40,34,0,8,9,7.0],["Liverpool","EPL",30,23,0,2,6,6.9],["Liverpool","EPL",18,33,0,2,9,6.9],
  ["Liverpool","EPL",10,22,0,2,5,6.8]]);
P("Achraf Hakimi", "Morocco", "DEF", 1998, 75, [
  null,["Real Madrid","LL",12,9,2,1,4,6.9],["Borussia Dortmund","BL",30,21,2,5,7,7.2],
  ["Borussia Dortmund","BL",60,33,5,10,8,7.2],["Inter Milan","SA",70,37,7,8,14,7.3],["Paris Saint-Germain","L1",70,32,4,6,11,7.1],
  ["Paris Saint-Germain","L1",65,30,5,4,10,7.0],["Paris Saint-Germain","L1",65,31,4,5,11,7.1],["Paris Saint-Germain","L1",60,32,4,7,13,7.4],
  ["Paris Saint-Germain","L1",80,28,4,6,11,7.3]]);
P("Alphonso Davies", "Canada", "DEF", 2000, 35, [
  ["Vancouver Whitecaps","MLS",1,8,0,0,0,6.5],["Vancouver Whitecaps","MLS",4,25,3,6,0,7.0],["Vancouver Whitecaps","MLS",10,31,8,11,0,7.4],
  ["Bayern Munich","BL",60,29,1,6,13,7.2],["Bayern Munich","BL",80,23,1,3,6,7.0],["Bayern Munich","BL",70,24,1,5,8,7.0],
  ["Bayern Munich","BL",70,26,0,3,8,6.9],["Bayern Munich","BL",60,29,1,4,9,6.9],["Bayern Munich","BL",50,22,1,2,8,6.9],
  ["Bayern Munich","BL",40,10,0,1,3,6.8]]);
P("Joško Gvardiol", "Croatia", "DEF", 2002, 65, [
  null,null,null,
  ["Dinamo Zagreb","HNL",5,9,0,0,4,6.8],["Dinamo Zagreb","HNL",15,21,1,0,10,7.0],["RB Leipzig","BL",75,29,2,1,8,7.1],
  ["RB Leipzig","BL",90,27,1,0,7,7.1],["Manchester City","EPL",75,28,4,2,11,7.1],["Manchester City","EPL",75,37,5,1,10,7.0],
  ["Manchester City","EPL",70,20,2,1,7,7.0]]);
P("William Saliba", "France", "DEF", 2001, 90, [
  null,null,["Saint-Étienne","L1",8,16,0,0,6,6.9],
  ["Saint-Étienne","L1",25,12,0,0,3,6.8],["OGC Nice","L1",20,20,1,0,6,6.9],["Marseille","L1",35,36,0,0,14,7.1],
  ["Arsenal","EPL",70,27,2,1,10,7.2],["Arsenal","EPL",80,38,2,1,18,7.3],["Arsenal","EPL",80,35,2,0,13,7.2],
  ["Arsenal","EPL",90,30,1,0,17,7.2]]);
P("Ronald Araújo", "Uruguay", "DEF", 1999, 30, [
  null,null,null,
  ["Barcelona","LL",4,5,0,0,2,6.6],["Barcelona","LL",25,24,2,0,9,7.0],["Barcelona","LL",60,30,4,1,11,7.1],
  ["Barcelona","LL",70,22,1,0,16,7.1],["Barcelona","LL",70,30,1,0,12,6.9],["Barcelona","LL",45,13,0,0,5,6.8],
  ["Barcelona","LL",35,20,1,0,6,6.8]]);
P("Kalidou Koulibaly", "Senegal", "DEF", 1991, 4, [
  ["Napoli","SA",40,29,2,0,11,7.1],["Napoli","SA",60,36,5,0,15,7.3],["Napoli","SA",80,35,2,0,16,7.3],
  ["Napoli","SA",65,25,0,0,7,7.0],["Napoli","SA",50,26,1,0,8,7.0],["Napoli","SA",40,27,3,0,13,7.2],
  ["Chelsea","EPL",30,23,2,0,8,6.8],["Al-Hilal","SPL",15,28,1,0,14,7.0],["Al-Hilal","SPL",10,21,1,0,7,6.9],
  ["Al-Hilal","SPL",6,25,1,0,10,6.9]]);
P("Marquinhos", "Brazil", "DEF", 1994, 32, [
  ["Paris Saint-Germain","L1",40,31,2,0,14,7.0],["Paris Saint-Germain","L1",60,32,2,0,19,7.1],["Paris Saint-Germain","L1",75,27,3,0,14,7.1],
  ["Paris Saint-Germain","L1",75,20,4,0,13,7.2],["Paris Saint-Germain","L1",75,28,3,1,13,7.1],["Paris Saint-Germain","L1",70,34,3,1,13,7.1],
  ["Paris Saint-Germain","L1",70,33,2,0,12,7.0],["Paris Saint-Germain","L1",65,27,1,0,10,7.0],["Paris Saint-Germain","L1",50,28,2,0,11,7.0],
  ["Paris Saint-Germain","L1",40,27,1,0,10,6.9]]);
P("Antonio Rüdiger", "Germany", "DEF", 1993, 10, [
  ["AS Roma","SA",18,26,0,0,12,6.9],["Chelsea","EPL",35,32,2,0,11,7.0],["Chelsea","EPL",40,33,1,0,15,7.1],
  ["Chelsea","EPL",30,20,2,0,6,6.9],["Chelsea","EPL",30,19,1,0,10,7.0],["Chelsea","EPL",40,34,3,1,16,7.3],
  ["Real Madrid","LL",35,33,1,0,14,7.0],["Real Madrid","LL",30,33,2,0,16,7.1],["Real Madrid","LL",20,29,1,0,9,6.9],
  ["Real Madrid","LL",15,22,1,0,8,6.9]]);
P("Theo Hernández", "France", "DEF", 1997, 28, [
  ["Deportivo Alavés","LL",8,30,1,3,10,6.9],["Real Madrid","LL",15,14,0,1,4,6.7],["Real Sociedad","LL",18,24,1,1,6,6.9],
  ["AC Milan","SA",35,33,6,6,9,7.2],["AC Milan","SA",50,33,7,5,12,7.2],["AC Milan","SA",60,32,5,6,16,7.3],
  ["AC Milan","SA",60,33,4,4,10,7.1],["AC Milan","SA",60,32,5,4,8,7.2],["AC Milan","SA",40,32,2,3,7,6.9],
  ["Al-Hilal","SPL",30,28,3,5,10,7.1]]);
P("Alessandro Bastoni", "Italy", "DEF", 1999, 65, [
  ["Atalanta","SA",3,4,0,0,1,6.5],["Atalanta","SA",8,4,0,0,1,6.6],["Parma","SA",15,24,1,0,6,6.9],
  ["Inter Milan","SA",40,25,1,1,11,7.0],["Inter Milan","SA",60,33,1,3,16,7.1],["Inter Milan","SA",60,34,1,7,15,7.2],
  ["Inter Milan","SA",60,34,1,5,14,7.1],["Inter Milan","SA",80,31,1,5,19,7.3],["Inter Milan","SA",70,32,1,4,12,7.2],
  ["Inter Milan","SA",70,32,1,4,14,7.2]]);
P("Jeremie Frimpong", "Netherlands", "DEF", 2000, 40, [
  null,null,null,
  ["Celtic","SCO",2,9,1,1,5,6.9],["Celtic","SCO",10,28,1,3,13,7.0],["Bayer Leverkusen","BL",20,25,2,3,6,7.0],
  ["Bayer Leverkusen","BL",40,33,8,7,7,7.3],["Bayer Leverkusen","BL",50,32,9,7,13,7.5],["Bayer Leverkusen","BL",50,33,2,5,9,7.1],
  ["Liverpool","EPL",45,22,1,3,6,6.9]]);
P("Kim Min-jae", "South Korea", "DEF", 1996, 28, [
  null,["Jeonbuk Hyundai","K1",2,29,2,0,12,7.0],["Jeonbuk Hyundai","K1",5,28,1,0,14,7.0],
  ["Beijing Guoan","CSL",8,15,1,0,7,6.9],["Beijing Guoan","CSL",12,14,0,0,6,6.9],["Fenerbahçe","TSL",15,31,1,0,13,7.0],
  ["Napoli","SA",50,35,2,2,16,7.3],["Bayern Munich","BL",60,25,1,0,8,6.9],["Bayern Munich","BL",45,27,2,0,12,7.0],
  ["Bayern Munich","BL",30,25,2,0,10,7.0]]);
P("Matthijs de Ligt", "Netherlands", "DEF", 1999, 30, [
  ["Ajax","ERE",5,11,1,0,4,6.9],["Ajax","ERE",35,33,3,0,12,7.2],["Ajax","ERE",75,34,3,0,14,7.4],
  ["Juventus","SA",75,29,3,0,10,7.0],["Juventus","SA",75,24,1,0,9,7.0],["Juventus","SA",70,31,3,0,13,7.0],
  ["Bayern Munich","BL",70,31,2,1,16,7.1],["Bayern Munich","BL",65,16,0,0,6,6.9],["Manchester United","EPL",40,29,3,0,7,6.8],
  ["Manchester United","EPL",35,20,1,0,5,6.9]]);
P("João Cancelo", "Portugal", "DEF", 1994, 6, [
  ["Valencia","LL",15,32,1,4,7,6.8],["Inter Milan","SA",35,26,1,4,11,7.1],["Juventus","SA",60,25,1,3,13,7.1],
  ["Manchester City","EPL",50,17,0,2,7,6.9],["Manchester City","EPL",60,28,2,2,16,7.3],["Manchester City","EPL",60,36,1,7,20,7.4],
  ["Bayern Munich","BL",40,23,1,3,8,7.0],["Barcelona","LL",30,32,4,3,11,7.1],["Al-Hilal","SPL",12,20,2,5,8,7.0],
  ["Al-Hilal","SPL",8,18,1,4,7,7.0]]);
P("Pau Cubarsí", "Spain", "DEF", 2007, 80, [
  null,null,null,null,null,null,null,
  ["Barcelona","LL",30,19,0,0,6,7.0],["Barcelona","LL",60,35,0,2,12,7.1],["Barcelona","LL",80,33,0,1,11,7.1]]);
P("Kieran Trippier", "England", "DEF", 1990, 2, [
  ["Tottenham Hotspur","EPL",12,12,0,5,4,6.9],["Tottenham Hotspur","EPL",22,24,0,6,10,7.0],["Tottenham Hotspur","EPL",25,27,1,2,8,6.8],
  ["Atlético Madrid","LL",20,28,0,3,12,6.9],["Atlético Madrid","LL",20,28,2,6,13,7.2],["Newcastle United","EPL",13,6,2,0,2,7.2],
  ["Newcastle United","EPL",12,38,1,7,14,7.4],["Newcastle United","EPL",12,28,1,10,5,7.1],["Newcastle United","EPL",5,22,0,2,6,6.8],
  ["Newcastle United","EPL",3,20,0,3,5,6.8]]);
P("Gabriel Magalhães", "Brazil", "DEF", 1997, 70, [
  null,["Troyes","L1",3,12,0,0,3,6.7],["Lille","L1",8,15,0,0,6,6.9],
  ["Lille","L1",20,24,1,0,10,7.0],["Arsenal","EPL",35,23,2,0,7,6.9],["Arsenal","EPL",40,35,5,0,13,7.0],
  ["Arsenal","EPL",50,38,3,0,14,7.1],["Arsenal","EPL",65,36,4,0,18,7.2],["Arsenal","EPL",75,28,3,1,11,7.1],
  ["Arsenal","EPL",75,30,4,0,17,7.3]]);
P("Nuno Mendes", "Portugal", "DEF", 2002, 75, [
  null,null,null,
  null,["Sporting CP","POR",30,29,1,3,18,7.0],["Paris Saint-Germain","L1",45,25,1,4,10,7.0],
  ["Paris Saint-Germain","L1",45,18,1,2,6,6.9],["Paris Saint-Germain","L1",40,13,1,1,4,6.8],["Paris Saint-Germain","L1",60,30,3,4,12,7.2],
  ["Paris Saint-Germain","L1",75,28,2,4,11,7.3]]);
P("Kyle Walker", "England", "DEF", 1990, 2, [
  ["Tottenham Hotspur","EPL",30,33,0,4,16,7.1],["Manchester City","EPL",40,32,0,4,18,7.1],["Manchester City","EPL",40,33,1,2,20,7.0],
  ["Manchester City","EPL",35,29,1,3,12,7.0],["Manchester City","EPL",30,25,1,1,13,6.9],["Manchester City","EPL",25,20,0,1,11,6.9],
  ["Manchester City","EPL",15,27,0,1,11,6.9],["Manchester City","EPL",12,32,0,4,12,7.0],["AC Milan","SA",8,11,0,1,3,6.7],
  ["Burnley","EPL",3,30,0,2,6,6.8]]);
P("Dani Carvajal", "Spain", "DEF", 1992, 5, [
  ["Real Madrid","LL",30,24,0,4,8,7.0],["Real Madrid","LL",45,26,0,2,9,7.0],["Real Madrid","LL",50,25,0,3,7,6.9],
  ["Real Madrid","LL",40,30,1,5,13,7.0],["Real Madrid","LL",30,13,0,1,6,6.9],["Real Madrid","LL",25,24,1,3,9,7.0],
  ["Real Madrid","LL",20,26,0,2,10,6.9],["Real Madrid","LL",15,28,4,4,13,7.2],["Real Madrid","LL",14,8,1,1,3,6.9],
  ["Real Madrid","LL",8,15,0,1,5,6.8]]);
P("Éder Militão", "Brazil", "DEF", 1998, 35, [
  ["São Paulo","BRA",4,20,1,0,6,6.9],["São Paulo","BRA",8,25,2,0,8,7.0],["FC Porto","POR",40,28,3,0,14,7.2],
  ["Real Madrid","LL",50,15,0,0,5,6.8],["Real Madrid","LL",40,15,1,0,6,7.0],["Real Madrid","LL",60,34,1,0,13,7.1],
  ["Real Madrid","LL",70,31,5,0,12,7.1],["Real Madrid","LL",60,3,0,0,1,6.8],["Real Madrid","LL",50,10,0,0,4,6.9],
  ["Real Madrid","LL",40,20,1,0,7,6.9]]);
P("Aymeric Laporte", "Spain", "DEF", 1994, 8, [
  ["Athletic Club","LL",40,35,2,0,11,7.0],["Manchester City","EPL",60,9,0,0,6,7.0],["Manchester City","EPL",70,35,3,3,20,7.2],
  ["Manchester City","EPL",65,15,1,0,7,7.0],["Manchester City","EPL",55,16,1,0,9,7.0],["Manchester City","EPL",50,33,4,1,17,7.1],
  ["Manchester City","EPL",35,12,0,0,5,6.9],["Al-Nassr","SPL",20,28,2,0,13,7.0],["Al-Nassr","SPL",12,25,2,0,11,7.0],
  ["Athletic Club","LL",10,20,1,0,6,6.9]]);

// ---------------- MIDFIELDERS ----------------
P("Kevin De Bruyne", "Belgium", "MID", 1991, 8, [
  ["Manchester City","EPL",60,36,6,18,0,7.6],["Manchester City","EPL",120,37,8,16,0,8.0],["Manchester City","EPL",120,19,2,2,0,7.0],
  ["Manchester City","EPL",150,35,13,20,0,8.0],["Manchester City","EPL",100,25,6,12,0,7.7],["Manchester City","EPL",100,30,15,8,0,7.8],
  ["Manchester City","EPL",80,32,7,16,0,7.8],["Manchester City","EPL",60,18,4,10,0,7.7],["Manchester City","EPL",20,28,4,8,0,7.1],
  ["Napoli","SA",12,20,4,3,0,7.0]]);
P("Jude Bellingham", "England", "MID", 2003, 130, [
  null,null,null,
  ["Birmingham City","CH",15,41,4,2,0,7.0],["Borussia Dortmund","BL",35,29,1,2,0,7.0],["Borussia Dortmund","BL",75,32,3,8,0,7.2],
  ["Borussia Dortmund","BL",120,31,8,5,0,7.6],["Real Madrid","LL",180,28,19,6,0,7.8],["Real Madrid","LL",180,31,9,8,0,7.3],
  ["Real Madrid","LL",150,26,6,5,0,7.2]]);
P("Pedri", "Spain", "MID", 2002, 140, [
  null,null,null,
  ["UD Las Palmas","SEG",5,36,4,3,0,6.9],["Barcelona","LL",80,37,3,6,0,7.2],["Barcelona","LL",80,12,4,2,0,7.3],
  ["Barcelona","LL",100,26,6,2,0,7.3],["Barcelona","LL",80,24,4,3,0,7.1],["Barcelona","LL",80,37,4,5,0,7.5],
  ["Barcelona","LL",140,32,3,6,0,7.6]]);
P("Frenkie de Jong", "Netherlands", "MID", 1997, 35, [
  ["Ajax","ERE",5,10,1,1,0,6.8],["Ajax","ERE",20,21,1,3,0,7.1],["Ajax","ERE",80,30,3,5,0,7.5],
  ["Barcelona","LL",90,29,2,4,0,7.0],["Barcelona","LL",80,37,3,6,0,7.2],["Barcelona","LL",70,32,4,4,0,7.0],
  ["Barcelona","LL",60,33,2,1,0,7.1],["Barcelona","LL",70,22,1,2,0,7.1],["Barcelona","LL",45,26,1,2,0,7.0],
  ["Barcelona","LL",40,30,1,2,0,7.1]]);
P("Bruno Fernandes", "Portugal", "MID", 1994, 40, [
  ["Sampdoria","SA",12,33,5,3,0,6.9],["Sporting CP","POR",35,33,11,7,0,7.5],["Sporting CP","POR",70,33,20,13,0,7.9],
  ["Manchester United","EPL",80,14,8,7,0,7.8],["Manchester United","EPL",90,37,18,12,0,7.8],["Manchester United","EPL",80,36,10,6,0,7.3],
  ["Manchester United","EPL",70,37,8,8,0,7.4],["Manchester United","EPL",60,35,10,8,0,7.4],["Manchester United","EPL",55,36,8,10,0,7.6],
  ["Manchester United","EPL",45,33,8,12,0,7.5]]);
P("Rodri", "Spain", "MID", 1996, 65, [
  ["Villarreal","LL",20,37,0,1,0,7.0],["Villarreal","LL",40,33,1,1,0,7.0],["Atlético Madrid","LL",60,34,3,2,0,7.1],
  ["Manchester City","EPL",70,35,3,2,0,7.1],["Manchester City","EPL",70,34,2,2,0,7.2],["Manchester City","EPL",80,33,7,2,0,7.4],
  ["Manchester City","EPL",80,36,2,6,0,7.4],["Manchester City","EPL",110,34,8,9,0,7.7],["Manchester City","EPL",130,4,1,0,0,7.3],
  ["Manchester City","EPL",75,22,1,2,0,7.0]]);
P("Declan Rice", "England", "MID", 1999, 120, [
  ["West Ham United","EPL",1,1,0,0,0,6.5],["West Ham United","EPL",15,26,0,0,0,6.8],["West Ham United","EPL",40,34,2,0,0,7.0],
  ["West Ham United","EPL",40,38,1,3,0,7.0],["West Ham United","EPL",60,32,2,2,0,7.2],["West Ham United","EPL",75,36,1,4,0,7.3],
  ["West Ham United","EPL",80,37,4,2,0,7.2],["Arsenal","EPL",110,38,7,8,0,7.4],["Arsenal","EPL",120,35,4,7,0,7.2],
  ["Arsenal","EPL",120,35,5,8,0,7.4]]);
P("Martin Ødegaard", "Norway", "MID", 1998, 65, [
  ["SC Heerenveen","ERE",5,14,0,3,0,6.8],["SC Heerenveen","ERE",8,24,2,4,0,6.9],["Vitesse","ERE",20,31,8,9,0,7.4],
  ["Real Sociedad","LL",50,31,4,7,0,7.3],["Arsenal","EPL",40,14,1,2,0,7.1],["Arsenal","EPL",60,36,7,4,0,7.2],
  ["Arsenal","EPL",90,37,15,7,0,7.6],["Arsenal","EPL",100,35,8,10,0,7.6],["Arsenal","EPL",90,30,3,8,0,7.3],
  ["Arsenal","EPL",75,24,2,5,0,7.0]]);
P("Federico Valverde", "Uruguay", "MID", 1998, 120, [
  null,["Deportivo La Coruña","LL",6,24,0,1,0,6.6],["Real Madrid","LL",30,25,0,1,0,6.8],
  ["Real Madrid","LL",60,33,2,2,0,7.0],["Real Madrid","LL",60,23,3,1,0,7.0],["Real Madrid","LL",60,31,0,5,0,7.0],
  ["Real Madrid","LL",100,34,7,4,0,7.3],["Real Madrid","LL",120,37,2,7,0,7.3],["Real Madrid","LL",130,38,6,4,0,7.4],
  ["Real Madrid","LL",130,35,4,6,0,7.2]]);
P("Luka Modrić", "Croatia", "MID", 1985, 3, [
  ["Real Madrid","LL",35,25,1,6,0,7.4],["Real Madrid","LL",35,26,1,6,0,7.2],["Real Madrid","LL",25,34,3,3,0,7.1],
  ["Real Madrid","LL",15,31,3,3,0,7.1],["Real Madrid","LL",10,35,5,6,0,7.2],["Real Madrid","LL",10,28,2,4,0,7.3],
  ["Real Madrid","LL",10,33,4,4,0,7.2],["Real Madrid","LL",8,32,2,2,0,7.0],["Real Madrid","LL",5,35,2,6,0,7.1],
  ["AC Milan","SA",4,34,2,4,0,7.1]]);
P("Nicolò Barella", "Italy", "MID", 1997, 55, [
  ["Cagliari","SA",5,28,1,1,0,6.8],["Cagliari","SA",25,35,6,3,0,7.0],["Cagliari","SA",45,35,1,3,0,7.1],
  ["Inter Milan","SA",60,27,1,5,0,7.1],["Inter Milan","SA",70,36,3,8,0,7.3],["Inter Milan","SA",80,36,3,12,0,7.4],
  ["Inter Milan","SA",80,35,6,9,0,7.3],["Inter Milan","SA",80,34,2,4,0,7.2],["Inter Milan","SA",70,32,3,5,0,7.1],
  ["Inter Milan","SA",60,33,3,6,0,7.1]]);
P("Jamal Musiala", "Germany", "MID", 2003, 110, [
  null,null,null,
  null,["Bayern Munich","BL",25,26,6,1,0,7.0],["Bayern Munich","BL",70,30,5,4,0,7.1],
  ["Bayern Munich","BL",110,33,12,10,0,7.6],["Bayern Munich","BL",120,25,10,6,0,7.5],["Bayern Munich","BL",140,25,12,4,0,7.4],
  ["Bayern Munich","BL",120,12,3,2,0,7.1]]);
P("Florian Wirtz", "Germany", "MID", 2003, 110, [
  null,null,null,
  ["Bayer Leverkusen","BL",15,9,1,1,0,6.8],["Bayer Leverkusen","BL",50,29,5,6,0,7.1],["Bayer Leverkusen","BL",85,24,7,10,0,7.5],
  ["Bayer Leverkusen","BL",85,15,1,6,0,7.0],["Bayer Leverkusen","BL",130,32,11,11,0,7.9],["Bayer Leverkusen","BL",140,31,10,12,0,7.7],
  ["Liverpool","EPL",120,32,5,7,0,7.1]]);
P("Joshua Kimmich", "Germany", "MID", 1995, 35, [
  ["Bayern Munich","BL",25,27,6,2,0,7.0],["Bayern Munich","BL",60,32,2,14,0,7.6],["Bayern Munich","BL",85,34,2,13,0,7.5],
  ["Bayern Munich","BL",90,33,3,10,0,7.5],["Bayern Munich","BL",90,27,4,10,0,7.6],["Bayern Munich","BL",85,28,3,8,0,7.4],
  ["Bayern Munich","BL",75,33,5,6,0,7.4],["Bayern Munich","BL",50,28,1,8,0,7.3],["Bayern Munich","BL",40,34,2,10,0,7.4],
  ["Bayern Munich","BL",40,31,2,9,0,7.4]]);
P("Bruno Guimarães", "Brazil", "MID", 1997, 70, [
  null,["Athletico Paranaense","BRA",3,20,1,1,0,6.9],["Athletico Paranaense","BRA",10,30,1,2,0,7.1],
  ["Lyon","L1",40,11,0,0,0,6.9],["Lyon","L1",50,34,1,3,0,7.0],["Newcastle United","EPL",50,17,5,1,0,7.2],
  ["Newcastle United","EPL",80,32,4,3,0,7.3],["Newcastle United","EPL",85,37,7,8,0,7.4],["Newcastle United","EPL",75,38,5,6,0,7.3],
  ["Newcastle United","EPL",75,33,6,5,0,7.2]]);
P("N'Golo Kanté", "France", "MID", 1991, 3, [
  ["Chelsea","EPL",50,35,1,1,0,7.5],["Chelsea","EPL",100,34,1,3,0,7.3],["Chelsea","EPL",100,36,4,4,0,7.2],
  ["Chelsea","EPL",60,22,3,1,0,7.0],["Chelsea","EPL",50,30,0,2,0,7.1],["Chelsea","EPL",45,21,0,5,0,7.0],
  ["Chelsea","EPL",25,7,0,0,0,7.0],["Al-Ittihad","SPL",12,32,4,2,0,7.2],["Al-Ittihad","SPL",5,33,4,2,0,7.1],
  ["Al-Ittihad","SPL",4,25,2,2,0,7.0]]);
P("Cole Palmer", "England", "MID", 2002, 90, [
  null,null,null,null,null,
  ["Manchester City","EPL",5,4,0,0,0,6.6],["Manchester City","EPL",10,14,0,1,0,6.6],["Chelsea","EPL",80,34,22,11,0,7.8],
  ["Chelsea","EPL",130,37,15,8,0,7.4],["Chelsea","EPL",100,22,8,5,0,7.2]]);
P("Martín Zubimendi", "Spain", "MID", 1999, 70, [
  null,null,null,
  null,["Real Sociedad","LL",10,31,1,1,0,6.9],["Real Sociedad","LL",40,35,1,1,0,7.0],
  ["Real Sociedad","LL",50,36,2,1,0,7.1],["Real Sociedad","LL",60,31,2,2,0,7.1],["Real Sociedad","LL",60,36,4,1,0,7.0],
  ["Arsenal","EPL",70,35,5,2,0,7.2]]);
P("Enzo Fernández", "Argentina", "MID", 2001, 75, [
  null,null,null,
  null,["Defensa y Justicia","ARG",5,20,2,2,0,6.9],["River Plate","ARG",15,18,5,5,0,7.2],
  ["Benfica","POR",55,17,1,4,0,7.4],["Chelsea","EPL",75,36,3,2,0,7.0],["Chelsea","EPL",65,36,6,8,0,7.2],
  ["Chelsea","EPL",75,34,8,4,0,7.3]]);
P("Alexis Mac Allister", "Argentina", "MID", 1998, 70, [
  null,["Argentinos Juniors","ARG",2,20,2,2,0,6.8],["Argentinos Juniors","ARG",7,22,5,3,0,7.1],
  ["Brighton & Hove Albion","EPL",8,9,0,0,0,6.6],["Brighton & Hove Albion","EPL",10,21,1,3,0,6.8],["Brighton & Hove Albion","EPL",15,32,2,1,0,6.9],
  ["Brighton & Hove Albion","EPL",65,35,10,2,0,7.3],["Liverpool","EPL",75,33,5,5,0,7.3],["Liverpool","EPL",90,35,5,5,0,7.3],
  ["Liverpool","EPL",80,32,3,4,0,7.0]]);
P("Vitinha", "Portugal", "MID", 2000, 110, [
  null,null,null,
  ["FC Porto","POR",10,11,0,0,0,6.6],["Wolverhampton Wanderers","EPL",15,19,1,1,0,6.6],["FC Porto","POR",35,30,4,2,0,7.2],
  ["Paris Saint-Germain","L1",50,36,2,1,0,7.0],["Paris Saint-Germain","L1",55,30,8,3,0,7.3],["Paris Saint-Germain","L1",90,30,6,7,0,7.6],
  ["Paris Saint-Germain","L1",110,32,5,7,0,7.6]]);
P("Casemiro", "Brazil", "MID", 1992, 4, [
  ["Real Madrid","LL",40,25,4,1,0,7.0],["Real Madrid","LL",45,30,5,2,0,7.0],["Real Madrid","LL",60,29,3,2,0,7.0],
  ["Real Madrid","LL",60,35,4,2,0,7.1],["Real Madrid","LL",60,34,6,2,0,7.2],["Real Madrid","LL",40,32,1,4,0,7.0],
  ["Manchester United","EPL",40,28,4,6,0,7.3],["Manchester United","EPL",18,25,1,2,0,6.7],["Manchester United","EPL",8,21,2,1,0,6.8],
  ["Manchester United","EPL",6,30,5,2,0,7.0]]);
P("İlkay Gündoğan", "Germany", "MID", 1990, 3, [
  ["Manchester City","EPL",25,10,1,2,0,7.2],["Manchester City","EPL",35,30,4,3,0,7.0],["Manchester City","EPL",35,31,6,3,0,7.1],
  ["Manchester City","EPL",30,31,2,4,0,7.0],["Manchester City","EPL",35,28,13,2,0,7.5],["Manchester City","EPL",30,31,8,4,0,7.1],
  ["Manchester City","EPL",25,31,8,5,0,7.3],["Barcelona","LL",20,36,5,9,0,7.5],["Manchester City","EPL",8,33,1,3,0,6.8],
  ["Galatasaray","TSL",5,25,2,5,0,7.1]]);
P("Sergej Milinković-Savić", "Serbia", "MID", 1995, 18, [
  ["Lazio","SA",25,34,4,5,0,7.0],["Lazio","SA",70,35,12,4,0,7.4],["Lazio","SA",90,31,5,5,0,7.1],
  ["Lazio","SA",80,35,7,6,0,7.3],["Lazio","SA",70,37,8,6,0,7.3],["Lazio","SA",70,37,11,12,0,7.6],
  ["Lazio","SA",60,36,8,7,0,7.4],["Al-Hilal","SPL",40,31,7,3,0,7.3],["Al-Hilal","SPL",30,30,8,6,0,7.3],
  ["Al-Hilal","SPL",22,28,6,5,0,7.2]]);
P("Bernardo Silva", "Portugal", "MID", 1994, 20, [
  ["AS Monaco","L1",40,37,8,9,0,7.4],["Manchester City","EPL",50,35,6,2,0,7.0],["Manchester City","EPL",100,36,7,7,0,7.5],
  ["Manchester City","EPL",90,34,6,7,0,7.2],["Manchester City","EPL",70,32,2,5,0,7.1],["Manchester City","EPL",80,35,8,4,0,7.3],
  ["Manchester City","EPL",80,34,4,5,0,7.1],["Manchester City","EPL",70,33,6,9,0,7.2],["Manchester City","EPL",40,34,3,3,0,7.0],
  ["Manchester City","EPL",25,33,3,4,0,7.0]]);

// ---------------- FORWARDS ----------------
P("Lionel Messi", "Argentina", "FWD", 1987, 12, [
  ["Barcelona","LL",120,34,37,9,0,8.6],["Barcelona","LL",180,36,34,12,0,8.6],["Barcelona","LL",160,34,36,13,0,8.5],
  ["Barcelona","LL",112,33,25,21,0,8.4],["Barcelona","LL",80,35,30,9,0,8.3],["Paris Saint-Germain","L1",50,26,6,14,0,7.6],
  ["Paris Saint-Germain","L1",50,32,16,16,0,8.0],["Inter Miami","MLS",30,19,20,16,0,8.3],["Inter Miami","MLS",18,28,29,19,0,8.4],
  ["Inter Miami","MLS",15,18,14,10,0,8.0]]);
P("Cristiano Ronaldo", "Portugal", "FWD", 1985, 10, [
  ["Real Madrid","LL",100,29,25,6,0,7.8],["Real Madrid","LL",100,27,26,5,0,7.9],["Juventus","SA",90,31,21,8,0,7.8],
  ["Juventus","SA",75,33,31,5,0,7.8],["Juventus","SA",50,33,29,3,0,7.6],["Manchester United","EPL",35,30,18,3,0,7.2],
  ["Al-Nassr","SPL",20,16,14,2,0,7.6],["Al-Nassr","SPL",15,31,35,11,0,8.0],["Al-Nassr","SPL",12,30,25,3,0,7.6],
  ["Al-Nassr","SPL",12,30,26,3,0,7.6]]);
P("Kylian Mbappé", "France", "FWD", 1998, 180, [
  ["AS Monaco","L1",35,29,15,8,0,7.6],["Paris Saint-Germain","L1",120,27,13,8,0,7.8],["Paris Saint-Germain","L1",200,29,33,7,0,8.2],
  ["Paris Saint-Germain","L1",180,20,18,5,0,8.0],["Paris Saint-Germain","L1",160,31,27,7,0,7.9],["Paris Saint-Germain","L1",160,35,28,17,0,8.3],
  ["Paris Saint-Germain","L1",180,34,29,5,0,7.9],["Paris Saint-Germain","L1",180,29,27,7,0,7.9],["Real Madrid","LL",170,34,31,3,0,7.6],
  ["Real Madrid","LL",200,33,30,5,0,7.9]]);
P("Erling Haaland", "Norway", "FWD", 2000, 200, [
  null,["Molde","NOR",1,26,4,2,0,6.8],["Molde","NOR",5,25,12,5,0,7.2],
  ["Borussia Dortmund","BL",80,15,13,3,0,7.5],["Borussia Dortmund","BL",110,28,27,6,0,7.8],["Borussia Dortmund","BL",150,24,22,7,0,7.8],
  ["Manchester City","EPL",170,35,36,8,0,7.9],["Manchester City","EPL",180,31,27,5,0,7.5],["Manchester City","EPL",180,31,22,3,0,7.3],
  ["Manchester City","EPL",200,34,30,5,0,7.7]]);
P("Mohamed Salah", "Egypt", "FWD", 1992, 25, [
  ["AS Roma","SA",30,31,15,11,0,7.6],["Liverpool","EPL",150,36,32,10,0,8.1],["Liverpool","EPL",150,38,22,8,0,7.6],
  ["Liverpool","EPL",120,34,19,10,0,7.6],["Liverpool","EPL",110,37,22,5,0,7.5],["Liverpool","EPL",100,35,23,13,0,7.9],
  ["Liverpool","EPL",80,38,19,12,0,7.5],["Liverpool","EPL",65,32,18,10,0,7.6],["Liverpool","EPL",55,38,29,18,0,8.2],
  ["Liverpool","EPL",35,33,10,8,0,7.1]]);
P("Harry Kane", "England", "FWD", 1993, 60, [
  ["Tottenham Hotspur","EPL",80,30,29,7,0,7.8],["Tottenham Hotspur","EPL",150,37,30,2,0,7.7],["Tottenham Hotspur","EPL",150,28,17,4,0,7.4],
  ["Tottenham Hotspur","EPL",120,29,18,2,0,7.3],["Tottenham Hotspur","EPL",100,35,23,14,0,8.0],["Tottenham Hotspur","EPL",90,37,17,9,0,7.5],
  ["Tottenham Hotspur","EPL",90,38,30,3,0,7.6],["Bayern Munich","BL",110,32,36,8,0,8.0],["Bayern Munich","BL",90,31,26,8,0,7.7],
  ["Bayern Munich","BL",65,32,35,8,0,8.0]]);
P("Robert Lewandowski", "Poland", "FWD", 1988, 5, [
  ["Bayern Munich","BL",80,33,30,3,0,7.9],["Bayern Munich","BL",80,30,29,5,0,7.9],["Bayern Munich","BL",65,33,22,7,0,7.7],
  ["Bayern Munich","BL",70,31,34,4,0,8.0],["Bayern Munich","BL",60,29,41,7,0,8.1],["Bayern Munich","BL",50,34,35,3,0,7.8],
  ["Barcelona","LL",45,34,23,7,0,7.4],["Barcelona","LL",15,35,19,8,0,7.2],["Barcelona","LL",15,34,27,2,0,7.4],
  ["Barcelona","LL",8,30,14,2,0,7.0]]);
P("Vinícius Júnior", "Brazil", "FWD", 2000, 140, [
  null,["Flamengo","BRA",20,28,2,3,0,6.9],["Real Madrid","LL",45,18,2,5,0,7.0],
  ["Real Madrid","LL",50,29,3,5,0,6.9],["Real Madrid","LL",45,35,3,3,0,6.9],["Real Madrid","LL",100,35,17,10,0,7.6],
  ["Real Madrid","LL",150,33,10,9,0,7.6],["Real Madrid","LL",180,26,15,5,0,7.8],["Real Madrid","LL",200,30,11,6,0,7.5],
  ["Real Madrid","LL",150,33,9,8,0,7.3]]);
P("Bukayo Saka", "England", "FWD", 2001, 130, [
  null,null,null,
  ["Arsenal","EPL",25,26,1,5,0,6.9],["Arsenal","EPL",65,32,5,3,0,7.1],["Arsenal","EPL",65,38,11,7,0,7.3],
  ["Arsenal","EPL",110,38,14,11,0,7.6],["Arsenal","EPL",130,35,16,9,0,7.6],["Arsenal","EPL",150,25,6,10,0,7.4],
  ["Arsenal","EPL",140,30,10,9,0,7.4]]);
P("Phil Foden", "England", "FWD", 2000, 70, [
  null,["Manchester City","EPL",8,5,0,0,0,6.6],["Manchester City","EPL",30,13,1,0,0,6.9],
  ["Manchester City","EPL",30,23,5,2,0,7.0],["Manchester City","EPL",80,28,9,5,0,7.3],["Manchester City","EPL",90,28,9,5,0,7.3],
  ["Manchester City","EPL",110,32,11,5,0,7.2],["Manchester City","EPL",150,35,19,8,0,7.8],["Manchester City","EPL",100,28,7,2,0,6.9],
  ["Manchester City","EPL",75,32,8,5,0,7.1]]);
P("Lautaro Martínez", "Argentina", "FWD", 1997, 75, [
  ["Racing Club","ARG",4,18,5,2,0,7.0],["Racing Club","ARG",15,20,12,2,0,7.4],["Inter Milan","SA",40,27,6,2,0,6.9],
  ["Inter Milan","SA",70,35,14,6,0,7.2],["Inter Milan","SA",65,38,17,10,0,7.4],["Inter Milan","SA",75,35,21,3,0,7.3],
  ["Inter Milan","SA",80,38,21,6,0,7.4],["Inter Milan","SA",110,33,24,3,0,7.6],["Inter Milan","SA",95,31,12,3,0,7.2],
  ["Inter Milan","SA",85,32,18,4,0,7.4]]);
P("Victor Osimhen", "Nigeria", "FWD", 1998, 75, [
  ["VfL Wolfsburg","BL",3,4,0,0,0,6.4],["VfL Wolfsburg","BL",2,10,0,0,0,6.3],["Sporting Charleroi","BEL",10,25,12,4,0,7.3],
  ["Lille","L1",40,27,13,5,0,7.1],["Napoli","SA",50,24,10,4,0,7.0],["Napoli","SA",70,27,14,2,0,7.2],
  ["Napoli","SA",120,32,26,4,0,7.6],["Napoli","SA",100,25,15,3,0,7.2],["Galatasaray","TSL",75,30,26,5,0,7.6],
  ["Galatasaray","TSL",75,26,18,4,0,7.6]]);
P("Lamine Yamal", "Spain", "FWD", 2007, 200, [
  null,null,null,null,null,null,
  ["Barcelona","LL",4,2,0,0,0,6.5],["Barcelona","LL",90,37,5,6,0,7.3],["Barcelona","LL",180,35,9,13,0,7.9],
  ["Barcelona","LL",200,32,14,12,0,8.0]]);
P("Son Heung-min", "South Korea", "FWD", 1992, 15, [
  ["Tottenham Hotspur","EPL",30,34,14,6,0,7.2],["Tottenham Hotspur","EPL",50,37,12,6,0,7.2],["Tottenham Hotspur","EPL",80,31,12,6,0,7.3],
  ["Tottenham Hotspur","EPL",80,30,11,10,0,7.4],["Tottenham Hotspur","EPL",85,37,17,10,0,7.6],["Tottenham Hotspur","EPL",75,35,23,7,0,7.6],
  ["Tottenham Hotspur","EPL",60,36,10,6,0,7.0],["Tottenham Hotspur","EPL",50,35,17,10,0,7.5],["Tottenham Hotspur","EPL",30,30,7,9,0,7.1],
  ["Los Angeles FC","MLS",20,26,15,8,0,7.6]]);
P("Sadio Mané", "Senegal", "FWD", 1992, 5, [
  ["Liverpool","EPL",40,27,13,5,0,7.5],["Liverpool","EPL",75,29,10,7,0,7.2],["Liverpool","EPL",120,36,22,1,0,7.4],
  ["Liverpool","EPL",120,35,18,7,0,7.4],["Liverpool","EPL",100,35,11,7,0,7.1],["Liverpool","EPL",70,34,16,2,0,7.3],
  ["Bayern Munich","BL",60,25,7,5,0,6.9],["Al-Nassr","SPL",20,32,13,8,0,7.3],["Al-Nassr","SPL",10,30,11,6,0,7.1],
  ["Al-Nassr","SPL",7,30,9,6,0,7.1]]);
P("Karim Benzema", "France", "FWD", 1987, 4, [
  ["Real Madrid","LL",40,29,11,7,0,7.1],["Real Madrid","LL",35,32,5,9,0,6.9],["Real Madrid","LL",40,36,21,6,0,7.5],
  ["Real Madrid","LL",35,37,21,8,0,7.5],["Real Madrid","LL",32,34,23,9,0,7.6],["Real Madrid","LL",30,32,27,12,0,8.0],
  ["Real Madrid","LL",35,24,19,3,0,7.4],["Al-Ittihad","SPL",15,30,9,6,0,7.1],["Al-Ittihad","SPL",8,31,21,8,0,7.6],
  ["Al-Ittihad","SPL",6,25,12,4,0,7.3]]);
P("Julián Álvarez", "Argentina", "FWD", 2000, 100, [
  null,null,["River Plate","ARG",5,15,2,2,0,6.8],
  ["River Plate","ARG",12,20,6,3,0,7.0],["River Plate","ARG",20,21,18,6,0,7.6],["River Plate","ARG",35,15,11,4,0,7.6],
  ["Manchester City","EPL",50,31,9,1,0,6.9],["Manchester City","EPL",90,36,11,9,0,7.3],["Atlético Madrid","LL",90,36,17,5,0,7.4],
  ["Atlético Madrid","LL",100,34,16,6,0,7.4]]);
P("Khvicha Kvaratskhelia", "Georgia", "FWD", 2001, 90, [
  null,["Dinamo Tbilisi","GEO",1,25,6,4,0,7.2],["Lokomotiv Moscow","RPL",2,6,0,0,0,6.6],
  ["Rubin Kazan","RPL",3,25,4,3,0,6.9],["Rubin Kazan","RPL",10,25,4,6,0,7.1],["Dinamo Batumi","GEO",12,11,8,5,0,7.8],
  ["Napoli","SA",80,34,12,10,0,7.6],["Napoli","SA",80,34,11,6,0,7.4],["Paris Saint-Germain","L1",80,15,6,3,0,7.4],
  ["Paris Saint-Germain","L1",90,30,10,8,0,7.5]]);
P("Ousmane Dembélé", "France", "FWD", 1997, 70, [
  ["Borussia Dortmund","BL",35,32,6,12,0,7.4],["Barcelona","LL",100,17,4,7,0,7.0],["Barcelona","LL",100,29,8,5,0,7.2],
  ["Barcelona","LL",50,5,1,1,0,6.8],["Barcelona","LL",50,30,6,5,0,7.0],["Barcelona","LL",40,21,1,13,0,7.2],
  ["Barcelona","LL",60,25,5,6,0,7.3],["Paris Saint-Germain","L1",60,29,3,8,0,7.2],["Paris Saint-Germain","L1",60,29,21,6,0,7.7],
  ["Paris Saint-Germain","L1",80,24,10,6,0,7.4]]);
P("Rafael Leão", "Portugal", "FWD", 1999, 60, [
  null,["Sporting CP","POR",5,9,2,0,0,6.7],["Lille","L1",30,24,8,1,0,7.0],
  ["AC Milan","SA",30,31,6,1,0,6.8],["AC Milan","SA",35,33,6,3,0,6.9],["AC Milan","SA",60,34,11,10,0,7.4],
  ["AC Milan","SA",90,35,15,8,0,7.4],["AC Milan","SA",90,34,9,9,0,7.3],["AC Milan","SA",70,37,8,8,0,7.1],
  ["AC Milan","SA",65,30,10,4,0,7.1]]);
P("Alexander Isak", "Sweden", "FWD", 1999, 110, [
  ["AIK","SWE",5,24,10,5,0,7.2],["Borussia Dortmund","BL",8,5,0,0,0,6.4],["Willem II","ERE",10,16,13,7,0,7.6],
  ["Real Sociedad","LL",25,37,9,2,0,6.9],["Real Sociedad","LL",30,34,17,2,0,7.1],["Real Sociedad","LL",40,32,6,2,0,6.8],
  ["Newcastle United","EPL",50,22,10,1,0,7.1],["Newcastle United","EPL",75,30,21,2,0,7.4],["Newcastle United","EPL",120,34,23,6,0,7.6],
  ["Liverpool","EPL",120,22,6,2,0,6.9]]);

// =====================================================================
// EXPANSION: more players, mixing late risers with stars whose value fell away.
// =====================================================================

// ---------------- GOALKEEPERS (expansion) ----------------
P("David Raya", "Spain", "GK", 1995, 40, [
  ["Blackburn Rovers","CH",1,36,0,0,8,6.7],["Blackburn Rovers","ENG3",2,46,0,0,18,6.9],["Blackburn Rovers","CH",5,41,0,0,9,6.8],
  ["Brentford","CH",8,46,0,0,16,6.9],["Brentford","CH",10,46,0,0,19,7.0],["Brentford","EPL",15,24,0,0,6,6.8],
  ["Brentford","EPL",30,38,0,0,12,7.0],["Arsenal","EPL",35,32,0,0,16,6.9],["Arsenal","EPL",40,38,0,0,13,7.0],
  ["Arsenal","EPL",40,36,0,0,18,7.1]]);
P("André Onana", "Cameroon", "GK", 1996, 15, [
  ["Ajax","ERE",3,33,0,0,14,6.8],["Ajax","ERE",10,34,0,0,15,6.9],["Ajax","ERE",25,34,0,0,15,7.0],
  ["Ajax","ERE",30,24,0,0,12,6.9],["Ajax","ERE",30,31,0,0,15,6.9],["Ajax","ERE",25,7,0,0,4,6.8],
  ["Inter Milan","SA",35,24,0,0,13,7.0],["Manchester United","EPL",45,38,0,0,9,6.7],["Manchester United","EPL",35,34,0,0,7,6.6],
  ["Trabzonspor","TSL",18,30,0,0,9,6.8]]);
P("Unai Simón", "Spain", "GK", 1997, 25, [
  null,null,["Athletic Bilbao","LL",5,5,0,0,1,6.6],
  ["Athletic Bilbao","LL",20,30,0,0,13,7.0],["Athletic Bilbao","LL",25,36,0,0,12,6.9],["Athletic Bilbao","LL",35,36,0,0,14,6.9],
  ["Athletic Bilbao","LL",35,34,0,0,12,6.9],["Athletic Bilbao","LL",30,36,0,0,11,6.9],["Athletic Bilbao","LL",30,32,0,0,14,7.0],
  ["Athletic Bilbao","LL",25,30,0,0,9,6.8]]);
P("Manuel Neuer", "Germany", "GK", 1986, 3, [
  ["Bayern Munich","BL",40,26,0,0,14,7.0],["Bayern Munich","BL",30,3,0,0,1,6.7],["Bayern Munich","BL",25,31,0,0,11,6.8],
  ["Bayern Munich","BL",18,33,0,0,15,7.0],["Bayern Munich","BL",15,33,0,0,10,6.9],["Bayern Munich","BL",15,28,0,0,11,6.9],
  ["Bayern Munich","BL",12,13,0,0,6,6.8],["Bayern Munich","BL",6,25,0,0,10,6.9],["Bayern Munich","BL",5,24,0,0,10,6.9],
  ["Bayern Munich","BL",4,28,0,0,11,6.9]]);
P("Yassine Bounou", "Morocco", "GK", 1991, 5, [
  ["Girona","SEG",1,40,0,0,15,6.8],["Girona","LL",3,38,0,0,9,6.8],["Girona","LL",5,28,0,0,6,6.7],
  ["Sevilla","LL",6,8,0,0,4,6.8],["Sevilla","LL",15,33,0,0,15,7.0],["Sevilla","LL",18,31,0,0,13,7.0],
  ["Sevilla","LL",15,24,0,0,7,6.9],["Al-Hilal","SPL",12,32,0,0,15,7.0],["Al-Hilal","SPL",8,30,0,0,10,6.9],
  ["Al-Hilal","SPL",6,30,0,0,12,6.9]]);
P("Guglielmo Vicario", "Italy", "GK", 1996, 20, [
  null,["Venezia","SB",1,3,0,0,1,6.5],["Cagliari","SA",1,1,0,0,0,6.5],
  ["Perugia","SB",2,37,0,0,9,6.9],["Cagliari","SA",3,6,0,0,1,6.6],["Empoli","SA",8,37,0,0,6,7.0],
  ["Empoli","SA",15,31,0,0,8,7.0],["Tottenham Hotspur","EPL",30,38,0,0,7,6.9],["Tottenham Hotspur","EPL",30,22,0,0,3,6.8],
  ["Tottenham Hotspur","EPL",25,34,0,0,10,6.9]]);

// ---------------- DEFENDERS (expansion) ----------------
P("Sergio Ramos", "Spain", "DEF", 1986, 1, [
  ["Real Madrid","LL",40,28,7,1,10,7.3],["Real Madrid","LL",35,26,4,1,9,7.2],["Real Madrid","LL",25,28,6,2,8,7.1],
  ["Real Madrid","LL",20,35,11,2,14,7.3],["Real Madrid","LL",15,15,2,0,5,7.0],["Paris Saint-Germain","L1",8,12,1,0,5,6.9],
  ["Paris Saint-Germain","L1",4,36,3,1,14,7.0],["Sevilla","LL",3,30,6,0,7,7.0],["Monterrey","MX",2,14,3,1,4,7.0],
  ["Monterrey","MX",1.5,28,4,1,9,7.0]]);
P("Dayot Upamecano", "France", "DEF", 1998, 60, [
  ["RB Salzburg","AUT",5,16,0,0,7,6.9],["RB Leipzig","BL",25,26,0,0,7,7.0],["RB Leipzig","BL",50,22,0,0,10,7.1],
  ["RB Leipzig","BL",60,28,1,0,9,7.1],["RB Leipzig","BL",45,30,1,1,14,7.0],["Bayern Munich","BL",45,26,1,0,9,6.9],
  ["Bayern Munich","BL",55,30,1,1,12,7.0],["Bayern Munich","BL",50,25,1,0,8,6.8],["Bayern Munich","BL",55,26,2,1,11,7.0],
  ["Bayern Munich","BL",60,28,2,1,12,7.1]]);
P("Harry Maguire", "England", "DEF", 1993, 7, [
  ["Hull City","EPL",8,29,2,1,5,6.8],["Leicester City","EPL",25,38,2,1,9,7.1],["Leicester City","EPL",50,31,3,0,10,7.1],
  ["Manchester United","EPL",50,38,1,1,13,7.0],["Manchester United","EPL",45,34,2,1,11,7.0],["Manchester United","EPL",30,30,1,0,6,6.6],
  ["Manchester United","EPL",20,16,0,0,7,6.6],["Manchester United","EPL",15,22,2,1,7,6.9],["Manchester United","EPL",10,21,1,1,5,6.8],
  ["Manchester United","EPL",8,22,2,0,6,6.8]]);
P("Jules Koundé", "France", "DEF", 1998, 60, [
  null,["Bordeaux","L1",3,17,0,0,4,6.8],["Bordeaux","L1",20,36,3,1,10,7.0],
  ["Sevilla","LL",40,29,1,0,13,7.0],["Sevilla","LL",60,33,2,0,15,7.1],["Sevilla","LL",60,32,1,2,16,7.1],
  ["Barcelona","LL",60,29,0,2,18,7.1],["Barcelona","LL",55,34,0,4,10,7.0],["Barcelona","LL",60,34,2,6,11,7.2],
  ["Barcelona","LL",60,30,1,4,10,7.1]]);
P("Micky van de Ven", "Netherlands", "DEF", 2001, 55, [
  null,null,null,
  ["FC Volendam","EED",0.5,21,1,0,5,6.7],["FC Volendam","EED",2,26,2,0,8,6.9],["VfL Wolfsburg","BL",7,5,0,0,1,6.6],
  ["VfL Wolfsburg","BL",15,33,1,0,9,7.0],["Tottenham Hotspur","EPL",40,27,3,0,6,7.0],["Tottenham Hotspur","EPL",55,15,1,1,4,6.9],
  ["Tottenham Hotspur","EPL",55,30,3,1,10,7.1]]);
P("Dean Huijsen", "Spain", "DEF", 2005, 60, [
  null,null,null,
  null,null,null,
  null,["AS Roma","SA",15,13,2,0,5,6.9],["Bournemouth","EPL",35,32,3,0,9,7.0],
  ["Real Madrid","LL",60,28,2,1,11,7.1]]);
P("Benjamin Pavard", "France", "DEF", 1996, 20, [
  ["VfB Stuttgart","BL2",3,33,2,0,12,7.0],["VfB Stuttgart","BL",25,34,0,1,12,7.1],["VfB Stuttgart","BL",35,32,2,0,5,6.8],
  ["Bayern Munich","BL",40,32,4,2,12,7.0],["Bayern Munich","BL",40,24,0,2,8,6.9],["Bayern Munich","BL",35,30,1,3,10,6.9],
  ["Bayern Munich","BL",35,31,5,1,10,7.0],["Inter Milan","SA",35,23,0,2,12,7.0],["Inter Milan","SA",30,23,0,1,9,6.9],
  ["Marseille","L1",22,26,1,1,8,6.9]]);
P("Reece James", "England", "DEF", 1999, 50, [
  null,null,["Wigan Athletic","CH",3,45,3,7,13,7.1],
  ["Chelsea","EPL",20,24,0,4,8,7.0],["Chelsea","EPL",45,32,1,4,12,7.0],["Chelsea","EPL",70,26,5,6,10,7.3],
  ["Chelsea","EPL",70,16,1,2,6,7.0],["Chelsea","EPL",50,10,0,1,2,6.8],["Chelsea","EPL",40,24,2,3,7,7.0],
  ["Chelsea","EPL",50,30,3,6,10,7.2]]);
P("Lisandro Martínez", "Argentina", "DEF", 1998, 30, [
  ["Newell's Old Boys","ARG",1,9,0,0,2,6.6],["Defensa y Justicia","ARG",3,23,2,0,8,6.9],["Defensa y Justicia","ARG",5,22,1,0,9,7.0],
  ["Ajax","ERE",10,24,0,2,12,7.0],["Ajax","ERE",25,31,2,1,17,7.1],["Ajax","ERE",35,32,1,1,17,7.2],
  ["Manchester United","EPL",50,27,1,0,12,7.0],["Manchester United","EPL",50,11,0,1,3,6.8],["Manchester United","EPL",45,20,1,0,5,6.8],
  ["Manchester United","EPL",35,15,0,0,4,6.8]]);
P("Riccardo Calafiori", "Italy", "DEF", 2002, 45, [
  null,null,null,
  null,["AS Roma","SA",3,13,0,1,3,6.7],["Genoa","SA",3,13,0,0,2,6.6],
  ["FC Basel","SUI",3,31,2,4,9,7.0],["Bologna","SA",15,30,2,5,12,7.2],["Arsenal","EPL",45,19,2,1,8,6.9],
  ["Arsenal","EPL",45,26,3,3,11,7.0]]);
P("Federico Dimarco", "Italy", "DEF", 1997, 40, [
  ["Empoli","SA",3,15,0,1,3,6.6],["FC Sion","SUI",3,22,1,3,5,6.8],["Parma","SA",4,14,1,1,3,6.7],
  ["Hellas Verona","SA",5,15,1,1,5,6.8],["Hellas Verona","SA",10,35,5,5,9,7.1],["Inter Milan","SA",20,30,2,4,12,7.0],
  ["Inter Milan","SA",35,33,4,6,14,7.2],["Inter Milan","SA",50,30,5,6,15,7.4],["Inter Milan","SA",50,35,3,8,13,7.3],
  ["Inter Milan","SA",40,32,4,9,12,7.3]]);

// ---------------- MIDFIELDERS (expansion) ----------------
P("Philippe Coutinho", "Brazil", "MID", 1992, 3, [
  ["Liverpool","EPL",50,31,13,7,0,7.5],["Barcelona","LL",120,22,8,5,0,7.2],["Barcelona","LL",90,34,5,2,0,6.8],
  ["Bayern Munich","BL",60,23,8,6,0,7.1],["Barcelona","LL",30,12,3,1,0,6.8],["Aston Villa","EPL",20,19,4,3,0,7.0],
  ["Aston Villa","EPL",15,20,1,0,0,6.5],["Al-Duhail","QSL",8,10,2,2,0,6.9],["Vasco da Gama","BRA",5,28,6,4,0,7.0],
  ["Vasco da Gama","BRA",3,25,4,4,0,6.9]]);
P("Christian Eriksen", "Denmark", "MID", 1992, 3, [
  ["Tottenham Hotspur","EPL",50,36,8,12,0,7.6],["Tottenham Hotspur","EPL",90,37,10,10,0,7.5],["Tottenham Hotspur","EPL",85,35,8,12,0,7.4],
  ["Inter Milan","SA",60,17,1,1,0,6.7],["Inter Milan","SA",25,25,3,2,0,7.0],["Brentford","EPL",10,11,1,4,0,7.3],
  ["Manchester United","EPL",18,28,1,7,0,7.0],["Manchester United","EPL",10,22,1,2,0,6.8],["Manchester United","EPL",6,23,2,3,0,6.8],
  ["VfL Wolfsburg","BL",3,25,2,4,0,6.9]]);
P("Moisés Caicedo", "Ecuador", "MID", 2001, 90, [
  null,null,null,
  ["Independiente del Valle","ECU",1,17,2,1,0,6.9],["Independiente del Valle","ECU",5,15,3,2,0,7.0],["Brighton & Hove Albion","EPL",8,8,0,1,0,6.9],
  ["Brighton & Hove Albion","EPL",70,37,1,1,0,7.2],["Chelsea","EPL",80,35,1,2,0,6.9],["Chelsea","EPL",85,38,1,4,0,7.2],
  ["Chelsea","EPL",90,33,3,3,0,7.3]]);
P("Aurélien Tchouaméni", "France", "MID", 2000, 70, [
  null,["Bordeaux","L1",1,6,0,0,0,6.5],["Bordeaux","L1",5,11,0,0,0,6.6],
  ["AS Monaco","L1",10,10,0,0,0,6.7],["AS Monaco","L1",45,36,2,4,0,7.3],["AS Monaco","L1",80,35,1,4,0,7.2],
  ["Real Madrid","LL",90,33,0,1,0,6.9],["Real Madrid","LL",100,22,3,0,0,7.0],["Real Madrid","LL",75,31,1,0,0,6.9],
  ["Real Madrid","LL",70,32,2,1,0,7.1]]);
P("James Maddison", "England", "MID", 1996, 25, [
  ["Norwich City","CH",3,22,6,3,0,7.0],["Norwich City","CH",15,44,14,8,0,7.4],["Leicester City","EPL",35,36,7,7,0,7.2],
  ["Leicester City","EPL",60,31,6,4,0,7.3],["Leicester City","EPL",55,31,8,5,0,7.2],["Leicester City","EPL",50,35,12,8,0,7.3],
  ["Leicester City","EPL",50,30,10,9,0,7.4],["Tottenham Hotspur","EPL",60,28,4,9,0,7.3],["Tottenham Hotspur","EPL",50,31,9,6,0,7.2],
  ["Tottenham Hotspur","EPL",25,5,0,1,0,6.8]]);
P("Dominik Szoboszlai", "Hungary", "MID", 2000, 75, [
  null,["RB Salzburg","AUT",2,4,1,0,0,6.8],["RB Salzburg","AUT",10,21,6,4,0,7.3],
  ["RB Salzburg","AUT",25,27,12,12,0,7.8],["RB Salzburg","AUT",30,13,6,7,0,7.7],["RB Leipzig","BL",40,31,6,8,0,7.1],
  ["RB Leipzig","BL",50,32,6,8,0,7.2],["Liverpool","EPL",75,33,3,2,0,7.0],["Liverpool","EPL",75,36,6,6,0,7.3],
  ["Liverpool","EPL",75,34,6,7,0,7.4]]);
P("Xavi Simons", "Netherlands", "MID", 2003, 55, [
  null,null,null,
  null,["Paris Saint-Germain","L1",1,1,0,0,0,6.5],["Paris Saint-Germain","L1",5,6,0,0,0,6.6],
  ["PSV Eindhoven","ERE",40,34,19,6,0,7.7],["RB Leipzig","BL",80,32,8,11,0,7.5],["RB Leipzig","BL",80,28,10,8,0,7.5],
  ["Tottenham Hotspur","EPL",60,30,5,6,0,7.0]]);
P("Mason Mount", "England", "MID", 1999, 15, [
  null,["Vitesse","ERE",2,29,9,5,0,7.3],["Derby County","CH",10,35,8,5,0,7.1],
  ["Chelsea","EPL",45,37,7,5,0,7.0],["Chelsea","EPL",75,36,6,5,0,7.2],["Chelsea","EPL",75,32,11,10,0,7.5],
  ["Chelsea","EPL",65,24,3,2,0,6.8],["Manchester United","EPL",50,14,1,0,0,6.5],["Manchester United","EPL",35,17,1,0,0,6.6],
  ["Manchester United","EPL",20,22,3,1,0,6.8]]);
P("João Neves", "Portugal", "MID", 2004, 110, [
  null,null,null,
  null,null,null,
  ["Benfica","POR",20,12,1,0,0,7.0],["Benfica","POR",100,33,3,3,0,7.5],["Paris Saint-Germain","L1",70,29,3,8,0,7.5],
  ["Paris Saint-Germain","L1",100,30,6,6,0,7.7]]);
P("Granit Xhaka", "Switzerland", "MID", 1992, 10, [
  ["Arsenal","EPL",30,32,2,2,0,6.9],["Arsenal","EPL",35,38,1,7,0,6.9],["Arsenal","EPL",30,29,4,2,0,6.9],
  ["Arsenal","EPL",25,31,1,2,0,6.8],["Arsenal","EPL",22,31,1,2,0,6.8],["Arsenal","EPL",20,27,1,2,0,6.8],
  ["Arsenal","EPL",25,37,7,7,0,7.2],["Bayer Leverkusen","BL",20,33,3,4,0,7.5],["Bayer Leverkusen","BL",18,33,2,6,0,7.4],
  ["Sunderland","EPL",12,30,1,4,0,7.1]]);
P("Marco Verratti", "Italy", "MID", 1992, 5, [
  ["Paris Saint-Germain","L1",70,31,0,3,0,7.4],["Paris Saint-Germain","L1",70,28,0,3,0,7.3],["Paris Saint-Germain","L1",60,26,1,2,0,7.3],
  ["Paris Saint-Germain","L1",60,23,0,4,0,7.3],["Paris Saint-Germain","L1",55,20,1,3,0,7.2],["Paris Saint-Germain","L1",45,24,0,3,0,7.3],
  ["Paris Saint-Germain","L1",40,26,0,1,0,7.0],["Al-Arabi","QSL",15,18,1,4,0,7.2],["Al-Arabi","QSL",10,20,2,4,0,7.2],
  ["Al-Duhail","QSL",6,20,1,3,0,7.1]]);

// ---------------- FORWARDS (expansion) ----------------
P("Neymar", "Brazil", "FWD", 1992, 8, [
  ["Barcelona","LL",100,30,13,11,0,7.9],["Paris Saint-Germain","L1",180,20,19,13,0,8.6],["Paris Saint-Germain","L1",180,17,15,7,0,8.2],
  ["Paris Saint-Germain","L1",160,15,13,6,0,8.0],["Paris Saint-Germain","L1",128,18,9,5,0,7.8],["Paris Saint-Germain","L1",100,22,13,8,0,7.8],
  ["Paris Saint-Germain","L1",75,20,13,11,0,8.1],["Al-Hilal","SPL",60,3,1,2,0,7.3],["Santos","BRA",15,7,3,3,0,7.2],
  ["Santos","BRA",10,24,8,4,0,7.2]]);
P("Antoine Griezmann", "France", "FWD", 1991, 6, [
  ["Atlético Madrid","LL",80,36,16,8,0,7.6],["Atlético Madrid","LL",100,32,19,9,0,7.7],["Atlético Madrid","LL",120,37,15,9,0,7.6],
  ["Barcelona","LL",100,35,9,4,0,7.0],["Barcelona","LL",60,36,13,9,0,7.2],["Atlético Madrid","LL",35,32,8,6,0,7.1],
  ["Atlético Madrid","LL",25,38,15,16,0,7.9],["Atlético Madrid","LL",25,33,16,6,0,7.6],["Atlético Madrid","LL",18,38,8,7,0,7.2],
  ["Atlético Madrid","LL",10,32,7,5,0,7.0]]);
P("Romelu Lukaku", "Belgium", "FWD", 1993, 10, [
  ["Everton","EPL",60,37,25,6,0,7.5],["Manchester United","EPL",85,34,16,7,0,7.2],["Manchester United","EPL",70,32,12,1,0,7.0],
  ["Inter Milan","SA",65,36,23,2,0,7.4],["Inter Milan","SA",100,36,24,10,0,7.7],["Chelsea","EPL",100,26,8,0,0,6.7],
  ["Inter Milan","SA",40,25,10,6,0,7.0],["AS Roma","SA",35,32,13,3,0,7.1],["Napoli","SA",30,36,14,10,0,7.3],
  ["Napoli","SA",15,10,2,1,0,6.8]]);
P("Jadon Sancho", "England", "FWD", 2000, 15, [
  null,["Borussia Dortmund","BL",10,12,1,4,0,7.1],["Borussia Dortmund","BL",100,34,12,14,0,7.8],
  ["Borussia Dortmund","BL",130,32,17,16,0,8.0],["Borussia Dortmund","BL",100,26,8,11,0,7.6],["Manchester United","EPL",70,29,3,3,0,6.8],
  ["Manchester United","EPL",45,26,6,3,0,6.8],["Borussia Dortmund","BL",30,14,2,3,0,7.0],["Chelsea","EPL",30,31,3,5,0,7.0],
  ["Aston Villa","EPL",18,25,2,3,0,6.8]]);
P("João Félix", "Portugal", "FWD", 1999, 20, [
  null,["Benfica","POR",2,10,1,0,0,6.7],["Benfica","POR",70,26,15,7,0,7.6],
  ["Atlético Madrid","LL",120,27,6,1,0,7.0],["Atlético Madrid","LL",90,31,7,6,0,7.3],["Atlético Madrid","LL",70,24,8,3,0,7.1],
  ["Chelsea","EPL",35,16,4,0,0,6.9],["Barcelona","LL",30,30,7,3,0,7.0],["Chelsea","EPL",25,12,1,1,0,6.7],
  ["Al-Nassr","SPL",20,30,14,8,0,7.5]]);
P("Marcus Rashford", "England", "FWD", 1997, 40, [
  ["Manchester United","EPL",35,32,5,1,0,6.9],["Manchester United","EPL",60,35,7,5,0,7.0],["Manchester United","EPL",80,33,10,6,0,7.2],
  ["Manchester United","EPL",90,31,17,7,0,7.4],["Manchester United","EPL",85,37,11,9,0,7.3],["Manchester United","EPL",70,25,4,2,0,6.5],
  ["Manchester United","EPL",85,35,17,5,0,7.3],["Manchester United","EPL",70,33,7,2,0,6.8],["Aston Villa","EPL",45,17,4,6,0,7.0],
  ["Barcelona","LL",40,30,8,10,0,7.3]]);
P("Dušan Vlahović", "Serbia", "FWD", 2000, 25, [
  ["Partizan","SRB",1,9,2,0,0,6.8],["Fiorentina","SA",2,2,0,0,0,6.4],["Fiorentina","SA",4,25,2,0,0,6.6],
  ["Fiorentina","SA",18,30,6,2,0,6.9],["Fiorentina","SA",50,37,21,2,0,7.4],["Juventus","SA",85,36,24,3,0,7.5],
  ["Juventus","SA",60,27,10,2,0,6.9],["Juventus","SA",65,33,16,3,0,7.2],["Juventus","SA",45,30,10,3,0,7.0],
  ["Juventus","SA",30,26,8,2,0,7.0]]);
P("Viktor Gyökeres", "Sweden", "FWD", 1998, 65, [
  null,["IF Brommapojkarna","SWE",1,25,7,3,0,6.9],["Brighton & Hove Albion","EPL",1,1,0,0,0,6.4],
  ["St. Pauli","BL2",3,26,7,3,0,7.0],["Coventry City","CH",4,19,3,1,0,6.8],["Coventry City","CH",8,45,17,4,0,7.3],
  ["Coventry City","CH",15,46,21,12,0,7.6],["Sporting CP","POR",60,33,29,10,0,8.0],["Sporting CP","POR",75,33,39,6,0,8.2],
  ["Arsenal","EPL",65,32,14,4,0,7.2]]);
P("Michael Olise", "France", "FWD", 2001, 110, [
  null,null,["Reading","CH",1,7,0,0,0,6.6],
  ["Reading","CH",5,36,1,4,0,6.9],["Reading","CH",15,44,7,12,0,7.3],["Crystal Palace","EPL",25,26,2,5,0,7.1],
  ["Crystal Palace","EPL",40,37,2,11,0,7.3],["Crystal Palace","EPL",55,19,10,6,0,7.5],["Bayern Munich","BL",60,34,12,15,0,7.8],
  ["Bayern Munich","BL",100,32,15,17,0,8.0]]);
P("Nico Williams", "Spain", "FWD", 2002, 55, [
  null,null,null,
  null,["Athletic Bilbao","LL",2,9,1,0,0,6.6],["Athletic Bilbao","LL",20,32,2,4,0,6.9],
  ["Athletic Bilbao","LL",35,35,6,4,0,7.0],["Athletic Bilbao","LL",60,31,8,11,0,7.5],["Athletic Bilbao","LL",70,32,5,6,0,7.2],
  ["Athletic Bilbao","LL",60,28,6,5,0,7.1]]);
P("Paulo Dybala", "Argentina", "FWD", 1993, 7, [
  ["Juventus","SA",70,31,11,7,0,7.6],["Juventus","SA",110,33,22,5,0,7.7],["Juventus","SA",80,32,5,8,0,7.0],
  ["Juventus","SA",80,33,11,6,0,7.5],["Juventus","SA",60,14,2,2,0,6.8],["Juventus","SA",40,29,10,5,0,7.3],
  ["AS Roma","SA",35,25,12,7,0,7.5],["AS Roma","SA",25,28,13,9,0,7.6],["AS Roma","SA",18,28,6,4,0,7.1],
  ["AS Roma","SA",10,22,5,4,0,7.0]]);
