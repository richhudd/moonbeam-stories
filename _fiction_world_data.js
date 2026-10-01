// V252.87 — embedded international world/business naming evidence pack for Fiction Studio.
// Purpose: give the model real geographic exemplars and deterministic institution/business
// naming methods instead of asking it to free-invent "plausible sounding" names.
// Britain: OS Open Names is the authoritative open gazetteer reference; regional samples below
// are real settlements chosen only as linguistic/geographic exemplars, not fictional claims.
// Business naming: use mundane founder/surname, real locality/street, or functional category
// patterns; Companies House is the canonical UK bulk-register reference when external research
// is later added. No live network dependency is required at generation time.

const sourceNotes={
  GB:'Ordnance Survey OS Open Names (open gazetteer; real settlements/roads/places in Great Britain)',
  UK_ADMIN:'ONS names/codes and UK statistical geography',
  UK_BUSINESS:'Companies House public register/bulk company data',
  WORLD:'GeoNames/national gazetteers and national statistical/geographic authorities where available'
};

const ukRegions={
  cambridgeshire_fens:{keys:['cambridgeshire','fenland','fens','march','ely','wisbech','peterborough'],places:['March','Ely','Wisbech','Whittlesey','Chatteris','Soham','Littleport','Waterbeach','Cottenham','Burwell','Ramsey','Yaxley','Sawtry','Thorney','Manea','Doddington','Witchford','Haddenham','St Ives','Huntingdon']},
  lincolnshire:{keys:['lincolnshire','lincoln','boston','spalding','skegness','the wash'],places:['Lincoln','Boston','Spalding','Grantham','Sleaford','Stamford','Louth','Horncastle','Gainsborough','Market Rasen','Holbeach','Long Sutton','Crowland','Pinchbeck','Donington','Bourne','Wainfleet All Saints','Alford','Caistor','Woodhall Spa']},
  cornwall:{keys:['cornwall','cornish','truro','falmouth','penzance'],places:['Truro','Falmouth','Penzance','Helston','Redruth','Camborne','St Austell','Bodmin','Liskeard','Launceston','Newquay','Padstow','St Ives','Hayle','Perranporth','Mevagissey','Lostwithiel','Callington','Torpoint','Wadebridge']},
  north_east:{keys:['northumberland','newcastle','tyne','durham','north east','northeast','sunderland','teesside'],places:['Newcastle upon Tyne','Gateshead','Sunderland','Durham','Morpeth','Alnwick','Hexham','Blyth','Ashington','Berwick-upon-Tweed','Seaham','Chester-le-Street','Bishop Auckland','Barnard Castle','Consett','Stanley','Corbridge','Ponteland','Amble','Wooler']},
  yorkshire:{keys:['yorkshire','york','leeds','sheffield','hull','bradford'],places:['York','Leeds','Sheffield','Bradford','Wakefield','Harrogate','Ripon','Skipton','Ilkley','Keighley','Halifax','Huddersfield','Pontefract','Selby','Malton','Pickering','Whitby','Scarborough','Beverley','Hawes']},
  lancashire_nw:{keys:['lancashire','manchester','merseyside','liverpool','cheshire','north west','northwest'],places:['Manchester','Liverpool','Preston','Lancaster','Blackpool','Burnley','Accrington','Clitheroe','Ormskirk','Chorley','Leyland','Garstang','Kirkham','Wigan','Bolton','Bury','Rochdale','Altrincham','Knutsford','Macclesfield']},
  west_midlands:{keys:['west midlands','birmingham','warwickshire','staffordshire','worcestershire'],places:['Birmingham','Coventry','Wolverhampton','Solihull','Sutton Coldfield','Warwick','Leamington Spa','Stratford-upon-Avon','Nuneaton','Rugby','Stafford','Lichfield','Tamworth','Kidderminster','Worcester','Bromsgrove','Redditch','Dudley','Walsall','Stourbridge']},
  south_west:{keys:['devon','dorset','somerset','bristol','south west','southwest'],places:['Bristol','Bath','Exeter','Plymouth','Torquay','Totnes','Tiverton','Crediton','Barnstaple','Bideford','Taunton','Bridgwater','Frome','Wells','Yeovil','Dorchester','Weymouth','Bridport','Shaftesbury','Sherborne']},
  south_east:{keys:['kent','sussex','surrey','hampshire','south east','southeast','thames estuary'],places:['Canterbury','Maidstone','Tunbridge Wells','Sevenoaks','Folkestone','Dover','Ashford','Chatham','Guildford','Woking','Reigate','Dorking','Horsham','Chichester','Lewes','Eastbourne','Hastings','Winchester','Romsey','Petersfield']},
  east_anglia:{keys:['norfolk','suffolk','east anglia','norwich','ipswich'],places:['Norwich','Ipswich','King’s Lynn','Great Yarmouth','Thetford','Dereham','Fakenham','Cromer','North Walsham','Diss','Bury St Edmunds','Lowestoft','Felixstowe','Woodbridge','Aldeburgh','Sudbury','Stowmarket','Halesworth','Beccles','Saxmundham']},
  london:{keys:['london','maida vale','camden','hackney','islington','westminster'],places:['London','Maida Vale','Paddington','Camden Town','Kentish Town','Hampstead','Islington','Hackney','Dalston','Clapham','Brixton','Peckham','Greenwich','Lewisham','Fulham','Hammersmith','Ealing','Acton','Walthamstow','Tottenham']},
  wales:{keys:['wales','welsh','cardiff','swansea','gwynedd','anglesey','ceredigion'],places:['Cardiff','Swansea','Newport','Bangor','Caernarfon','Holyhead','Llandudno','Conwy','Mold','Wrexham','Aberystwyth','Cardigan','Carmarthen','Tenby','Brecon','Abergavenny','Machynlleth','Dolgellau','Barmouth','Pwllheli']},
  scotland:{keys:['scotland','scottish','glasgow','edinburgh','highlands','aberdeen'],places:['Edinburgh','Glasgow','Aberdeen','Dundee','Perth','Stirling','Inverness','Ayr','Dumfries','Oban','Fort William','Pitlochry','Dunfermline','Kirkcaldy','Falkirk','Elgin','Forres','Stonehaven','Montrose','Peebles']}
};

const localeProfiles={
  'en-GB':{country:'United Kingdom',examples:['London','Birmingham','Manchester','Leeds','Glasgow','Liverpool','Edinburgh','Bristol','Cardiff','Belfast','Norwich','Exeter','York','Oxford','Cambridge']},
  'en-US':{country:'United States',examples:['New York','Chicago','Los Angeles','Philadelphia','Boston','Seattle','Portland','Denver','Atlanta','Baltimore','Pittsburgh','Cleveland','Minneapolis','Austin','Savannah']},
  'en-CA':{country:'Canada',examples:['Toronto','Montreal','Vancouver','Calgary','Ottawa','Halifax','Winnipeg','Victoria','Hamilton','Kingston','Saskatoon','Regina','Moncton','Kelowna','Guelph']},
  'en-AU':{country:'Australia',examples:['Sydney','Melbourne','Brisbane','Perth','Adelaide','Hobart','Canberra','Darwin','Geelong','Ballarat','Bendigo','Newcastle','Wollongong','Cairns','Toowoomba']},
  'es-ES':{country:'Spain',examples:['Madrid','Barcelona','Valencia','Sevilla','Zaragoza','Málaga','Murcia','Bilbao','Alicante','Córdoba','Valladolid','Vigo','Gijón','Granada','Salamanca']},
  'es-419':{country:'Latin America (country must be established before naming)',examples:['Ciudad de México','Guadalajara','Monterrey','Bogotá','Medellín','Buenos Aires','Córdoba','Rosario','Santiago','Valparaíso','Lima','Arequipa','Quito','Guayaquil','Montevideo']},
  'fr-FR':{country:'France',examples:['Paris','Marseille','Lyon','Toulouse','Nice','Nantes','Strasbourg','Bordeaux','Lille','Rennes','Rouen','Dijon','Tours','Angers','Avignon']},
  'de-DE':{country:'Germany',examples:['Berlin','Hamburg','München','Köln','Frankfurt am Main','Leipzig','Dresden','Bremen','Hannover','Nürnberg','Freiburg im Breisgau','Heidelberg','Kiel','Lübeck','Bamberg']},
  'it-IT':{country:'Italy',examples:['Roma','Milano','Napoli','Torino','Bologna','Firenze','Genova','Palermo','Verona','Bari','Parma','Perugia','Siena','Ravenna','Trieste']},
  'pt-PT':{country:'Portugal',examples:['Lisboa','Porto','Braga','Coimbra','Aveiro','Faro','Évora','Setúbal','Viseu','Guimarães','Leiria','Bragança','Beja','Tavira','Sintra']},
  'pt-BR':{country:'Brazil',examples:['São Paulo','Rio de Janeiro','Belo Horizonte','Salvador','Recife','Fortaleza','Brasília','Curitiba','Porto Alegre','Belém','Campinas','Goiânia','Niterói','Florianópolis','Santos']},
  'nl-NL':{country:'Netherlands',examples:['Amsterdam','Rotterdam','Den Haag','Utrecht','Eindhoven','Groningen','Maastricht','Leiden','Delft','Haarlem','Arnhem','Nijmegen','Zwolle','Breda','Amersfoort']},
  'da-DK':{country:'Denmark',examples:['København','Aarhus','Odense','Aalborg','Esbjerg','Roskilde','Helsingør','Vejle','Randers','Kolding','Horsens','Viborg','Herning','Svendborg','Silkeborg']},
  'nb-NO':{country:'Norway',examples:['Oslo','Bergen','Trondheim','Stavanger','Tromsø','Kristiansand','Drammen','Ålesund','Bodø','Hamar','Lillehammer','Fredrikstad','Tønsberg','Skien','Molde']},
  'sv-SE':{country:'Sweden',examples:['Stockholm','Göteborg','Malmö','Uppsala','Västerås','Örebro','Linköping','Lund','Umeå','Gävle','Visby','Kalmar','Karlstad','Helsingborg','Norrköping']},
  'fi-FI':{country:'Finland',examples:['Helsinki','Espoo','Tampere','Turku','Oulu','Jyväskylä','Kuopio','Lahti','Vaasa','Porvoo','Joensuu','Lappeenranta','Hämeenlinna','Rovaniemi','Savonlinna']},
  'is-IS':{country:'Iceland',examples:['Reykjavík','Kópavogur','Hafnarfjörður','Akureyri','Reykjanesbær','Garðabær','Mosfellsbær','Akranes','Selfoss','Ísafjörður','Húsavík','Egilsstaðir']},
  'ga-IE':{country:'Ireland',examples:['Dublin','Cork','Limerick','Galway','Waterford','Kilkenny','Sligo','Drogheda','Dundalk','Athlone','Wexford','Ennis','Tralee','Killarney','Letterkenny']},
  'pl-PL':{country:'Poland',examples:['Warszawa','Kraków','Łódź','Wrocław','Poznań','Gdańsk','Szczecin','Lublin','Katowice','Białystok','Toruń','Opole','Rzeszów','Olsztyn','Gdynia']},
  'cs-CZ':{country:'Czechia',examples:['Praha','Brno','Ostrava','Plzeň','Olomouc','Liberec','České Budějovice','Hradec Králové','Pardubice','Zlín','Jihlava','Tábor','Kladno','Karlovy Vary','Český Krumlov']},
  'he-IL':{country:'Israel',examples:['ירושלים','תל אביב-יפו','חיפה','באר שבע','ראשון לציון','פתח תקווה','נתניה','אשדוד','רחובות','הרצליה','כפר סבא','עכו','טבריה','נצרת','אילת']},
  'tr-TR':{country:'Türkiye',examples:['İstanbul','Ankara','İzmir','Bursa','Antalya','Adana','Konya','Gaziantep','Eskişehir','Samsun','Trabzon','Kayseri','Mersin','Edirne','Bodrum']},
  'ja-JP':{country:'Japan',examples:['東京','大阪','京都','横浜','名古屋','札幌','福岡','神戸','仙台','広島','金沢','長崎','奈良','高松','松本']},
  'ko-KR':{country:'South Korea',examples:['서울','부산','인천','대구','대전','광주','울산','수원','전주','춘천','청주','제주','포항','경주','여수']},
  'zh-CN':{country:'China',examples:['北京','上海','广州','深圳','成都','重庆','武汉','西安','南京','杭州','苏州','青岛','天津','昆明','厦门']},
  'zh-TW':{country:'Taiwan',examples:['臺北','新北','桃園','臺中','臺南','高雄','基隆','新竹','嘉義','宜蘭','花蓮','臺東','彰化','南投','屏東']},
  'hi-IN':{country:'India (region/language/community must be established before naming)',examples:['दिल्ली','मुंबई','कोलकाता','चेन्नई','बेंगलुरु','हैदराबाद','पुणे','लखनऊ','जयपुर','भोपाल','अहमदाबाद','वाराणसी','चंडीगढ़','कोच्चि','गुवाहाटी']}
};

// Additional supported Fiction Studio locales. These are real national/regional anchors, not invented names.
Object.assign(localeProfiles,{
  'af-ZA':{country:'South Africa',examples:['Cape Town','Johannesburg','Pretoria','Stellenbosch','Paarl','Bloemfontein','George','Worcester','Kimberley','Gqeberha']},
  'cy-GB':{country:'Wales, United Kingdom',examples:['Cardiff','Swansea','Bangor','Caernarfon','Aberystwyth','Carmarthen','Wrexham','Conwy','Holyhead','Machynlleth']},
  'ca-ES':{country:'Catalonia, Spain',examples:['Barcelona','Girona','Lleida','Tarragona','Vic','Manresa','Reus','Figueres','Olot','Sitges']},
  'gl-ES':{country:'Galicia, Spain',examples:['A Coruña','Vigo','Santiago de Compostela','Lugo','Ourense','Pontevedra','Ferrol','Vilagarcía de Arousa','Ribeira','Monforte de Lemos']},
  'eu-ES':{country:'Basque Country, Spain',examples:['Bilbao','Donostia / San Sebastián','Vitoria-Gasteiz','Getxo','Irun','Eibar','Durango','Tolosa','Gernika-Lumo','Zarautz']},
  'sk-SK':{country:'Slovakia',examples:['Bratislava','Košice','Prešov','Žilina','Nitra','Banská Bystrica','Trnava','Trenčín','Poprad','Martin']},
  'sl-SI':{country:'Slovenia',examples:['Ljubljana','Maribor','Celje','Kranj','Koper','Novo Mesto','Ptuj','Velenje','Nova Gorica','Škofja Loka']},
  'hr-HR':{country:'Croatia',examples:['Zagreb','Split','Rijeka','Osijek','Zadar','Pula','Šibenik','Varaždin','Dubrovnik','Karlovac']},
  'sr-RS':{country:'Serbia',examples:['Beograd','Novi Sad','Niš','Kragujevac','Subotica','Čačak','Kraljevo','Zrenjanin','Pančevo','Užice']},
  'bs-BA':{country:'Bosnia and Herzegovina',examples:['Sarajevo','Banja Luka','Mostar','Tuzla','Zenica','Bihać','Brčko','Travnik','Trebinje','Doboj']},
  'bg-BG':{country:'Bulgaria',examples:['София','Пловдив','Варна','Бургас','Русе','Стара Загора','Плевен','Велико Търново','Благоевград','Шумен']},
  'ro-RO':{country:'Romania',examples:['București','Cluj-Napoca','Timișoara','Iași','Brașov','Constanța','Sibiu','Oradea','Craiova','Sighișoara']},
  'hu-HU':{country:'Hungary',examples:['Budapest','Debrecen','Szeged','Miskolc','Pécs','Győr','Kecskemét','Eger','Sopron','Székesfehérvár']},
  'el-GR':{country:'Greece',examples:['Αθήνα','Θεσσαλονίκη','Πάτρα','Ηράκλειο','Λάρισα','Βόλος','Ιωάννινα','Χανιά','Καβάλα','Ναύπλιο']},
  'sq-AL':{country:'Albania',examples:['Tiranë','Durrës','Vlorë','Shkodër','Elbasan','Korçë','Berat','Gjirokastër','Fier','Sarandë']},
  'lt-LT':{country:'Lithuania',examples:['Vilnius','Kaunas','Klaipėda','Šiauliai','Panevėžys','Alytus','Marijampolė','Kėdainiai','Telšiai','Trakai']},
  'lv-LV':{country:'Latvia',examples:['Rīga','Daugavpils','Liepāja','Jelgava','Jūrmala','Ventspils','Rēzekne','Cēsis','Valmiera','Kuldīga']},
  'et-EE':{country:'Estonia',examples:['Tallinn','Tartu','Narva','Pärnu','Kohtla-Järve','Viljandi','Rakvere','Kuressaare','Võru','Haapsalu']},
  'uk-UA':{country:'Ukraine',examples:['Київ','Львів','Одеса','Харків','Дніпро','Запоріжжя','Чернівці','Івано-Франківськ','Ужгород','Полтава']},
  'ru-RU':{country:'Russia',examples:['Москва','Санкт-Петербург','Казань','Екатеринбург','Новосибирск','Самара','Нижний Новгород','Псков','Ярославль','Владивосток']},
  'ka-GE':{country:'Georgia',examples:['თბილისი','ბათუმი','ქუთაისი','რუსთავი','გორი','ზუგდიდი','თელავი','მცხეთა','ფოთი','ახალციხე']},
  'hy-AM':{country:'Armenia',examples:['Երևան','Գյումրի','Վանաձոր','Վաղարշապատ','Հրազդան','Աբովյան','Կապան','Գորիս','Դիլիջան','Սևան']},
  'ar':{country:'Arabic-language setting (country must be established before naming)',examples:['القاهرة','الإسكندرية','بيروت','عمّان','دمشق','الرياض','جدة','مسقط','الدوحة','تونس']},
  'fa-IR':{country:'Iran',examples:['تهران','مشهد','اصفهان','شیراز','تبریز','قم','رشت','اهواز','کرمان','یزد']},
  'ur-PK':{country:'Pakistan',examples:['کراچی','لاہور','اسلام آباد','راولپنڈی','پشاور','کوئٹہ','ملتان','فیصل آباد','حیدرآباد','سیالکوٹ']},
  'bn-BD':{country:'Bangladesh',examples:['ঢাকা','চট্টগ্রাম','খুলনা','রাজশাহী','সিলেট','বরিশাল','রংপুর','কুমিল্লা','ময়মনসিংহ','বগুড়া']},
  'pa-IN':{country:'Punjabi-language setting (country must be established before naming)',examples:['ਅੰਮ੍ਰਿਤਸਰ','ਲੁਧਿਆਣਾ','ਜਲੰਧਰ','ਪਟਿਆਲਾ','ਬਠਿੰਡਾ','ਮੋਹਾਲੀ','ਚੰਡੀਗੜ੍ਹ','ਗੁਰਦਾਸਪੁਰ']},
  'gu-IN':{country:'Gujarat, India',examples:['અમદાવાદ','સુરત','વડોદરા','રાજકોટ','ભાવનગર','જામનગર','જૂનાગઢ','ગાંધીનગર','આણંદ','ભુજ']},
  'mr-IN':{country:'Maharashtra, India',examples:['मुंबई','पुणे','नागपूर','नाशिक','कोल्हापूर','औरंगाबाद','ठाणे','सोलापूर','सातारा','रत्नागिरी']},
  'ta-IN':{country:'Tamil-language setting (country must be established before naming)',examples:['சென்னை','கோயம்புத்தூர்','மதுரை','திருச்சிராப்பள்ளி','சேலம்','திருநெல்வேலி','தஞ்சாவூர்','வேலூர்','ஈரோடு','தூத்துக்குடி']},
  'te-IN':{country:'Telugu-language setting, India',examples:['హైదరాబాద్','విశాఖపట్నం','విజయవాడ','గుంటూరు','తిరుపతి','నెల్లూరు','వరంగల్','రాజమండ్రి','కాకినాడ','కర్నూలు']},
  'kn-IN':{country:'Karnataka, India',examples:['ಬೆಂಗಳೂರು','ಮೈಸೂರು','ಮಂಗಳೂರು','ಹುಬ್ಬಳ್ಳಿ','ಬೆಳಗಾವಿ','ಶಿವಮೊಗ್ಗ','ಉಡುಪಿ','ತುಮಕೂರು','ಹಾಸನ','ಬಳ್ಳಾರಿ']},
  'ml-IN':{country:'Kerala, India',examples:['തിരുവനന്തപുരം','കൊച്ചി','കോഴിക്കോട്','തൃശ്ശൂർ','കൊല്ലം','കണ്ണൂർ','ആലപ്പുഴ','കോട്ടയം','പാലക്കാട്','കാസർഗോഡ്']},
  'id-ID':{country:'Indonesia',examples:['Jakarta','Surabaya','Bandung','Medan','Semarang','Yogyakarta','Makassar','Malang','Denpasar','Solo']},
  'ms-MY':{country:'Malaysia',examples:['Kuala Lumpur','George Town','Johor Bahru','Ipoh','Kota Kinabalu','Kuching','Shah Alam','Malacca City','Alor Setar','Kuala Terengganu']},
  'vi-VN':{country:'Vietnam',examples:['Hà Nội','Thành phố Hồ Chí Minh','Đà Nẵng','Hải Phòng','Huế','Cần Thơ','Đà Lạt','Nha Trang','Vinh','Hội An']},
  'th-TH':{country:'Thailand',examples:['กรุงเทพมหานคร','เชียงใหม่','ภูเก็ต','ขอนแก่น','นครราชสีมา','เชียงราย','สงขลา','อุดรธานี','พิษณุโลก','สุราษฎร์ธานี']},
  'fil-PH':{country:'Philippines',examples:['Manila','Quezon City','Cebu City','Davao City','Baguio','Iloilo City','Bacolod','Cagayan de Oro','Vigan','Tagaytay']}
});

const organisationFamilies={
  ANGLO:{
    registry:'Use national/company-register conventions and ordinary local directories as the reference pattern.',
    business:['[Surname] + trade/service','[Surname] & [Surname] + profession','[real locality/street] + trade/service','plain functional/historical trading name'],
    institutions:['[real locality] + School/College/Practice/Centre','historic dedication/name only where locally normal','public bodies use actual national/local institutional forms'],
    avoid:['lyrical adjective+noun brands','coordinated quaint names across unrelated organisations','automatic Fox/Crown/Willow/Raven/Silver/Old Mill defaults']
  },
  NORDIC:{
    registry:'Use the country’s normal company forms and real locality/surname patterns; keep branding restrained.',
    business:['[Surname] + trade','[real locality] + trade','short ordinary descriptive brand','legal form only when naturally part of the public name'],
    institutions:['[real locality] + skole/skola/sjukhus/sykehus/kommune-equivalent as locally appropriate','founder/family names only where culturally ordinary'],
    avoid:['translated English pub/cozy naming','ornamental pseudo-Norse compounds','English adjective+noun branding by default']
  },
  GERMANIC:{
    registry:'Use ordinary surname/locality/sector naming and the country-appropriate legal form where relevant.',
    business:['[Surname] + trade/profession','[Surname] & Partner/partner-equivalent where normal','[real locality] + sector','plain descriptive compound actually plausible in the language'],
    institutions:['[real locality] + school/clinic/municipal form in local language','historic personal/dedication names only where ordinary'],
    avoid:['English-style atmospheric brands','fake medieval compounds','gratuitous alliteration']
  },
  ROMANCE:{
    registry:'Use local-language founder/family, locality and sector conventions; respect country-specific legal forms.',
    business:['[Surname/family] + trade/profession','[real locality/street] + trade/service','plain local-language descriptor','traditional family/business form where regionally normal'],
    institutions:['[real locality/person] + school/clinic/cultural institution form in local language','municipal/regional names follow actual administrative conventions'],
    avoid:['literal translations of English cozy/gothic names','ornamental adjective+noun pairings without local precedent','invented pseudo-aristocratic surnames']
  },
  SLAVIC_BALTIC:{
    registry:'Use local surname/place/sector patterns and local company forms; morphology and grammatical agreement must be native.',
    business:['[Surname/family] + trade','[real locality] + sector','plain native-language descriptive name','short acronym only where locally typical'],
    institutions:['[real locality/person] + school/clinic/municipal form in local language'],
    avoid:['Anglicised branding by default','fake Slavic suffixes','decorative folklore words unless genuinely justified']
  },
  MENA_HEBREW:{
    registry:'Use actual local naming traditions, scripts/transliteration and legal/business forms; family/community context outranks manuscript language.',
    business:['founder/family name + trade/profession','real locality/neighbourhood + service','plain functional local-language name'],
    institutions:['real locality/person + school/clinic/community institution form used in the country'],
    avoid:['English corporate-sounding names by default','mixing scripts or naming traditions without a story reason','generic Biblical/Orientalist ornament']
  },
  SOUTH_ASIA:{
    registry:'Country, region, language, religion/community and family background must be established before naming; do not treat South Asia as one naming pool.',
    business:['family/founder + trade','real locality + service','ordinary English/local-language hybrid only where genuinely common','local legal form where relevant'],
    institutions:['real locality/person + school/hospital/college form typical of that country/region'],
    avoid:['random pan-Indian names','mismatched religion/caste/language surname patterns','ornamental Sanskrit/Urdu words used only to sound exotic']
  },
  EAST_ASIA:{
    registry:'Use native order, script, locality and corporate/institutional forms appropriate to the country; romanisation follows local convention.',
    business:['founder/family where culturally typical','real locality + sector','ordinary descriptive native-language brand','country-standard corporate form when naturally used'],
    institutions:['real locality/person + school/hospital/university/local-government form in local language'],
    avoid:['English adjective+noun brands by default','cross-country name mixing','anime/K-drama-style stylisation unless genre/setting requires it']
  },
  SE_ASIA:{
    registry:'Use country-specific personal, locality and company naming; account for multilingual commercial naming where it is genuinely normal.',
    business:['founder/family + trade','real locality + service','plain native-language or established bilingual descriptor'],
    institutions:['real locality/person + school/clinic/public-body form in local language'],
    avoid:['generic pan-Asian names','unmotivated English luxury words','mixing naming systems from neighbouring countries']
  }
};

const localeOrganisationProfiles={
  'en-GB':{family:'ANGLO',legal:['Ltd','Limited','LLP','plc'],note:'UK: Companies House naming/legal-form conventions; founder surnames, real localities and functional trade names are common anchors.'},
  'en-US':{family:'ANGLO',legal:['LLC','Inc.','Corp.','LLP'],note:'US: state-specific legal forms; surnames, locality/street names and descriptive trade names are common.'},
  'en-CA':{family:'ANGLO',legal:['Ltd.','Inc.','Corp.'],note:'Canada: province/federal context can matter; English/French forms may coexist depending on region.'},
  'en-AU':{family:'ANGLO',legal:['Pty Ltd','Ltd'],note:'Australia: ordinary surname/locality/service constructions; avoid faux-British quaintness unless locally evidenced.'},
  'ga-IE':{family:'ANGLO',legal:['Ltd','DAC','CLG'],note:'Ireland: use Irish/English naming according to actual locality/community; do not force Gaelicisation.'},
  'cy-GB':{family:'ANGLO',legal:['Ltd','Cyf'],note:'Wales: Welsh/English bilingual forms depend on real local usage; place names must preserve Welsh orthography.'},
  'af-ZA':{family:'ANGLO',legal:['(Pty) Ltd','Ltd'],note:'South Africa: region/community/language must be established; Afrikaans is not a cue to ignore multilingual reality.'},
  'nb-NO':{family:'NORDIC',legal:['AS','ASA','ENK'],note:'Norway: ordinary surname/locality + trade patterns; municipality and institution names should use Norwegian forms.'},
  'sv-SE':{family:'NORDIC',legal:['AB','HB'],note:'Sweden: restrained locality/surname/sector naming; public institutions use Swedish forms.'},
  'da-DK':{family:'NORDIC',legal:['ApS','A/S','I/S'],note:'Denmark: use Danish locality/surname and sector conventions.'},
  'fi-FI':{family:'NORDIC',legal:['Oy','Oyj','Ky'],note:'Finland: Finnish/Swedish linguistic context can matter; do not mix forms casually.'},
  'is-IS':{family:'NORDIC',legal:['ehf.','hf.'],note:'Iceland: patronymic/matronymic personal naming differs from inherited surnames; business names need not mimic family-name systems.'},
  'de-DE':{family:'GERMANIC',legal:['GmbH','AG','KG','UG'],note:'Germany: surname/locality/sector compounds and legal forms should be idiomatic German, not translated English branding.'},
  'nl-NL':{family:'GERMANIC',legal:['B.V.','N.V.','V.O.F.'],note:'Netherlands: Dutch locality/surname/sector naming; avoid English branding unless the business context supports it.'},
  'fr-FR':{family:'ROMANCE',legal:['SARL','SAS','SA','EURL'],note:'France: French founder/locality/sector forms; institutions use actual French administrative and professional terms.'},
  'es-ES':{family:'ROMANCE',legal:['S.L.','S.A.','S.L.U.'],note:'Spain: region matters (Spanish/Catalan/Basque/Galician naming); do not treat all Spain as Castilian-only.'},
  'es-419':{family:'ROMANCE',legal:['S.A.','S.R.L.','S.A.S.'],note:'Latin America: country must be established before naming; legal forms and naming differ materially by country.'},
  'ca-ES':{family:'ROMANCE',legal:['S.L.','S.A.'],note:'Catalonia: use Catalan/Spanish forms according to locality and institution; preserve Catalan place-name conventions.'},
  'gl-ES':{family:'ROMANCE',legal:['S.L.','S.A.'],note:'Galicia: use Galician/Spanish forms according to locality; preserve Galician toponymy.'},
  'eu-ES':{family:'ROMANCE',legal:['S.L.','S.A.'],note:'Basque Country: Basque/Spanish bilingual reality and Basque toponymy require local consistency.'},
  'it-IT':{family:'ROMANCE',legal:['S.r.l.','S.p.A.','S.n.c.'],note:'Italy: family/locality/sector naming with strong regional variation; avoid pseudo-Tuscan ornament outside context.'},
  'pt-PT':{family:'ROMANCE',legal:['Lda.','S.A.','Unipessoal Lda.'],note:'Portugal: Portuguese locality/family/sector naming.'},
  'pt-BR':{family:'ROMANCE',legal:['Ltda.','S.A.','ME'],note:'Brazil: Brazilian Portuguese conventions; region/community matters and should not be imported from Portugal.'},
  'pl-PL':{family:'SLAVIC_BALTIC',legal:['sp. z o.o.','S.A.','sp.j.'],note:'Poland: Polish grammatical/morphological forms and diacritics; do not invent pseudo-Slavic brands.'},
  'cs-CZ':{family:'SLAVIC_BALTIC',legal:['s.r.o.','a.s.'],note:'Czechia: Czech locality/surname/sector forms and diacritics.'},
  'sk-SK':{family:'SLAVIC_BALTIC',legal:['s.r.o.','a.s.'],note:'Slovakia: Slovak naming and diacritics; do not substitute Czech forms casually.'},
  'sl-SI':{family:'SLAVIC_BALTIC',legal:['d.o.o.','d.d.'],note:'Slovenia: Slovenian locality/surname/sector naming.'},
  'hr-HR':{family:'SLAVIC_BALTIC',legal:['d.o.o.','d.d.'],note:'Croatia: Croatian forms and diacritics.'},
  'sr-RS':{family:'SLAVIC_BALTIC',legal:['d.o.o.','a.d.'],note:'Serbia: Serbian Cyrillic/Latin choice follows setting and context.'},
  'bs-BA':{family:'SLAVIC_BALTIC',legal:['d.o.o.','d.d.'],note:'Bosnia and Herzegovina: Bosnian/Croatian/Serbian community context must be established rather than guessed.'},
  'bg-BG':{family:'SLAVIC_BALTIC',legal:['ООД','АД','ЕООД'],note:'Bulgaria: Bulgarian Cyrillic forms; transliteration only when context calls for it.'},
  'ro-RO':{family:'ROMANCE',legal:['SRL','SA'],note:'Romania: Romanian locality/surname/sector naming and diacritics.'},
  'hu-HU':{family:'SLAVIC_BALTIC',legal:['Kft.','Zrt.','Bt.'],note:'Hungary: Hungarian name order and language conventions are distinct; do not pseudo-Slavicise.'},
  'el-GR':{family:'ROMANCE',legal:['ΙΚΕ','ΑΕ','ΕΠΕ'],note:'Greece: Greek script/naming and local forms; transliteration only as context requires.'},
  'sq-AL':{family:'SLAVIC_BALTIC',legal:['sh.p.k.','sh.a.'],note:'Albania: Albanian locality/family/sector naming.'},
  'lt-LT':{family:'SLAVIC_BALTIC',legal:['UAB','AB'],note:'Lithuania: Lithuanian morphology and diacritics.'},
  'lv-LV':{family:'SLAVIC_BALTIC',legal:['SIA','AS'],note:'Latvia: Latvian morphology and diacritics.'},
  'et-EE':{family:'SLAVIC_BALTIC',legal:['OÜ','AS'],note:'Estonia: Estonian locality/sector naming; do not treat as Slavic linguistically.'},
  'uk-UA':{family:'SLAVIC_BALTIC',legal:['ТОВ','АТ'],note:'Ukraine: Ukrainian forms and Cyrillic; avoid Russian substitution unless story context requires it.'},
  'ru-RU':{family:'SLAVIC_BALTIC',legal:['ООО','АО'],note:'Russia: Russian forms and Cyrillic; regional/non-Russian communities need their own context.'},
  'tr-TR':{family:'MENA_HEBREW',legal:['Ltd. Şti.','A.Ş.'],note:'Türkiye: Turkish locality/surname/sector naming and dotted/dotless-I orthography.'},
  'ka-GE':{family:'MENA_HEBREW',legal:['შპს','სს'],note:'Georgia: Georgian script and local naming; transliteration should be consistent.'},
  'hy-AM':{family:'MENA_HEBREW',legal:['ՍՊԸ','ԲԲԸ'],note:'Armenia: Armenian script and local family/business naming.'},
  'he-IL':{family:'MENA_HEBREW',legal:['בע״מ'],note:'Israel: Hebrew/Arabic/English coexistence depends on community and sector; do not infer ethnicity from manuscript language alone.'},
  'ar':{family:'MENA_HEBREW',legal:['LLC-equivalent varies by country','شركة'],note:'Arabic: country is mandatory before naming; Gulf, Levant, Egypt, Maghreb etc. are not interchangeable.'},
  'fa-IR':{family:'MENA_HEBREW',legal:['شرکت با مسئولیت محدود','سهامی خاص'],note:'Iran: Persian script and Iranian business/institution forms.'},
  'hi-IN':{family:'SOUTH_ASIA',legal:['Private Limited','Ltd','LLP'],note:'India: state, language, religion/community and urban/rural context must be established before names are chosen.'},
  'ur-PK':{family:'SOUTH_ASIA',legal:['(Pvt.) Ltd.','Ltd.'],note:'Pakistan: Urdu/English and regional-language context matters; community/family naming must remain coherent.'},
  'bn-BD':{family:'SOUTH_ASIA',legal:['Ltd.','PLC'],note:'Bangladesh: Bengali/English commercial naming varies by sector; use Bangladeshi rather than generic South Asian patterns.'},
  'pa-IN':{family:'SOUTH_ASIA',legal:['Private Limited','Ltd'],note:'Punjabi: establish Indian/Pakistani side, script, religion/community and region before naming.'},
  'gu-IN':{family:'SOUTH_ASIA',legal:['Private Limited','Ltd'],note:'Gujarati: Gujarat/community context and Indian legal forms.'},
  'mr-IN':{family:'SOUTH_ASIA',legal:['Private Limited','Ltd'],note:'Marathi: Maharashtra/local language context.'},
  'ta-IN':{family:'SOUTH_ASIA',legal:['Private Limited','Ltd'],note:'Tamil: establish India/Sri Lanka/other setting before naming; Tamil community context matters.'},
  'te-IN':{family:'SOUTH_ASIA',legal:['Private Limited','Ltd'],note:'Telugu: Andhra Pradesh/Telangana context matters.'},
  'kn-IN':{family:'SOUTH_ASIA',legal:['Private Limited','Ltd'],note:'Kannada: Karnataka context.'},
  'ml-IN':{family:'SOUTH_ASIA',legal:['Private Limited','Ltd'],note:'Malayalam: Kerala context.'},
  'ja-JP':{family:'EAST_ASIA',legal:['株式会社','合同会社'],note:'Japan: Japanese corporate/institutional forms and address/locality logic; avoid faux-traditional names unless evidenced.'},
  'ko-KR':{family:'EAST_ASIA',legal:['주식회사','유한회사'],note:'South Korea: Korean naming/order and Hangul; English branding only where sector/context supports it.'},
  'zh-CN':{family:'EAST_ASIA',legal:['有限公司','股份有限公司'],note:'China: province/city context matters; Chinese locality/sector/corporate forms, not generic East Asian naming.'},
  'zh-TW':{family:'EAST_ASIA',legal:['有限公司','股份有限公司'],note:'Taiwan: Traditional Chinese forms and Taiwanese locality/corporate conventions.'},
  'id-ID':{family:'SE_ASIA',legal:['PT','CV'],note:'Indonesia: region, religion/community and local language matter; Indonesian commercial naming often differs from personal naming.'},
  'ms-MY':{family:'SE_ASIA',legal:['Sdn. Bhd.','Bhd.'],note:'Malaysia: Malay/Chinese/Indian naming ecosystems coexist; establish community and sector.'},
  'vi-VN':{family:'SE_ASIA',legal:['Công ty TNHH','Công ty Cổ phần'],note:'Vietnam: Vietnamese diacritics, name order and locality/sector forms.'},
  'th-TH':{family:'SE_ASIA',legal:['บริษัท … จำกัด'],note:'Thailand: Thai script/naming and local company forms; transliteration only when context requires.'},
  'fil-PH':{family:'SE_ASIA',legal:['Inc.','Corp.'],note:'Philippines: Filipino/English/Spanish-influenced naming depends on community/sector; avoid generic Latin-American substitution.'}
};

function organisationEvidence(locale){
  const p=localeOrganisationProfiles[locale]||null;
  const fam=organisationFamilies[p?.family]||organisationFamilies.ANGLO;
  const legal=p?.legal?.length?` Common legal/public forms where relevant: ${p.legal.join(', ')}.`:'';
  const note=p?.note?` Locale note: ${p.note}`:'';
  return `BUSINESS/INSTITUTION EVIDENCE: ${fam.registry} Naming structures: ${fam.business.join('; ')}. Institution structures: ${fam.institutions.join('; ')}. Avoid: ${fam.avoid.join('; ')}.${legal}${note}`;
}

function detectUkRegion(text){
  const t=String(text||'').toLocaleLowerCase();let best=null,bestScore=0;
  for(const [id,p] of Object.entries(ukRegions)){
    let score=0;for(const k of p.keys)if(t.includes(k))score+=k.includes(' ')?3:2;
    if(score>bestScore){best={id,...p};bestScore=score}
  }
  return bestScore?best:null;
}

function fictionWorldEvidence25287({locale='en-US',text=''}){
  const profile=localeProfiles[locale]||null;
  const uk=detectUkRegion(text);
  const parts=[];
  if(uk){
    parts.push(`SETTING EVIDENCE: detected UK regional context “${uk.id}”. Real settlement exemplars from the regional naming ecology: ${uk.places.join(', ')}.`);
    parts.push(`SOURCE BASIS: ${sourceNotes.GB}; ${sourceNotes.UK_ADMIN}. Use these as evidence of what local names actually look like, not as syllable bins to recombine mechanically.`);
  }else if(profile){
    parts.push(`LOCALE EVIDENCE: ${profile.country}. Real place exemplars: ${profile.examples.join(', ')}.`);
    parts.push(`SOURCE POLICY: prefer the relevant national gazetteer/statistical/geographic authority; where a full embedded national gazetteer is unavailable, these real exemplars anchor naming and the model must not claim exact statistical coverage.`);
  }else{
    parts.push('LOCALE EVIDENCE: no dedicated embedded country pack matched. Establish the actual country/region first; prefer real geography and conservative local naming conventions rather than free invention.');
  }
  parts.push(organisationEvidence(locale));
  parts.push('CHOICE METHOD: (a) decide real vs fictional from settlement scale and narrative/reputational need; (b) if real is suitable, use a real place and do not rename it; (c) if a fictional small settlement is necessary, study the supplied real regional exemplars, infer mundane local morphology/history, create an unshowy candidate, then reject any candidate that resembles an AI-default atmospheric compound or a conspicuous existing brand; (d) derive businesses/institutions from local/family/functional evidence rather than decorative invention.');
  return parts.join(' ');
}

module.exports={fictionWorldEvidence25287,sourceNotes,ukRegions,localeProfiles,localeOrganisationProfiles,organisationFamilies};
