import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { installPage } from "./app-page.mjs";
import { kiPage } from "./ki-page.mjs";
import { glossaryPage } from "./glossary-page.mjs";
const out = "dist";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync("public", out, { recursive: true });
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8")); // Dados ausentes interrompem o build.
const version = read("package.json").version;
const db = read("content/encyclopedia.json");
const ki = read("content/ki.json");
const kiImages = read("content/ki-images.json");
const glossary = read("content/glossary.json");
const news = read("content/news.json");
const arts = read("content/images.json");
const forms = read("content/transformations.json");
const films = read("content/films.json");
const base =
  process.env.SITE_URL ||
  "https://aldenirfilho.github.io/dragonballlegadoeterno";
const slug = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const list = (arr) =>
  `<ul>${(arr || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
const para = (t) => `<p>${esc(t)}</p>`;
const tag = (t) => `<span class="tag">${esc(t)}</span>`;
const source = (arr) =>
  `<div class="source-links sources"><span class="meta">Referências e contexto: </span>${[...new Set(arr || [])].map((url, i) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Fonte ${i + 1} ↗</a>`).join(" · ")}</div>`;
const image = (id, alt, cls = "", priority = false) =>
  `<img src="images/${id}.jpg" alt="${esc(alt)}" class="${cls}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="${arts.find((a) => a.id === id)?.width || 1200}" height="${arts.find((a) => a.id === id)?.height || 900}">`;
const artFor = (c) =>
  c.image ||
  {
    goku: "hero",
    vegeta: "vegeta",
    gohan: "gohan-piccolo",
    piccolo: "gohan-piccolo",
    bulma: "bulma",
    kuririn: "familia-kuririn",
    "android-18": "familia-kuririn",
    chichi: "familia-goku",
    goten: "familia-goku",
    trunks: "familia-vegeta",
    pan: "familia-gohan",
    videl: "familia-gohan",
    "trunks-futuro": "trunks-futuro",
    "android-17": "guerreiros-terra",
    tenshinhan: "guerreiros-terra",
    yamcha: "guerreiros-terra",
    bills: "deuses",
    whis: "deuses",
    broly: "broly",
    bardock: "bardock",
    "mestre-kame": "treinamento",
    freeza: "antagonistas",
    cell: "antagonistas",
    "majin-boo": "antagonistas",
  }[c.id];
function characterCard(c) {
  const pic = artFor(c);
  return `<a class="portrait-card" href="personagem-${esc(c.id)}.html" data-search="${esc([c.name, c.group, c.description, ...c.traits, ...c.emotions, ...c.powers].join(" "))}" data-group="${esc(c.group)}">${pic ? `<div class="art">${image(pic, `Representação artística de fãs relacionada a ${c.name}`)}<span class="image-label">FAN ART · IA</span></div>` : ""}<div class="body">${tag(c.group)}<h3>${esc(c.name)}</h3><p>${esc(c.epithet)}</p><div class="tags">${c.emotions
    .slice(0, 2)
    .map((x) => `<span class="pill">${esc(x)}</span>`)
    .join("")}</div></div></a>`;
}
const newsCard = (n) =>
  `<article class="news-card" data-search="${esc(n.title + " " + n.type + " " + n.summary)}" data-group="${esc(n.type)}"><div class="meta"><span class="status">● ${esc(n.status)}</span> · ${esc(n.type)}</div><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><p class="meta">${esc(n.territory)}</p><a href="noticia-${esc(n.id)}.html">Entenda o anúncio →</a><p class="meta">Fonte publicada em ${new Date(n.publishedAt + "T12:00:00Z").toLocaleDateString("pt-BR")}</p></article>`;
const entries = [];
const nav = [
  ["index.html", "Início"],
  ["personagens.html", "Personagens"],
  ["historia.html", "História"],
  ["ki.html", "Atlas do Ki"],
  ["glossario.html", "Dicionário & cultura"],
  ["goku.html", "Universo Goku"],
  ["licoes.html", "Lições de vida"],
  ["noticias.html", "Radar"],
  ["instalar.html", "Aplicativo ↓"],
];
const foot = `<footer class="site-footer"><div class="wrap"><div class="footer-top"><div><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">悟</span><span><strong>DRAGON BALL</strong><small>LEGADO ETERNO</small></span></a><p>Um acervo de histórias, encontros e aprendizados. Criado por Aldenir Filho para quem cresceu com Dragon Ball — e para quem está chegando agora.</p></div><div><h3>Explore o acervo</h3><a href="familias.html">Famílias & vínculos</a><a href="poderes.html">Técnicas & transformações</a><a href="ki.html">Ki por personagem e saga</a><a href="glossario.html">Dicionário & cultura</a><a href="filmes.html">Guia de filmes</a><a href="galeria.html">Galeria de artes</a></div><div><h3>Um legado coletivo</h3><a href="instalar.html">Instalar aplicativo ↓</a><a href="sobre.html">O projeto & fontes</a><a href="busca.html">Buscar na enciclopédia</a><a href="https://github.com/aldenirfilho/dragonballlegadoeterno">Repositório no GitHub ↗</a><a href="https://github.com/aldenirfilho/dragonballlegadoeterno/issues/new/choose">Sugerir ou corrigir ↗</a></div></div><div class="footer-bottom"><span>Projeto independente de fãs. Dragon Ball e seus personagens pertencem aos respectivos titulares: Akira Toriyama / Bird Studio / Shueisha / Toei Animation.<br>Fan art de IA e imagens de referência estão identificadas nas respectivas legendas. Sem afiliação ou endosso.</span><span>Feito com memória, curiosidade e respeito.<br>Revisão editorial: ${new Date(news.checkedAt + "T12:00:00Z").toLocaleDateString("pt-BR")}</span></div></div></footer>`;
function page(file, title, description, body, current = file) {
  const fullTitle =
    title === "Início"
      ? "Dragon Ball · Legado Eterno"
      : title + " · Dragon Ball Legado Eterno";
  const text = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${file === "404.html" ? `<base href="${base}/">` : ""}<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(fullTitle)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#0b1014"><link rel="canonical" href="${base}/${file}"><meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><link rel="manifest" href="manifest.webmanifest"><link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png"><link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png"><meta name="apple-mobile-web-app-title" content="Legado Eterno"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><link rel="stylesheet" href="style.css">${file === "ki.html" ? '<link rel="stylesheet" href="ki.css">' : file === "glossario.html" ? '<link rel="stylesheet" href="glossario.css">' : ""}<script src="app.js" defer></script><script src="pwa.js" defer></script></head><body><a class="skip" href="#conteudo">Pular para o conteúdo</a><header class="masthead"><div class="wrap head-inner"><a class="brand" href="index.html" aria-label="Dragon Ball Legado Eterno, início"><span class="brand-mark" aria-hidden="true">悟</span><span><strong>DRAGON BALL</strong><small>LEGADO ETERNO</small></span></a><nav class="navigation" id="navigation" aria-label="Navegação principal">${nav.map(([url, label]) => `<a href="${url}" ${url === current ? 'class="current" aria-current="page"' : ""}>${label}</a>`).join("")}</nav><div class="head-tools"><a class="icon-button" href="busca.html" aria-label="Buscar na enciclopédia">⌕</a><button class="icon-button" data-font aria-pressed="false" aria-label="Alternar texto ampliado">A+</button><button class="icon-button menu-button" data-menu aria-expanded="false" aria-controls="navigation" aria-label="Abrir navegação">☰</button></div></div></header><div class="offline-notice" data-offline role="status" hidden>Sem conexão detectada. Você está consultando o conteúdo salvo; notícias e fontes externas precisam de internet.</div><div class="update-notice"><button class="button" data-update-app hidden>Atualizar aplicativo ↻</button></div><main id="conteudo">${body}</main>${foot}</body></html>`;
  fs.writeFileSync(path.join(out, file), text);
  entries.push({ file, title, description });
}
const head = (title, desc, eyebrow = "Explore o legado") =>
  `<div class="wrap page-head"><div class="breadcrumb"><a href="index.html">Início</a> / ${esc(title)}</div><span class="eyebrow">${esc(eyebrow)}</span><h1 class="page-title">${esc(title)}</h1><p class="page-intro">${esc(desc)}</p></div>`;
const sectionHead = (eyebrow, title, desc, url, label) =>
  `<div class="section-heading"><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2><p>${esc(desc)}</p></div>${url ? `<a class="text-link" href="${url}">${esc(label)} ↗</a>` : ""}</div>`;
const caution =
  '<div class="notice">Este acervo contém spoilers. As adaptações nem sempre contam a mesma versão dos acontecimentos; cada verbete indica seu contexto.</div>';
page(
  "index.html",
  "Início",
  "Uma enciclopédia de fãs: conheça Dragon Ball, seus personagens, famílias, técnicas e o que a jornada de Goku pode ensinar.",
  `<section class="hero">${image("hero", "Goku observa as montanhas ao amanhecer. Ilustração de fãs gerada por IA.", "hero-art", true)}<div class="wrap"><div class="hero-copy"><span class="eyebrow">UM UNIVERSO DE HISTÓRIAS. UM LEGADO SEM FIM.</span><h1>A força passa.<br><span>O legado fica.</span></h1><p>Das primeiras aventuras às batalhas entre universos. Explore os personagens, os laços e as lições que fazem Dragon Ball atravessar gerações.</p><div class="actions"><a class="button primary" href="personagens.html">Explorar a enciclopédia <span>↗</span></a><a class="button" href="goku.html">A jornada de Goku <span>→</span></a></div><p class="hero-note">Para os fãs. Pelas histórias. Por quem nunca deixa de aprender.</p></div></div></section><div class="wrap quick-links"><a href="historia.html"><span class="quick-number">01</span><span>Uma história sem fim<small>Origens, sagas e universos</small></span></a><a href="familias.html"><span class="quick-number">02</span><span>Laços que nos movem<small>Famílias e amizades</small></span></a><a href="poderes.html"><span class="quick-number">03</span><span>Além do poder<small>Técnicas e transformações</small></span></a><a href="noticias.html"><span class="quick-number">04</span><span>O próximo capítulo<small>Notícias com fontes</small></span></a></div><section class="wrap section home-characters">${sectionHead("Pessoas antes de poderes", "Conheça os protagonistas", "Cada guerreiro carrega uma história. E muito mais do que força.", "personagens.html", "Todos os personagens")}<div class="card-grid">${db.characters.slice(0, 4).map(characterCard).join("")}</div></section><section class="section alt"><div class="wrap split"><div class="split-art">${image("treinamento", "Goku e Kuririn treinam com Mestre Kame junto ao mar. Fan art gerada por IA.")}</div><div><span class="eyebrow">ESPECIAL · SON GOKU</span><h2>O segredo é continuar<br><em>sendo aprendiz.</em></h2><p>Goku aprende com mestres, rivais, derrotas e amigos. Seu talento importa, mas a disposição de recomeçar é o que mantém sua jornada aberta.</p><p class="quote">Ser forte também é reconhecer quando você precisa dos outros.<small>INTERPRETAÇÃO EDITORIAL · NÃO É UMA CITAÇÃO DA OBRA</small></p><a class="button primary" href="goku.html">Entender a jornada de Goku →</a></div></div></section><section class="wrap section">${sectionHead("O universo continua", "No radar de Dragon Ball", "Anúncios oficiais, datas e o que ainda está por confirmar.", "noticias.html", "Ver o radar completo")}<div class="card-grid three">${news.items.slice(0, 3).map(newsCard).join("")}</div></section><section class="section alt"><div class="wrap split"><div><span class="eyebrow">AS BATALHAS QUE IMPORTAM</span><h2>Coragem para lutar.<br><em>Amor para voltar.</em></h2><p>A rivalidade de Vegeta. O cuidado de Piccolo. A inventividade de Bulma. As histórias ficam maiores quando enxergamos o que cada personagem tem a proteger.</p><ul class="feature-list"><li><span>01</span> Famílias de sangue e vínculos escolhidos</li><li><span>02</span> Transformações que acontecem por dentro</li><li><span>03</span> Lições para uma vida fora das batalhas</li></ul><div class="actions"><a class="button" href="familias.html">Conhecer as famílias →</a><a class="text-link" href="licoes.html">Ler as lições</a></div></div><div class="split-art">${image("familia-vegeta", "Vegeta, Bulma, Trunks e Bra reunidos. Ilustração de fãs gerada por IA.")}</div></div></section><section class="wrap section"><div class="statement"><div class="ornament" aria-hidden="true">✦ ✦ ✦ ✦</div><h2>Uma história de Toriyama.<br>Milhões de histórias em nós.</h2><p>Este projeto preserva memórias e abre espaço para novas leituras. Explore, confira as fontes e ajude a construir o próximo capítulo deste acervo.</p><a class="button" href="sobre.html">Conheça o projeto e participe ↗</a></div></section>`,
);
const groups = [...new Set(db.characters.map((c) => c.group))];
page(
  "personagens.html",
  "Personagens",
  "Histórias, poderes, emoções e contradições. Explore os perfis e descubra quem existe por trás de cada batalha.",
  head(
    "Personagens",
    "Histórias, poderes, emoções e contradições. Descubra quem existe por trás de cada batalha.",
    "ARQUIVO DE PERSONAGENS",
  ) +
    `<section class="wrap" style="padding-bottom:70px"><div class="filter-bar"><label for="catalog-search">Buscar por nome, técnica ou sentimento<input type="search" id="catalog-search" placeholder="Goku, coragem, Kamehameha…"></label><label for="catalog-filter">Grupo<select id="catalog-filter"><option value="">Todos os grupos</option>${groups.map((g) => `<option>${esc(g)}</option>`).join("")}</select></label><output data-results aria-live="polite">${db.characters.length} resultados</output></div><div class="card-grid">${db.characters.map(characterCard).join("")}</div><p class="empty" data-empty hidden>Nenhum personagem encontrado. Tente outro nome, sentimento ou técnica.</p>${caution}</section>`,
);
for (const c of db.characters) {
  const pic = artFor(c);
  page(
    `personagem-${c.id}.html`,
    c.name,
    c.description,
    head(c.name, c.epithet, c.group) +
      `<div class="wrap"><div class="profile-top">${pic ? `<figure style="margin:0">${image(pic, `Fan art relacionada a ${c.name}`, "", true)}<figcaption class="caption">Ilustração de fãs gerada por IA. A imagem pode reunir outros personagens.</figcaption></figure>` : ""}<div class="prose">${para(c.description)}<div class="article-tags">${c.traits.map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div><dl class="facts"><div><dt>Emoções centrais · leitura editorial</dt><dd>${esc(c.emotions.join(" · "))}</dd></div><div><dt>Técnicas & habilidades</dt><dd>${esc(c.powers.join(" · "))}</dd></div><div><dt>Família & vínculos</dt><dd>${esc(c.family)}</dd></div><div><dt>Contexto da obra</dt><dd>${esc(c.continuity)}</dd></div></dl></div></div><div class="reading-layout"><article class="prose"><h2>Uma trajetória em transformação</h2>${para(c.arc)}<h2>O que essa história pode ensinar</h2>${para(c.lesson)}<h2>As contradições também fazem parte</h2>${para(c.limitation)}${source(c.sources)}<div class="actions"><a class="button" href="personagens.html">← Outros personagens</a><a class="button" href="familias.html">Famílias & vínculos →</a></div></article><aside class="reading-aside"><h2>Continue explorando</h2><a href="goku.html">A jornada de Goku</a><a href="poderes.html">Técnicas e limites</a><a href="ki.html?personagem=${esc(c.id)}">Ki de ${esc(c.name)} por saga</a><a href="licoes.html">Lições para o cotidiano</a><a href="sobre.html">Como este acervo é revisado</a></aside></div></div>`,
    "personagens.html",
  );
}
page(
  "goku.html",
  "A jornada de Goku",
  "Por que Goku continua crescendo? Um ensaio sobre curiosidade, prática, vínculos, limites e a coragem de aprender.",
  head(
    "A jornada de Goku",
    "A força de quem nunca deixa de aprender. Um olhar sobre sua evolução — e sobre as contradições que tornam essa história interessante.",
    "ESPECIAL · SON GOKU",
  ) +
    `<div class="wrap reading-layout"><article class="prose">${image("hero", "Goku contempla o horizonte em uma interpretação de fãs gerada por IA.", "article-image", true)}<p class="caption">Fan art gerada por IA · Ensaio de interpretação, com contexto da obra.</p>${para(db.goku.intro)}${para(db.goku.identity)}<div class="notice">${esc(db.goku.nuance || "Goku não vence sempre. A dor não produz crescimento automaticamente. Descanso, apoio e responsabilidade também fazem parte da força.")}</div>${db.goku.chapters.map((ch, i) => `<section class="chapter" id="capitulo-${i + 1}"><h2><span>${String(i + 1).padStart(2, "0")}</span>${esc(ch.title)}</h2><h3>Na história</h3>${para(ch.story)}<h3>Uma leitura possível</h3>${para(ch.reflection)}<div class="practice"><strong>Leve para a vida</strong>${para(ch.practice)}</div>${i === 1 ? image("treinamento", "Kame, Goku e Kuririn treinam juntos. Fan art de aprendizado.", "article-image chapter-art") : i === 4 ? image("rivalidade", "Goku e Vegeta conversam ao pôr do sol. Fan art de cooperação.", "article-image chapter-art") : i === 7 ? image("familia-goku", "Goku, Chi-Chi, Gohan e Goten reunidos. Fan art de família.", "article-image chapter-art") : ""}</section>`).join("")}<h2>A maior transformação continua aberta</h2><p>Ser um ser humano melhor é uma responsabilidade nossa. Goku é um Saiyajin fictício criado na Terra: sua história pode inspirar curiosidade e afeto, mas suas decisões não são regras para a vida. Coragem também é interromper uma luta desnecessária, aceitar ajuda e cuidar de alguém.</p>${source(db.goku.sources)}<div class="actions"><a href="licoes.html" class="button primary">Outras lições do universo Dragon Ball →</a></div></article><aside class="reading-aside"><h2>Neste especial</h2>${db.goku.chapters.map((c, i) => `<a href="#capitulo-${i + 1}">${String(i + 1).padStart(2, "0")} · ${esc(c.title)}</a>`).join("")}<a href="personagem-goku.html">Ficha de Goku ↗</a></aside></div>`,
);
page(
  "historia.html",
  "História & legado",
  "Da aventura de 1984 a um universo que atravessa gerações. Um mapa das sagas e de suas diferentes continuidades.",
  head(
    "História & legado",
    "Da aventura de 1984 a um universo que atravessa gerações. Um mapa para se orientar entre mangá, séries e histórias alternativas.",
    "A JORNADA COMEÇA AQUI",
  ) +
    `<div class="wrap reading-layout"><article class="prose"><h2>O mundo que Akira Toriyama abriu</h2><p>Dragon Ball começou a ser publicado na Weekly Shonen Jump em novembro de 1984. A aventura de um menino de cauda e uma jovem inventora reuniu humor, artes marciais e fantasia. Sua escala cresceu, mas o encontro entre pessoas diferentes continuou no centro da história.</p><p>O mangá original de Toriyama é uma obra contínua. A adaptação para televisão dividiu essa jornada em Dragon Ball e Dragon Ball Z. Super, GT, DAIMA e os filmes exigem atenção às próprias versões dos acontecimentos: uma enciclopédia não precisa apagar essas diferenças para celebrar todas elas.</p><p>Toriyama também deixou um legado de clareza visual, movimento e humor. A homenagem mais cuidadosa é ler sua obra em edições autorizadas e reconhecer a contribuição de artistas, animadores, tradutores, dubladores e leitores que mantêm essa história em circulação.</p>${source(["https://en.dragon-ball-official.com/news/01_3975.html"])}${caution}<div class="timeline">${db.sagas.map((s) => `<article id="${esc(s.id)}">${tag(s.era)}<h2>${esc(s.title)}</h2>${para(s.summary)}<h3>O que permanece</h3>${list(s.lessons)}<p class="meta">${esc(s.continuity)}</p>${source(s.sources)}</article>`).join("")}</div><h2>Uma boa ordem para começar</h2><p>Comece por Dragon Ball e siga para Z ou Kai, a remontagem mais concisa de Z. Depois explore Super e seus filmes associados. Assista a GT e DAIMA respeitando suas propostas próprias. Ordem de lançamento e ordem interna da história não são a mesma coisa; este guia prioriza a compreensão da jornada.</p></article><aside class="reading-aside"><h2>Mapa das sagas</h2>${db.sagas.map((s) => `<a href="#${esc(s.id)}">${esc(s.title)}</a>`).join("")}<a href="filmes.html">Guia de filmes ↗</a></aside></div>`,
);
page(
  "familias.html",
  "Famílias & vínculos",
  "Pais, filhos, parceiros e mestres. A força de Dragon Ball também nasce do cuidado e dos vínculos escolhidos.",
  head(
    "Famílias & vínculos",
    "Pais, filhos, parceiros e mestres. Nem todo laço nasce do sangue — e nenhuma família se resume a uma árvore genealógica.",
    "O QUE TEMOS A PROTEGER",
  ) +
    `<section class="wrap section" style="padding-top:0">${db.families.map((f, i) => `<article class="family-card">${image(f.image || { "familia-son": "familia-goku", "familia-capsula": "familia-vegeta", "familia-gohan-videl": "familia-gohan", "familia-kuririn": "familia-kuririn", "familia-bardock": "bardock" }[f.id], `Interpretação artística relacionada a ${f.name}`)}<div class="family-body"><span class="eyebrow">VÍNCULOS & PERTENCIMENTO</span><h2>${esc(f.name)}</h2><div class="family-members">${f.members.map((m) => `<span>${esc(m)}</span>`).join("")}</div>${para(f.description)}${list(f.relationships)}<p><strong>Uma leitura para a vida:</strong> ${esc(f.lesson)}</p><p class="meta">${esc(f.continuity)}</p>${source(f.sources)}</div></article>`).join("")}<p class="caption">Artes interpretativas de fãs. As relações descritas no texto são a referência para o parentesco; as composições não são árvores genealógicas.</p></section>`,
);
page(
  "licoes.html",
  "Lições de vida",
  "Coragem, amizade, reparação e responsabilidade: leituras de Dragon Ball que podem acompanhar a vida cotidiana.",
  head(
    "Lições de vida",
    "A ficção oferece perguntas poderosas. Aqui, cada aprendizado parte de uma cena, propõe uma interpretação e chega a uma ação possível.",
    "FORÇA PARA ALÉM DA BATALHA",
  ) +
    `<div class="wrap reading-layout"><article class="prose">${image("solidariedade", "Mãos levantadas e Goku reunindo energia em uma Genki Dama. Fan art de solidariedade.", "article-image", true)}<p class="caption">Ilustração gerada por IA · As reflexões abaixo são interpretações editoriais, não ensinamentos oficiais ou citações.</p>${db.lessons.map((l, i) => `<section class="chapter" id="${esc(l.id)}"><h2><span>${String(i + 1).padStart(2, "0")}</span>${esc(l.title)}</h2><h3>A cena e seu contexto</h3>${para(l.scene)}<h3>Uma leitura possível</h3>${para(l.interpretation)}<div class="practice"><strong>Uma ação pequena para hoje</strong>${para(l.practice)}</div><p><strong>O limite da comparação:</strong> ${esc(l.ethicalLimit)}</p><p class="meta">${esc(l.continuity)}</p>${source(l.sources)}</section>`).join("")}</article><aside class="reading-aside"><h2>Escolha um aprendizado</h2>${db.lessons.map((l) => `<a href="#${esc(l.id)}">${esc(l.title)}</a>`).join("")}</aside></div>`,
);
page(
  "poderes.html",
  "Técnicas & transformações",
  "O que as técnicas fazem, quem as utiliza e quais são seus limites. Poder não é uma escala universal de números.",
  head(
    "Técnicas & transformações",
    "Força, controle, estratégia e custo. Entenda como os poderes funcionam no contexto de cada história.",
    "ARQUIVO DE COMBATE",
  ) +
    `<section class="wrap section" style="padding-top:0"><div class="notice">Não existe uma escala numérica oficial única que permita comparar todas as fases de Dragon Ball. Este acervo não inventa níveis de poder ou multiplicadores para formas sem referência verificável. Instinto Superior é ficção; não é uma descrição científica do funcionamento cerebral.</div>${sectionHead("12 caminhos de combate", "O repertório dos guerreiros", "Cada técnica resolve um problema — e tem limites.")}<div class="card-grid three">${db.techniques.map((t) => `<article class="text-card" id="${esc(t.id)}">${tag(t.users.join(" · "))}<h3>${esc(t.name)}</h3>${para(t.description)}<p><strong>Limite:</strong> ${esc(t.limitation)}</p><p class="meta">${esc(t.continuity)}</p>${source(t.sources)}</article>`).join("")}</div><div style="margin-top:60px">${sectionHead("Mudanças de forma", "Nem toda evolução é igual", "Técnicas, transformações e fusões têm funções diferentes.")}<div class="card-grid three">${forms.map((t) => `<article class="text-card" id="forma-${slug(t.name)}"><span class="tag">${esc(t.context)}</span><h3>${esc(t.name)}</h3>${para(t.description)}<p><strong>Custo ou ressalva:</strong> ${esc(t.limit)}</p>${source(t.sources)}</article>`).join("")}</div></div></section>`,
);
page(
  "noticias.html",
  "Radar Dragon Ball",
  "Acompanhe anúncios oficiais de séries, filmes e especiais, com data de publicação, território e limites da confirmação.",
  head(
    "Radar Dragon Ball",
    "O que foi anunciado. O que já estreou. O que ainda não tem data. Um radar com fontes para acompanhar o próximo capítulo.",
    "NOTÍCIAS & LANÇAMENTOS",
  ) +
    `<section class="wrap" style="padding-bottom:70px"><div class="notice"><strong>Última checagem editorial: ${new Date(news.checkedAt + "T12:00:00Z").toLocaleDateString("pt-BR")}.</strong> Esta página é um retrato datado das fontes consultadas. O monitor do repositório sinaliza mudanças para revisão; notícias só mudam após atualização editorial. Disponibilidade no Brasil depende de anúncio local.</div><div class="filter-bar"><label for="catalog-search">Buscar anúncio<input id="catalog-search" type="search" placeholder="Beerus, DAIMA, cinema…"></label><label for="catalog-filter">Categoria<select id="catalog-filter"><option value="">Todas</option>${[...new Set(news.items.map((n) => n.type))].map((t) => `<option>${esc(t)}</option>`).join("")}</select></label><output data-results aria-live="polite">${news.items.length} resultados</output></div><div class="card-grid three">${news.items.map(newsCard).join("")}</div><p class="empty" data-empty hidden>Nenhum anúncio encontrado com esses filtros.</p><div class="notice"><strong>Cinemas no Brasil:</strong> não foi confirmado um novo longa de Dragon Ball em cartaz no corte desta pesquisa. O especial de DAIMA de fevereiro de 2025 é um registro histórico. Consulte a programação local antes de planejar uma sessão.</div><a class="button" href="filmes.html">Explorar o guia de filmes →</a></section>`,
);
for (const n of news.items)
  page(
    `noticia-${n.id}.html`,
    n.title,
    n.summary,
    head(n.title, n.status, n.type) +
      `<div class="wrap reading-layout"><article class="prose"><p class="meta">Publicado pela fonte em ${new Date(n.publishedAt + "T12:00:00Z").toLocaleDateString("pt-BR")} · Conferido em ${new Date(news.checkedAt + "T12:00:00Z").toLocaleDateString("pt-BR")}</p>${para(n.summary)}${para(n.details)}<div class="notice">${esc(n.territory)}</div><p><a href="${esc(n.sourceUrl)}" rel="noopener noreferrer" target="_blank">Ler o anúncio original em ${esc(n.sourceName)} ↗</a></p><p>As informações podem ser atualizadas pelas produtoras e distribuidoras. Uma estreia japonesa não confirma automaticamente uma estreia brasileira.</p><a href="noticias.html" class="button">← Voltar ao radar</a></article><aside class="reading-aside"><h2>Critério editorial</h2><p>Fontes primárias, datas explícitas e nenhuma conversão de rumor em anúncio.</p><a href="sobre.html">Conheça nossa política</a></aside></div>`,
    "noticias.html",
  );
page(
  "filmes.html",
  "Guia de filmes",
  "Uma seleção de longas e especiais para orientar sua exploração do cinema de Dragon Ball.",
  head(
    "Guia de filmes",
    "Histórias de cinema, versões alternativas e novas fases. Uma seleção inicial para orientar a sua próxima sessão.",
    "CINEMA & ESPECIAIS",
  ) +
    `<section class="wrap section" style="padding-top:0"><div class="notice">Este é um guia histórico, não uma lista de filmes em cartaz. Anos se referem ao lançamento original no Japão. Catálogos de streaming e relançamentos variam por região.</div><div class="card-grid three">${films.map((f) => `<article class="text-card" id="filme-${slug(f.title)}">${tag(f.year + " · " + f.continuity)}<h2 style="font-size:1.35rem">${esc(f.title)}</h2>${para(f.summary)}<p><strong>Olhar para a história:</strong> ${esc(f.lesson)}</p>${source(f.sources)}</article>`).join("")}</div><div class="actions"><a class="button primary" href="noticias.html">Consultar anúncios e próximas estreias →</a></div></section>`,
);
page(
  "galeria.html",
  "Galeria do legado",
  "Ilustrações de fãs sobre personagens, famílias, treinamento, amizade e solidariedade.",
  head(
    "Galeria do legado",
    "Personagens, famílias e os encontros que nos transformam. Artes criadas para acompanhar a leitura deste acervo.",
    "IMAGENS QUE CONTAM HISTÓRIAS",
  ) +
    `<section class="wrap section" style="padding-top:0"><div class="notice">${arts.length} ilustrações de fãs geradas por IA. São interpretações artísticas, não imagens oficiais nem provas de acontecimentos da obra. Selecione uma arte para ampliar.</div><div class="gallery-grid">${arts.map((a) => `<button class="gallery-item" data-art="images/${esc(a.id)}.jpg" data-alt="${esc(a.alt)}" data-title="${esc(a.title)}">${image(a.id, a.alt)}<span class="body"><strong>${esc(a.title)}</strong><small>${esc(a.theme)} · Ampliar ↗</small></span></button>`).join("")}</div></section><dialog id="art-dialog" aria-labelledby="art-title"><div class="dialog-top"><h2 id="art-title">Arte do legado</h2><button class="icon-button" data-close aria-label="Fechar imagem ampliada">✕</button></div><img src="images/hero.jpg" alt=""><p class="caption">Interpretação artística de fãs gerada por IA.</p></dialog>`,
);
page(
  "sobre.html",
  "Um legado em construção",
  "Propósito, fontes, créditos e como contribuir para uma enciclopédia independente de fãs de Dragon Ball.",
  head(
    "Um legado em construção",
    "Preservar a memória. Entender as histórias. Compartilhar o aprendizado. Um acervo aberto ao cuidado de quem ama Dragon Ball.",
    "SOBRE O PROJETO",
  ) +
    `<div class="wrap reading-layout"><article class="prose"><h2>Uma homenagem, com responsabilidade</h2><p>Dragon Ball · Legado Eterno é uma iniciativa de Aldenir Filho para reunir histórias, personagens, famílias, técnicas e reflexões em português. Não é um site oficial, não representa os titulares da franquia e não promete ser um catálogo exaustivo. É uma primeira coleção ampla, feita para crescer com fontes e revisão.</p><h2>Como ler este acervo</h2><ul><li><strong>Fato da obra:</strong> o acontecimento é contextualizado no mangá, anime ou filme.</li><li><strong>Interpretação editorial:</strong> emoções, valores e lições são leituras argumentadas, não diagnósticos ou falas atribuídas aos criadores.</li><li><strong>Notícia confirmada:</strong> precisa de fonte identificada, data e território.</li><li><strong>Ausência de confirmação:</strong> indica limite da consulta, não prova de que um projeto nunca existirá.</li></ul><h2>Fontes e continuidade</h2><p>Priorizamos o portal oficial Dragon Ball, Toei Animation, editoras, distribuidoras e plataformas responsáveis pelos anúncios. Os verbetes usam descrições originais, com referências para aprofundamento. Mangá, anime, GT, DAIMA e filmes são identificados sem fingir que todas as adaptações formam uma única cronologia sem diferenças.</p>${source(["https://en.dragon-ball-official.com/", "https://www.toei-animation.com/", "https://www.shueisha.co.jp/", "https://www.crunchyroll.com/pt-br/", "https://www.parisfilmes.com.br/"])}<h2>Imagens e direitos</h2><p>A galeria reúne ilustrações geradas por IA para este projeto como fan art. Podem conter diferenças de figurino, composição ou aparência. Não são frames oficiais, não devem ser usadas como referência documental e não conferem ao projeto direitos sobre os personagens. Nomes, marcas e personagens pertencem aos respectivos titulares. O Atlas do Ki também incorpora imagens de referência de páginas oficiais, com crédito, origem e relação com a fase na legenda. Elas permanecem hospedadas pelos respectivos titulares e precisam de conexão; uma imagem de uma transformação não comprova, por si, um número de poder. Não distribuímos episódios, filmes, músicas ou volumes de mangá.</p><h2>Agentes para cuidar do acervo</h2><p>O repositório inclui três rotinas: um catalogador verifica campos, identificadores e referências; um organizador produz o inventário e aponta lacunas; um observador consulta páginas de fontes oficiais e registra alterações para revisão. São ferramentas de apoio, não uma equipe humana permanente.</p><p>O acompanhamento semanal prepara propostas de atualização para revisão. O GitHub Actions também permite executar o relatório técnico sob demanda. Nenhuma rotina publica rumores ou faz mudanças editoriais sem revisão. Cada alteração de conteúdo fica registrada no histórico do repositório.</p><h2>Como participar</h2><p>Encontrou um erro, uma fonte melhor ou um personagem que merece entrar? Abra uma sugestão no repositório com o trecho, a correção e sua referência. Evite incluir informações pessoais; sugestões públicas podem ser lidas por qualquer pessoa.</p><div class="actions"><a class="button primary" href="https://github.com/aldenirfilho/dragonballlegadoeterno/issues/new/choose">Contribuir com o acervo ↗</a><a class="button" href="https://github.com/aldenirfilho/dragonballlegadoeterno">Ver o repositório ↗</a></div><h2>Privacidade e acesso</h2><p>O site é estático e pode ser lido sem conta. Não inclui formulários de cadastro, comentários hospedados, publicidade ou rastreadores adicionados pelo projeto. As preferências de texto e os filtros ficam apenas na página atual. A hospedagem e os sites externos podem manter seus próprios registros de acesso.</p><h2>Próximas expansões</h2><p>O roteiro editorial inclui mais personagens, fichas de episódios, diferenças entre mangá e anime, participações da comunidade e novas artes. Cada inclusão precisa ampliar o conhecimento do leitor e manter os critérios de referência, acessibilidade e respeito à obra.</p></article><aside class="reading-aside"><h2>Três compromissos</h2><a href="historia.html">1. Entender a história</a><a href="licoes.html">2. Construir uma leitura própria</a><a href="https://github.com/aldenirfilho/dragonballlegadoeterno/issues/new/choose">3. Compartilhar com fontes</a></aside></div>`,
);
page("ki.html", "Atlas do Ki", "Explore o ki por personagem e fase das sagas, com níveis verificados, transformações e fontes oficiais.", kiPage(ki, esc, kiImages));
fs.writeFileSync(out + "/ki-dados.json", JSON.stringify(ki, null, 2));
fs.writeFileSync(out + "/ki-imagens.json", JSON.stringify(kiImages, null, 2));
page("glossario.html", "Dicionário e cultura", "Descubra significados de Dragon Ball em português, nomes, técnicas e relações culturais com o Brasil.", glossaryPage(glossary, esc));
fs.writeFileSync(out + "/glossario-dados.json", JSON.stringify(glossary, null, 2));
page("instalar.html", "Instalar aplicativo", "Instale o Legado Eterno no macOS, Windows, iPhone, iPad ou Android e leia a enciclopédia offline.", installPage);
page("offline.html", "Sem conexão", "A conexão está indisponível. Continue pela edição salva da enciclopédia.", head("Sua aventura continua", "Esta página ainda não faz parte da edição salva. Conecte-se para carregá-la ou explore o acervo disponível.") + `<div class="wrap section"><a class="button primary" href="index.html">Explorar a edição salva →</a></div>`);
const indexed = [
  ...entries,
  ...glossary.entries.map((e) => ({ file: `glossario.html#termo-${e.id}`, title: e.term, description: `${e.meaning} ${e.inStory}` })),
  ...glossary.comparisons.map((e) => ({ file: `glossario.html#cultura-${e.id}`, title: e.title, description: `${e.inStory} ${e.brazil}` })),
  ...ki.records.map((r) => ({ file: `ki.html#registro-${r.id}`, title: `${ki.characters.find((c) => c.id === r.character).name} · ${ki.phases.find((p) => p.id === r.phase).title} · ${r.form}`, description: r.note })),
  ...db.sagas.map((s) => ({
    file: "historia.html#" + s.id,
    title: s.title,
    description: s.summary,
  })),
  ...db.techniques.map((t) => ({
    file: "poderes.html#" + t.id,
    title: t.name,
    description: t.description,
  })),
  ...forms.map((t) => ({
    file: "poderes.html#forma-" + slug(t.name),
    title: t.name,
    description: t.description,
  })),
  ...films.map((f) => ({
    file: "filmes.html#filme-" + slug(f.title),
    title: f.title,
    description: f.summary,
  })),
  ...db.lessons.map((l) => ({
    file: "licoes.html#" + l.id,
    title: l.title,
    description: l.interpretation,
  })),
];
page(
  "busca.html",
  "Buscar na enciclopédia",
  "Encontre personagens, histórias, notícias e temas do acervo.",
  head(
    "Buscar na enciclopédia",
    "Encontre um personagem, uma saga ou um anúncio. A busca funciona no próprio site.",
    "ENCONTRE SEU CAMINHO",
  ) +
    `<section class="wrap" style="padding-bottom:70px"><div class="filter-bar"><label for="catalog-search">O que você quer descobrir?<input type="search" id="catalog-search" placeholder="Goku, família, filmes, Beerus…"></label><output data-results aria-live="polite">${indexed.length} resultados</output></div>${indexed.map((e) => `<article class="directory-card" data-search="${esc(e.title + " " + e.description)}"><h2><a href="${e.file}">${esc(e.title)} →</a></h2><p>${esc(e.description)}</p></article>`).join("")}<p class="empty" data-empty hidden>Nenhum resultado. Tente uma palavra mais curta ou outro tema.</p></section>`,
);
page(
  "404.html",
  "Caminho não encontrado",
  "Esta página não foi encontrada. Explore a enciclopédia Dragon Ball Legado Eterno.",
  head(
    "Um novo caminho",
    "Esta página não foi encontrada. Sua aventura pode continuar pelo acervo.",
  ) +
    `<div class="wrap section"><a class="button primary" href="index.html">Voltar ao início →</a></div>`,
);
fs.writeFileSync(
  out + "/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
    .filter((e) => e.file !== "404.html")
    .map(
      (e) =>
        `<url><loc>${base}/${e.file}</loc><lastmod>${news.checkedAt}</lastmod></url>`,
    )
    .join("")}</urlset>`,
);
fs.writeFileSync(
  out + "/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`,
);
fs.writeFileSync(out + "/.nojekyll", "");
fs.writeFileSync(
  out + "/build-info.json",
  JSON.stringify(
    {
      version,
      installable: true,
      kiPhases: ki.phases.length,
      kiRecords: ki.records.length,
      kiVerifiedValues: ki.records.filter((r) => r.value !== null).length,
      kiImages: kiImages.images.length,
      glossaryEntries: glossary.entries.length,
      culturalComparisons: glossary.comparisons.length,
      checkedAt: news.checkedAt,
      pages: entries.length,
      characters: db.characters.length,
      illustrations: arts.length,
    },
    null,
    2,
  ),
);
console.log(
  `Build concluído: ${entries.length} páginas, ${db.characters.length} personagens, ${arts.length} artes.`,
);

// Snapshot reproduzível; qualquer mudança publicada renova o service worker.
const offlineFiles = fs.readdirSync(out, { recursive: true })
  .filter((f) => (/\.(html|css|js|png|jpg|webmanifest)$/.test(f) || ["ki-dados.json", "ki-imagens.json", "glossario-dados.json"].includes(f)) && f !== "sw.js" && !f.endsWith("icon-master.png"))
  .sort();
const workerTemplate = fs.readFileSync("scripts/service-worker.js", "utf8");
const hash = createHash("sha256").update(workerTemplate);
for (const file of offlineFiles) hash.update(file).update(fs.readFileSync(path.join(out, file)));
const revision = hash.digest("hex").slice(0, 16);
fs.writeFileSync(path.join(out, "sw.js"), workerTemplate
  .replace("__REVISION__", JSON.stringify(revision))
  .replace("__FILES__", JSON.stringify(offlineFiles)));
console.log(`Aplicativo: ${offlineFiles.length} recursos offline, revisão ${revision}.`);
