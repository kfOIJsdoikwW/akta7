'use strict';
/* =========================================================
   A.K.T.A. – 7. akta (pénzügyi szextortion / hamis profil) – ADATOK
   Lezárt ügy. Minden szereplő, név, fiók, kép és adat KITALÁLT.
   Az intim kép SEHOL nem jelenik meg, még helyőrzőként sem – csak
   „Fotó · Megnyitva” / „Képernyőkép készült” jelzés utal rá.
   A „lány” nem valós személy: hamis profil, szervezett csalás álcája.

   KÉPEK: minden kép az img/ mappából, img/<név>.jpg néven. A meglévő
   (6. aktás) képek fájlnevei vannak felhasználva → az img mappa
   „plug and play” ráhúzható. Új placeholderek („Léna” Pinterestről szedett,
   lopott képei – a fordított képkereső ezeket találja meg máshol is):
     - Instagram: lenaprof (profilkép), lena1, lena2, lena3 (posztok)
     - Snapchat:  lany1, lany2, lany3 (amiket küldött, és Bálint elmentett)
   ========================================================= */

const CASE_NO = '01100/3184/2025.bü.';
const CASE_YEAR = 2025;

// „Léna” lopott fotói (Pinterest) – ezeket ismeri fel a fordított képkereső.
//   INSTAGRAM: lenaprof = profilkép (pfp), lena1..lena3 = a 3 poszt a rácsban.
//   SNAPCHAT:  lany1..lany3 = amiket „Léna” küldött, és Bálint elmentett (így megmaradt).
const STOLEN_IMG = ['img/lenaprof.jpg', 'img/lena1.jpg', 'img/lena2.jpg', 'img/lena3.jpg',
  'img/lany1.jpg', 'img/lany2.jpg', 'img/lany3.jpg'];
const PARTY_IMG = STOLEN_IMG; // (kompatibilitás a képkezelővel)

/* ---------- Szereplők ----------
   pic = img/<pic>.jpg. A meglévő profil-fájlnevekre mutat; ahol nincs
   megfelelő kép, ott színes monogram jelenik meg (ez rendben van). */
const P = {
  balint: { u: 'balint_ngy', n: 'Bálint', h: 210, pic: 'benceprof', real: 'Nagy Bálint' },
  lena:   { u: 'lena.horvath_', n: 'Léna', h: 330, pic: 'lenaprof', fake: true }, // IG pfp = img/lenaprof.jpg
  mate:   { u: 'mate.k', n: 'Máté', h: 205, pic: 'mateprof' },
  dani:   { u: 'dani_h', n: 'Dani', h: 150, pic: 'gergoprof' },
  zoe:    { u: 'zoe.rs', n: 'Zoé', h: 300, pic: 'zsofiprof' },
  hanna:  { u: 'hanna.m', n: 'Hanna', h: 285, pic: 'lauraprof' },
  lilla:  { u: 'lilla.k', n: 'Lilla', h: 350, pic: 'vivienprof' },
  gergo:  { u: 'gergo.n', n: 'Gergő', h: 190 },
  peti:   { u: 'petike04', n: 'Peti', h: 40 },
  tomi:   { u: 'tomi.g', n: 'Tomi', h: 130 }
};
const who = k => P[k];

/* =========================================================
   INSTAGRAM
   ========================================================= */

/* ---------- Sztorik ---------- */
const IG_STORIES = [
  { k: 'balint', me: true, slides: [{ pic: 'bence4', txt: 'hajrá 💚' }] },
  { k: 'lena', slides: [
      { pic: 'lena1', txt: 'szia insta ✨' },
      { pic: 'lena2', txt: 'unatkozom… írjatok 💬' }] },
  { k: 'mate', slides: [{ pic: 'kosar1', txt: 'meccs este 🏀' }] },
  { k: 'zoe', slides: [{ pic: 'naplemente1', txt: 'sunset 🌇' }] },
  { k: 'gergo', slides: [{ pic: 'kondi', txt: 'leg day 🦵' }] },
  { k: 'hanna', slides: [{ pic: 'matcha', txt: 'kávé ☕' }] }
];

/* ---------- Feed ---------- */
const IG_FEED = [
  { by: 'balint', pin: true, imgs: ['bence4', 'mate1'], likes: 84,
    cap: 'hajrá csapat, bejutottunk a döntőbe ⚽🟢', date: '2025. OKTÓBER 30.',
    comments: [['mate.k', 'gólkirály 👑'], ['gergo.n', '💪💪'], ['dani_h', 'nagyok vagytok']] },
  { by: 'mate', imgs: ['kosar1', 'kosar 2'], likes: 121, cap: 'hajrá csapat 🏀', date: '2025. OKTÓBER 26.',
    comments: [['balint_ngy', '🔥'], ['gergo.n', 'jövő héten visszavágó']] },
  { by: 'zoe', imgs: ['naplemente1', 'naplemente2'], likes: 96, cap: 'golden hour 🌅', date: '2025. OKTÓBER 22.',
    comments: [['hanna.m', '😍😍'], ['lilla.k', 'gyönyörű']] },
  { by: 'lena', imgs: ['lena1', 'lena2', 'lena3'], likes: 9, cap: 'új itt 🙈 kövessetek vissza 💕', date: '2025. NOVEMBER 3.',
    comments: [] },
  { by: 'hanna', imgs: ['matcha'], likes: 74, cap: 'lassú reggelek ☕', date: '2025. OKTÓBER 18.',
    comments: [['zoe.rs', 'hol ez a hely?'], ['hanna.m', '@zoe.rs dm 💌']] },
  { by: 'dani', imgs: ['reka7'], likes: 63, cap: 'kör a városban 🚲', date: '2025. OKTÓBER 14.',
    comments: [['balint_ngy', 'legközelebb megyek én is']] }
];

/* ---------- Profilok ---------- */
const IG_PROFILES = {
  balint: { followers: '318', following: 402, bio: 'Nagy Bálint · 15\nfoci ⚽ | Budapest 📍', priv: false,
    highlights: [{ n: 'foci ⚽', pic: 'bence4' }, { n: 'haverok 🤝', pic: 'kosar1' }],
    grid: ['bence4', 'mate1', 'kosar1', 'kondi', 'reka7', 'reka10', 'naplemente1', 'matcha', 'hazimozi1'] },
  lena: { followers: '11', following: 87, bio: 'Léna 🌸 15\n„ismerkedjünk” 💬', priv: false, fake: true, joined: '2025.10.31.',
    highlights: [],
    grid: ['lena1', 'lena2', 'lena3'] },
  mate: { followers: '404', following: 380, bio: 'Máté\nkosár 🏀', priv: false, highlights: [],
    grid: ['kosar1', 'kosar 2', 'mate1', 'mate2'] },
  zoe: { followers: '511', following: 430, bio: 'Zoé 🌷', priv: false, highlights: [],
    grid: ['naplemente1', 'naplemente2', 'naplemente3'] },
  dani: { followers: '276', following: 310, bio: 'Dani 🚲\nzene & bringa', priv: false, highlights: [],
    grid: ['reka7', 'reka8', 'reka11'] }
};

/* ---------- Privát üzenetek (Instagram) ----------
   A Lénával folytatott beszélgetés az ISMERKEDÉS eleje: a manipuláció
   jelei látszanak (gyors bizalom, más appra terelés, titkolózás).
   Sem itt, sem máshol nincs szexuális vagy romantikus tartalom kiskorú felé. */
const IG_DMS = {
  lena: { with: 'lena', unread: true, msgs: [
    { d: '2025.11.03', t: '19:22', x: 'szia! láttam kommenteltél máté képe alá 😄 te is kosarazol?', them: 1 },
    { d: '2025.11.03', t: '19:25', x: 'szia! csak ritkán szoktam, inkább focizok 😅', me: 1 },
    { d: '2025.11.03', t: '19:26', x: 'áá értem 😄 amúgy tök cuki vagy esküszöm', them: 1 },
    { d: '2025.11.03', t: '19:31', x: 'awww köszi', me: 1 },
    { d: '2025.11.03', t: '19:31', x: 'teiss', me: 1 },
    { d: '2025.11.03', t: '19:33', x: 'amúgy inkább snapen szeretek beszélni, beaddolsz? ugyanez a nevem 💬', them: 1 },
    { d: '2025.11.03', t: '19:40', x: 'perszee', me: 1 },
    { d: '2025.11.03', t: '19:41', x: 'várommm', them: 1 },
    { d: '2025.11.03', t: '19:41', x: '❤️', them: 1 },
    { d: '2025.11.03', t: '19:43', note: 'A beszélgetés innen a Snapchaten folytatódott (lásd a Snapchat-mentést).', them: 1 }
  ]},
  mate: { with: 'mate', msgs: [
    { d: '2025.11.02', t: '20:10', x: 'jövő heti meccsre jössz szurkolni?', me: 1 },
    { d: '2025.11.02', t: '20:12', x: 'persze ott leszek 🏀', them: 1 }
  ]},
  zoe: { with: 'zoe', msgs: [
    { d: '2025.10.28', t: '17:03', x: 'átküldöd a sulis jegyzetet? 🙏', them: 1 },
    { d: '2025.10.28', t: '17:20', x: 'küldöm este', me: 1 }
  ]}
};
const IG_DM_ORDER = ['lena', 'mate', 'zoe'];

/* =========================================================
   SNAPCHAT – itt történik a fordulat.
   Az idővonal több mint egy hetet ölel fel (11.03 → 11.16): a csaló
   előbb bizalmat épít (saját, lopott képeket küld, amiket Bálint elment),
   majd a kép megszerzése után azonnal zsarolásra vált.
   Az intim kép nem jelenik meg; a snap csak „Fotó · Megnyitva”, Léna
   oldalán „Képernyőkép készült” jelzéssel (ezért maradt meg nála).
   ========================================================= */
const SC_FRIENDS = [
  { k: 'lena', streak: 0, snapcode: 'LH', extort: true, chats: [
    { d: 'MENTETT', sys: '☆ Ez a beszélgetés Bálint mentései és a rendőrségnek átadott képernyőképek miatt maradt meg. A snapek egyébként megnyitás után eltűntek.' },
    { d: '2025.11.03', who: 'lena', x: 'sziaaa' },
    { d: '2025.11.04', who: 'lena', x: 'annyira könnyu veled beszelgetni, mintha reg ismernenk egymast', saved: 1 },
    { d: '2025.11.06', who: 'lena', img: 'lany1' },
    { d: '2025.11.08', who: 'lena', x: 'te vagy az egyetlen akivel ilyen oszinte tudok lenni 🙈', saved: 1 },
    { d: '2025.11.10', who: 'lena', img: 'lany2' },
    { d: '2025.11.12', who: 'lena', x: 'joo de ne mondd el senkinek, legyen a mi titkunk 🤫', saved: 1 },
    { d: '2025.11.13', who: 'lena', img: 'lany3' },
    { d: '2025.11.14', who: 'lena', x: 'na ezt a kepet figyu 😁', saved: 1 },
    { d: '2025.11.14', who: 'lena', x: 'de nem mentheted le!', saved: 1 },
    { d: '2025.11.14', who: 'lena', x: 'muti mar magadrol is valamit halo', saved: 1 },
    { d: '2025.11.15', snap: 'me' },
    { d: '2025.11.15', shot: 'lena' },
    { d: '2025.11.15', who: 'lena', x: 'megvan a képed, képernyőképet csináltam. most figyelj.', saved: 1 },
    { d: '2025.11.15', who: 'lena', x: 'ha nem küldesz 150 000 Ft-ot revolutra, elküldöm a képet MINDENKINEK.', saved: 1 },
    { d: '2025.11.15', who: 'lena', x: 'azoknak akiket követsz, akik követnek, facen minden ismerősödnek anyukáddal és apukáddal kezdve', saved: 1 },
    { d: '2025.11.15', who: 'lena', x: '12 órád van. ne teszteld hogy komolyan gondolom-e.', saved: 1 },
    { d: '2025.11.15', who: 'me', x: 'ezt komolyan gondolod?? kérlek ne szivass már', saved: 1 },
    { d: '2025.11.15', who: 'me', x: 'honnan szedjek én ennyi pénzt??', saved: 1 },
    { d: '2025.11.15', who: 'lena', x: 'oldd meg. a Revolut-tag: @lh••••2027 – utald most.', saved: 1 },
    { d: '2025.11.16', who: 'lena', x: 'lejárt a határidő. adok még időt, de csak ha fizetsz', saved: 1 }
  ]},
  { k: 'mate', streak: 64, snapcode: 'MK', chats: [
    { d: 'MA', snap: 'them', new: 1 }, { d: 'MA', who: 'mate', x: 'edzés 6kor?' }, { d: 'MA', who: 'me', x: 'ott vagyok ⚽' }
  ]},
  { k: 'dani', streak: 40, snapcode: 'DH', chats: [
    { d: 'TEGNAP', who: 'dani', x: 'meghallgatod az új demót? 🎧' }, { d: 'TEGNAP', who: 'me', x: 'küldd 🔥' }, { d: 'TEGNAP', snap: 'me' }
  ]},
  { k: 'gergo', streak: 21, snapcode: 'GN', chats: [
    { d: 'MA', who: 'gergo', x: 'meccs szombaton, jössz?' }, { d: 'MA', who: 'me', x: 'ott leszek 🏀' }
  ]},
  { k: 'peti', streak: 8, snapcode: 'PE', chats: [
    { d: '2 N', who: 'peti', x: 'holnap suli után foci?' }, { d: '2 N', who: 'me', x: 'ja 🟢' }
  ]},
  { k: 'zoe', streak: 15, snapcode: 'ZR', chats: [
    { d: '1 H', snap: 'them' }, { d: '1 H', who: 'zoe', x: 'köszi a jegyzetet 🙏' }
  ]}
];

/* ---------- Snap Map ---------- */
const SNAP_MAP = {
  places: [
    { name: 'Iskola', x: 180, y: 210, type: 'school' },
    { name: 'Sportpálya', x: 470, y: 150, type: 'park' },
    { name: 'Pláza', x: 300, y: 430, type: 'mall' },
    { name: 'Edzőterem', x: 150, y: 560, type: 'gym' }
  ],
  people: [
    { k: 'balint', me: 1, x: 250, y: 300, loc: 'Otthon · Budapest, XV. ker.', ago: 'most' },
    { k: 'mate', x: 470, y: 250, loc: 'Sportpálya', ago: '18 p', code: 'MK' },
    { k: 'gergo', x: 220, y: 200, loc: 'Iskola', ago: '2 ó', code: 'GN' },
    { k: 'dani', x: 340, y: 420, loc: 'Aréna Pláza', ago: '45 p', code: 'DH' },
    { k: 'peti', x: 160, y: 540, loc: 'Edzőterem', ago: '1 ó', code: 'PE' },
    { k: 'zoe', x: 520, y: 470, loc: 'Belváros', ago: '3 ó', code: 'ZR' },
    { k: 'lena', ghost: 1, x: 380, y: 320, loc: 'Helymegosztás kikapcsolva · külföldi IP', ago: 'ismeretlen', code: 'LH' }
  ]
};

/* =========================================================
   NYOMOZATI ESZKÖZÖK ADATAI
   ========================================================= */

/* 1) Fordított képkeresés – a profilkép lopott. */
const REVERSE = {
  target: 'Léna profilképe (lena.horvath_)',
  hits: [
    { name: '„Sophie”', handle: '@sophie.travels', where: 'Egyesült Királyság', note: 'ugyanez a fotó, más néven, 2 éve fent' },
    { name: '„Katie”', handle: '@katie_daily', where: 'Fülöp-szigetek', note: 'ugyanaz az arc, egy másik ismerkedős profilon' },
    { name: 'valós tulajdonos', handle: '(zárolt profil)', where: 'Kanada', note: 'az eredeti fotók tulajdonosa – évekkel korábbról' }
  ],
  concl: 'A profilkép nem „Lénáé” – lopott, máshonnan származó fotó. A profil mögött nem az a személy áll, aki a képen látszik.'
};

/* 2) Fiókelemzés – hamis, friss, külföldi fiók. */
const FAKEACCT = {
  handle: 'lena.horvath_',
  created: '2025.10.31.',
  firstContact: '2025.11.03.',
  posts: '3 (mind az elmúlt héten)',
  followers: '11 (nagyrészt inaktív / bot-jellegű fiókok)',
  mutuals: '0 közös ismerős Bálinttal',
  login: 'utolsó bejelentkezés külföldi IP-ről, VPN mögül (nem magyarországi)',
  // INTERAKTÍV: a diákok kikeresik a gyanújeleket. red:true = gyanús, red:false = önmagában ártalmatlan.
  facts: [
    { t: 'A fiók 3 nappal a megkeresés előtt jött létre', red: true },
    { t: 'Mindössze 11 követő, főleg inaktív / bot-fiókok', red: true },
    { t: '0 közös ismerős Bálinttal, semmi iskolához köthető', red: true },
    { t: 'Utolsó belépés külföldi IP-ről, VPN mögül', red: true },
    { t: 'Nincs megjelölt (tag-elt) fotó, nincs valós baráti kör', red: true },
    { t: 'A profil nyilvános', red: false, fb: 'Rengeteg valódi fiók is nyilvános – ez önmagában nem gyanújel.' },
    { t: 'A bemutatkozásban emoji van', red: false, fb: 'Ez teljesen hétköznapi – önmagában semmit nem árul el.' }
  ],
  concl: 'A fiók frissen, külföldről létrehozott álprofil – nem egy helyi, korabeli lányé.'
};

/* 3) Üzenetelemzés – INTERAKTÍV: párosítsd az üzenetet a csaló-trükkel. */
const CHATSCAN = {
  tactics: [
    { id: 'bizalom', t: 'Gyors bizalom (love-bombing)' },
    { id: 'app', t: 'Átterelés másik appra' },
    { id: 'titok', t: 'Titkolózásra biztatás' },
    { id: 'fenyeg', t: 'Fenyegetés / zsarolás' }
  ],
  items: [
    { msg: '„annyira könnyű veled beszélgetni, mintha rég ismernénk egymást”', a: 'bizalom' },
    { msg: '„insta helyett snapen vagyok, ott lazább – átjössz?”', a: 'app' },
    { msg: '„ne szólj a haveroknak, legyen a mi kis titkunk”', a: 'titok' },
    { msg: '„ha nem küldesz 150 000 Ft-ot, elküldöm a képet mindenkinek”', a: 'fenyeg' }
  ],
  concl: 'A beszélgetés betanult csaló-forgatókönyvet követ: bizalomépítés → titkolózás → a kép megszerzése → azonnali pénzkövetelés. Ugyanezek a mondatok több más bejelentett csalásban is szerepelnek – vagyis sablonszöveg.'
};

/* 4) Pénznyom – INTERAKTÍV: kövesd a pénz útját, majd vond le a következtetést. */
const PAYTRACE = {
  steps: [
    { t: 'A követelés', d: '150 000 Ft, „azonnal”, egy Revolut-tagra: @lh••••2027.' },
    { t: 'A tag mögött', d: 'nem egy magyar magánszemély áll – a fiók külföldi.' },
    { t: 'A pénz útja', d: 'a Revolut-tagról egy külföldi gyűjtőszámlára futott volna tovább.' },
    { t: 'Egyezés', d: 'ugyanez a tag több, más áldozat bejelentésében is szerepel.' }
  ],
  q: 'Mire utal, hogy ugyanaz a tag több áldozatnál is felbukkan, és a pénz külföldre megy?',
  opts: [
    { t: 'Egy magányos, helyi elkövető személyes bosszúja.', ok: false, fb: 'Egy helyi bosszúállónál nem futna a pénz külföldre, és nem szerepelne több más áldozat bejelentésében ugyanaz a tag.' },
    { t: 'Szervezett, külföldről működő csaló-hálózat.', ok: true, fb: 'Így van – a külföldi pénzcsatorna és a több áldozatnál azonos tag szervezett csalásra utal.' }
  ],
  concl: 'A pénzcsatorna külföldre vezet, és több áldozatnál azonos – ez szervezett csalás, nem egy helyi elkövető.'
};

/* Záró: csalás-adatbázis egyezés (4/4 nyom után). */
const FRAUD = {
  match: 'ismert nemzetközi pénzügyi szextortion-mintázat',
  victims: 'több tucat bejelentett eset, több országból',
  region: 'a hamis fiók és a pénzcsatorna külföldi, szervezett csoportra utal',
  concl: 'Az ügy nem egy megismerhető, helyi elkövetőhöz vezet, hanem egy külföldről működő, szervezett csaló-hálózat mintázatához. „Léna” sosem létezett.'
};

/* Döntési állomás – a helyes reakció. */
const REACT = [
  { q: 'Mit tegyen Bálint, amikor megérkezik a fenyegetés?',
    opts: [
      { t: 'Fizessen gyorsan, hogy vége legyen.', ok: false, fb: 'A fizetés nem állítja le a zsarolót – sőt jelzi, hogy fizető célpont, és szinte mindig újabb követelés jön.' },
      { t: 'Ne fizessen; készítsen képernyőképeket, tiltsa és jelentse a fiókot, és azonnal szóljon egy felnőttnek és a rendőrségnek.', ok: true, fb: 'Pontosan. Ne fizess, őrizd meg a bizonyítékot, tiltsd-jelentsd a fiókot, és kérj segítséget felnőttől és a rendőrségtől.' },
      { t: 'Törölje a saját fiókját, és tegyen úgy, mintha semmi sem történt volna.', ok: false, fb: 'A törléssel a bizonyíték is elveszik, a probléma viszont nem oldódik meg. Segítséget kell kérni.' }
    ] },
  { q: 'Kinek a hibája, ami történt?',
    opts: [
      { t: 'Bálinté, amiért küldött egy képet.', ok: false, fb: 'A manipuláció áldozatává válni nem szégyen és nem bűn. A felelősség a csalóé, aki szándékosan megtévesztette.' },
      { t: 'A csalóé, aki hamis profillal, tudatosan vezette félre.', ok: true, fb: 'Így van. A felelősség mindig az elkövetőé – az áldozatot nem hibáztatjuk.' }
    ] },
  { q: 'Mi segíthet, hogy a kép ne terjedjen?',
    opts: [
      { t: 'Semmi – ha egyszer elküldte, már mindegy.', ok: false, fb: 'De igen: a platformnak bejelentheted, és külön eszközök is segítenek a terjedés megállításában.' },
      { t: 'Bejelentés a platformnak, és a StopNCII / Take It Down eszköz; a rendőrség is segít.', ok: true, fb: 'Így van – ezek valódi segítséget adnak, és soha nem késő kérni.' }
    ] }
];
