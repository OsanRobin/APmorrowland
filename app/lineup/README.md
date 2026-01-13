## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Sat Dec 27 2025 17:39:37 GMT+0000 (Coordinated Universal Time)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.20.0|
|**Generation Platform**<br>SAP Business Application Studio|
|**Template Used**<br>Basic V4|
|**Service Type**<br>Local CAP|
|**Service URL**<br>http://localhost:4004/odata/v4/festival/|
|**Module Name**<br>lineup|
|**Application Title**<br>lineup|
|**Namespace**<br>apm|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.143.2|
|**Enable Code Assist Libraries**<br>False|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>False|

## lineup

An SAP Fiori application.

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  To launch the generated app, start your CAP project:  and navigate to the following location in your browser:

http://localhost:4004/apm.lineup/index.html

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)


# APMorrowland – Festival Management Platform

APMorrowland is een modulair project opgebouwd met SAP CAP en SAPUI5 dat een realistische festivalomgeving simuleert. Het platform ondersteunt medewerkers bij het beheren van artiesten, line-ups, planningen en bestellingen. De focus ligt op overzicht, logische samenhang en een duidelijke architectuur tussen backend en frontend.

Dit project werd ontwikkeld als leerproject en combineert technische implementatie met functioneel inzicht in hoe digitale toepassingen een festivalorganisatie kunnen ondersteunen.

## Doel van het project

Tijdens de voorbereiding van een groot festival verandert de planning voortdurend. Artiesten schuiven in het schema, stages raken vol en onverwachte overlappingen zorgen voor stress bij de organisatie. APMorrowland wil hiervoor een duidelijk en begrijpelijk overzicht bieden.

De applicaties maken het mogelijk om:
- festivalplanningen en line-ups te raadplegen
- artiesten en hun populariteit te analyseren
- bestellingen en tickets te beheren
- data en visualisaties logisch te koppelen aan een realistische context

## Architectuur

Het project is bewust opgebouwd uit meerdere kleinere applicaties in plaats van één grote monolithische app. Deze aanpak maakte het eenvoudiger om onderdelen afzonderlijk te ontwikkelen, te testen en te onderhouden.

### Backend
- SAP CAP (Node.js)
- OData v4 services
- CDS-modellen voor orders, artiesten en line-up
- In-memory database met mockdata tijdens ontwikkeling

### Frontend
- SAPUI5 met XML Views en controllers
- Horizon theme
- Aparte UI5-applicatie per domein (orders, artiesten, line-up)
- Databinding via OData v4

## Projectstructuur

APMORROWLAND/
│
├── app/
│ ├── orders/
│ ├── lineup/
│ ├── artist/
│ └── services.cds
│
├── srv/
│ └── festival-service.cds
│
├── db/
│ └── schema.cds
│
└── package.json


## Functionaliteiten

### Orders
De orders-applicatie toont een overzicht van bestellingen en laat toe om per order details te bekijken. Subtotalen en totalen worden automatisch berekend. De structuur is voorbereid op uitbreidingen zoals een PDF-export of het simuleren van betaalmethodes.

### Artiesten en leaderboard
Deze applicatie biedt een overzicht van artiesten en een leaderboard gebaseerd op scores. Het doel is om snel inzicht te krijgen in welke artiesten populair zijn. Mogelijke uitbreidingen zijn een top per genre of trendvisualisaties.

### Line-up en planning
De line-up applicatie visualiseert per festivaldag welke stages actief zijn en welke artiesten wanneer optreden. De nadruk ligt op leesbaarheid en begrijpelijkheid, zodat medewerkers snel inzicht krijgen in de planning.

## Installatie en opstarten

Vereisten:
- Node.js (LTS)
- SAP CDS CLI
- SAP Business Application Studio (aanbevolen)

Opstarten van het project:
cd APMORROWLAND
cds watch


De applicaties draaien met mockdata en ondersteunen live reload tijdens ontwikkeling. De OData service is beschikbaar via `/odata/v4/festival/`.

## Reflectie

Tijdens dit project heb ik zowel technisch als inhoudelijk een sterke leercurve doorgemaakt. Ik heb geleerd hoe belangrijk een doordachte architectuur is bij grotere applicaties en hoe snel kleine ontwerpkeuzes grote gevolgen kunnen hebben.

Een belangrijke uitdaging lag in het debuggen van UI5-problemen en het correct koppelen van frontend en backend. Door te werken met meerdere kleinere frontend-applicaties kreeg ik meer overzicht en controle over de functionaliteit.

Ik ben vooral trots op het feit dat de applicaties niet alleen technisch werken, maar ook logisch en realistisch aanvoelen binnen de festivalcontext. De samenhang tussen data, services en UI was hierbij een belangrijk aandachtspunt.

Als ik dit project opnieuw zou starten, zou ik meer tijd investeren in het vooraf uittekenen van de architectuur en datamodellen. Toch beschouw ik de iteratieve aanpak als een waardevolle leerervaring die mijn groei als ontwikkelaar duidelijk weerspiegelt.

## Mogelijke uitbreidingen

- Exporteren van orders naar PDF
- Simulatie van betaalmethodes
- Geavanceerdere planningslogica met conflictcontrole
- Uitgebreidere analytische dashboards
- Authenticatie en rollen

## Auteur

Dit project werd ontwikkeld als leerproject binnen de context van ERP Applications, met focus op SAP CAP en SAPUI5.

