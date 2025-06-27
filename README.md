# Dougs Technical Test

## Description

API réalisée via NestJS pour la validation d'opérations bancaires.

## Pré-requis

- Docker
- Pour le dev et les tests : NodeJS 23

## Installation

- Démarrer le projet en exécutant la commande suivante :

```bash
docker-compose up # --build en cas de modification du projet
```

## Usage

- POST http://localhost:3000/movements/validation permet la validation d'une liste d'opérations bancaires selon une liste de points de contrôle

## Lancer en mode dev

```bash
npm run start:dev
```

## Lancer les tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## Lancer le linting

```bash
# Validation
npm run lint

# Formatage
npm run format
```

## Architecture

### Dépendances

- NodeJS + Express + NestJS avec Typescript
- Jest et supertest pour les tests
- Eslint et prettier pour la qualité de code
- Class-transformer et class-validator pour la validation des input/output

### Découpage de l'architecture

Le projet est découpé par modules comme proposé par NestJS. Ne contenant que la fonctionnalité de la validation des opérations bancaires, la répartition dans les dossiers est la suivante :
- `controllers` correspond aux routes exposées
- `domain` sert à la déclaration des entités business et des objets clés aux fonctionnalités
- `dto` défini les objets en input/output des endpoints d'API
- `exceptions` déclare les exceptions spécifiques au projet
- `services` contient tous les services utilisés par la feature

### Explications diverses

#### Interprétation des règles métier

- Il est nécessaire d'avoir aux moins deux balances pour faire les comparaisons
  - La première permet de connaitre le solde d'origine sur lequel appliquer les calculs
  - La seconde sert de comparaison avec le résultat du calcul
  - Si une erreur est détectée (moins de deux balances), aucune autre verification n'est effectuée

- Toutes les opérations bancaires doivent être comprises entre deux balances.
  - Le choix a été fait de retourner une erreur si une opération n'est pas comprise entre deux balances afin de faciliter l'interprétation des résultats
  - Si une erreur est détectée, il n'y a pas de vérification au niveau du calcul des soldes

- Dans le cadre du risque de doublons, les IDs des opérations transmises sont validées pour s'assurer qu'il n'y ai pas de doublons
  - Si une erreur est détectée, il n'y a pas de vérification au niveau du calcul des soldes

- Pour le calcul des soldes, une vérification est faite par groupe : 
  - On regroupe toutes les transactions comprises chronologiquement entre la balance la plus ancienne qui n'a pas encore été choisi comme balance initiale et la balance suivante 
  - On vérifie pour chaque groupe si le montant des transactions avec le solde initiale correspond au solde suivant
  - On regroupe les erreurs pour chaque groupe afin de valider l'intégralité des transactions en une vérification

#### Double precision issue

La comparaison de nombre à virgule pose des soucis de précisions en Javascript.
Il est donc préférable de soit :
- Travailler avec les centimes comme unité afin de rester en nombre entier
- De gérer cette erreur de précision en utilisant des librairies spécifiques ou en implémentant une marge de tolérence avec un multiple de Epsilon en fonction de l'ordre de grandeur des valeurs manipulées

#### Domain entities & value-objects

Cette approche est empruntée du Domain Driven Design afin de travailler avec des objets métiers pour la partie entities. Cela permet notamment un découpable avec les DTO qui servent au transfert des données
de et vers cette API.
Validation Result dans les value-objects permet un suivi facilité des résultats des différents tests avant d'être convertis en exceptions aux moments choisi dans le service pour décider de quand arrêter le process.

### Pistes d'améliorations

- Confirmer les différentes règles métier
- Prendre en compte le problème de précision des nombres flottants
- Ne plus transmettre les balances dans l'API mais les stocker dans une base
- Intégrer Swagger pour fournir la documentation sur l'API
