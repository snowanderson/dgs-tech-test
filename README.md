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

### Découpage de l'architecture

*A venir*

### Explications diverses

*A venir*
