Popis projektu:
Vytvoření webové aplikace pro rezervaci a evidenci servisu kol. Aplikace umožní uživatelům 
rezervovat termíny pro servis svých kol, sledovat stav opravy a historii servisních zásahů. 
Uživatelé budou rozděleni do dvou rolí: zákazníci (běžní uživatelé) a technici (zaměstnanci 
servisu). Zákazníci si budou moci vytvářet rezervace, prohlížet rezervace a servisní historii
svých kol. Technici budou mít přístup k evidenci kol, možnost zadávat informace o 
provedených opravách a spravovat rezervace. Aplikace bude obsahovat databázi s 
tabulkami pro evidenci kol, rezervací, servisních zásahů, uživatelů a dalších souvisejících 
entit.

Rozsah projektu

Orientačně je možné říci, že výsledný projekt (databáze + aplikace) bude zahrnovat (vše bude vytvořeno řádně v databázi a zobrazeno a využito v aplikaci) SMYSLUPLNÉ použití následujícího: 

    cca. 10 tabulek navrženého datového modelu (individuální domluva)
    alespoň jeden číselník – viz. například https://cs.wikipedia.org/wiki/%C4%8C%C3%ADseln%C3%ADk
    alespoň tři pohledy. které budou volány z aplikace
    alespoň tři funkce různého typu s odpovídající složitostí
    alespoň tři uložené procedury
    alespoň dva triggery
    alespoň jedna transakce s ošetřeným chováním při rollbacku
    použití indexů na neklíčové sloupce
    použití kompozitních primárních klíčů
    vyzkoušet si použití datového typu JSON v moderních relačních databázích (rozumné použití včetně filtrace nad těmito sloupci může ovlivnit počet požadovaných databázových tabulek, případně odpuštění jednoho ze zde uvedených požadavků – záleží na domluvě se cvičícím)
    v databázovém serveru bude vytvořen uživatel s potřebnými právy pouze k databázovým objektům, které pro správný běh aplikace potřebuje – tzn. root (admin) účet nebude aplikací používán, vč. omezení přístupu pouze z potřebné IP adresy
    doporučené rozjetí projektu v Dockeru pomocí docker-compose – bude zajištěna inicializace struktury databáze a nahrání dat při startu
    verzování vývoje pomocí Gitu
    vhodným způsobem zajistit ukládání obrázků, které budou v aplikaci načteny a zobrazeny
    aplikace bude využívat minimálně 2 plnohodnotné formuláře (např. ošetření vstupních polí, apod.) pro vytváření nebo modifikaci dat v tabulkách

DDL:
```sql
Table users {
  user_id int [pk, increment, not null]
  name varchar [not null]
  email varchar [not null]
  phone varchar [null]
  role enum("technician", "customer") [not null]
  login varchar [not null]
  password varchar [not null]
}

Table bikes {
  bike_id int [pk, increment, not null]
  model varchar [not null]
  type varchar [not null]
  brand_id varchar [null]
  brand_other varchar [null]
  details json [null]
}

Table reservations {
  reservation_id int [pk, increment, not null]
  reservation_date datetime [not null]
  problem_description text [not null]
  reservation_status enum("new", "confirmed", "processing", "done", "closed") [not null]
  customer_id int [not null]
  bike_id int [not null]
}

Table services {
  service_id int [pk, increment, not null]
  service_date datetime [not null]
  repair_description text [not null]
  bike_id int [not null]
  technician_id int [not null]
}

Table bike_brands {
  brand_id int [pk, increment, not null]
  name varchar [not null]
}

Table images {
  image_id int [pk, increment, not null]
  bike_id int [null]
  service_id int [null]
  path varchar [not null]
  description varchar [null]
}

Ref: bikes.brand_id > bike_brands.brand_id
Ref: reservations.customer_id > users.user_id
Ref: reservations.bike_id > bikes.bike_id
Ref: services.bike_id > bikes.bike_id
Ref: services.technician_id > users.user_id
Ref: images.bike_id > bikes.bike_id
Ref: images.service_id > services.service_id
```


Charakteristika uživatelského rozhraní
Charakteristika uživatelského rozhraní (UI)
Uživatelské rozhraní bude navrženo tak, aby bylo intuitivní a snadno použitelné pro všechny
typy uživatelů (zákazníky i techniky). Níže je podrobná charakteristika UI:
1. Login formulář:
• Pole pro zadání e-mailu a hesla.
• Tlačítko pro přihlášení.
• Odkaz na registrační formulář pro nové uživatele.
2. Registrační formulář:
• Pole pro zadání jména, e-mailu, telefonního čísla a hesla.
• Tlačítko pro registraci.
3. Zákazníci:
• Dashboard:
o Přehledová stránka s rychlým náhledem na aktivní rezervace a stav jejich kol.
o Zobrazení stavu rezervací
o Rychlé odkazy na vytvoření nové rezervace nebo prohlížení historie servisu.
• Rezervace:
o Formulář pro vytváření nové rezervace:
§ Pole pro výběr data a času rezervace.
§ Pole pro popis problému.
§ Výběr kola z dostupných kol zákazníka nebo vytvoření nového.
§ Tlačítko pro odeslání rezervace.
o Tabulka rezervací:
§ Zobrazení seznamu všech rezervací zákazníka s možností filtrování
podle stavu (new, confirmed, processing, done, closed).
§ Možnost zobrazení detailu každé rezervace (datum, popis problému,
stav, přiřazený technik).
o Historie servisu:
§ Stránka s přehledem všech servisních zásahů pro jednotlivá kola.
§ Možnost zobrazení detailu každého servisního zásahu (datum, popis
opravy, technik).
• Kola:
o Výpis kol:
§ Stránka s výpisem všech kol zákazníka.
o Detail kola:
§ Zobrazení podrobných informací o kole (model, typ, značka, historie
servisu).
§ Možnost nahrát obrázky kola.
§ Tlačítko pro editaci základních informací o kole.
• Profil:
o Změna kontaktních údajů:
§ Pole pro úpravu jména, e-mailu a telefonního čísla.
§ Tlačítko pro uložení změn.
o Změna hesla:
§ Pole pro zadání starého hesla, nového hesla a potvrzení nového hesla.
§ Tlačítko pro uložení nového hesla.
4. Technici:
• Dashboard:
o Přehledová stránka s aktuálními rezervacemi a servisními úkoly.
o Rychlé odkazy na správu rezervací a servisních zásahů.
• Rezervace:
o Tabulka rezervací:
§ Zobrazení všech rezervací s možností filtrování podle stavu
(new, confirmed, processing, done, closed).
§ Možnost zobrazení detailu každé rezervace (datum, popis problému,
stav, zákazník).
§ Možnost aktualizovat stav rezervace (např.
z new na confirmed nebo processing).
o Detail rezervace:
§ Zobrazení podrobných informací o rezervaci včetně kontaktních údajů
zákazníka.
§ Možnost přiřadit rezervaci k sobě nebo jinému technikovi.
• Servisní zásahy:
o Formulář pro zadání servisního zásahu:
§ Pole pro výběr data a času servisu.
§ Pole pro popis provedené opravy.
§ Možnost nahrát obrázky ze servisního zásahu.
§ Tlačítko pro uložení servisního zásahu.
o Historie servisu:
§ Zobrazení historie všech servisních zásahů pro jednotlivá kola.
§ Možnost zobrazení detailu každého servisního zásahu (datum, popis
opravy, technik).
o Nahrávání obrázků:
§ Možnost nahrát obrázky z provedeného servisního zásahu pro
dokumentaci.
• Kola:
o Výpis kol:
§ Stránka s výpisem všech kol v systému.
o Detail kola:
§ Zobrazení podrobných informací o kole (model, typ, značka, historie
servisu).
§ Možnost editace informací o kole (model, typ, značka, stav).
§ Možnost nahrát obrázky kola.
• Přehled zákazníků:
o Výpis zákazníků:
§ Stránka s výpisem všech zákazníků v systému.
§ Možnost filtrování zákazníků podle jména, e-mailu nebo telefonního
čísla.
o Detail zákazníka:
§ Zobrazení podrobných informací o zákazníkovi (jméno, e-mail, telefon,
seznam rezervací a kol).
5. Společné prvky UI:
• Navigační menu
o Navigace na stránky, ke kterým má daný uživatel přístup
