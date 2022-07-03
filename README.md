# Programmeren 4 samen eten Gideon Owoc

Dit project is een API backend waarnaar requests kunnen worden gestuurd
In de API kunnen gebruikers voor zichzelf een account aan maken, en vervolgens inloggen.
Verder is het mogelijk om meals aan te maken die andere mensen kunnen bekijken.
Ook is het mogelijk om je eigen data te updaten en te verwijderen.
Voor alle acties behalven het inloggen, aanmaken van een user of het bekijken van een meal dient een gebruiker te zijn ingelog.

## routes
### inloggen
#### POST /api/auth/login
Logt je in in het systeem en geeft je een tijdelijke token terug
```json
{
    "emailAdress": "gideon@owoc.nl",
    "password": "testpassword"
}
```
### users
#### POST /api/user
Maakt een nieuwe user aan
```json
{
  "firstName": "Gideon",
  "lastName": "Owoc",
  "street": "Thuis",
  "city": "Thuis",
  "password": "testpassword",
  "emailAdress": "gideon@owoc.nl"
}
```
#### GET /api/user
Haalt de users op de voldoen aan de criteria
Variabelen
..* name
..* limit
..* active

#### GET /api/user/profile
Haalt je eigen profile op

#### GET /api/user/1
Haalt de user op met id 1

#### PUT /api/user/1
Update de user met id 1
```json
{
    "id": 1,
    "firstName": "Gideon",
    "lastName": "Owoc",
    "isActive": 1,
    "emailAdress": "gideon@owoc.nl",
    "password": "testpassword",
    "phoneNumber": "06 12345678",
    "roles": "editor,guest",
    "street": "Thuis",
    "city": "Breda"
}
```
#### DELETE /api/user/1
Delete de user met id 1

### meal
#### POST /api/meal
Maakt een nieuwe maaltijd aan
```json
{
  "name": "Maaltijd",
  "description": "Dé pastaklassieker bij uitstek.",
  "isActive": true,
  "isVega": true,
  "isVegan": true,
  "isToTakeHome": true,
  "dateTime": "2022-06-30T11:41:08.879Z",
  "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
  "allergenes": [
    "gluten",
    "noten",
    "lactose"
  ],
  "maxAmountOfParticipants": 6,
  "price": 6.75
}
```
#### GET api/meal/1
Haalt de meal op met het ID 1

#### GET api/meal
Haalt alle meals op

### DELETE api/meal/1
Verwijdert de meal met het ID 1

## Gebruik van de app
### npm i
Dit commando instaleert alle benodigde package om het project te draaien.

### npm run start
Start de app op

### npm run dev
Start de app op in nodemon, zodat bij elke keer als je je code opslaat de server opnieuw start

### npm run test
Voert de integratie testen uit