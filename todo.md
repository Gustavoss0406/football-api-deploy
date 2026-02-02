# Football Data Platform - TODO

## Fase 0: Fundação e Setup

- [x] Estrutura de diretórios para scripts ETL
- [x] Configuração de ambiente para Python scripts
- [x] Schema completo do banco de dados D1

## Fase 1: Endpoints Core

- [x] GET /status - API status endpoint
- [x] GET /timezone - List of available timezones
- [x] GET /countries - List of countries
- [ ] GET /seasons - List of seasons
- [x] GET /leagues - List of leagues with full parameters
- [x] GET /teams - List of teams with full parameters
- [x] GET /standings - League standings with full parameters

## Fase 2: Fixtures e Dados de Partida

- [ ] GET /fixtures - List of fixtures with comprehensive filters
- [ ] GET /fixtures/headtohead - Head to head matches
- [ ] GET /fixtures/statistics - Match statistics
- [ ] GET /fixtures/events - Match events (goals, cards, substitutions)
- [ ] GET /fixtures/lineups - Match lineups

## Fase 3: Entidades Adicionais

- [ ] GET /players - Player profiles and statistics
- [ ] GET /players/statistics - Player statistics by season
- [ ] GET /teams/statistics - Team statistics
- [ ] GET /injuries - Player injuries
- [ ] GET /transfers - Player transfers
- [ ] GET /coachs - Coach information
- [ ] GET /trophies - Team and player trophies

## Fase 4: Endpoints Estratégicos

- [ ] GET /odds - Betting odds (historical and modeled)
- [ ] GET /predictions - Match predictions

## Fase 5: Infraestrutura e Qualidade

- [ ] Scripts de ingestão ETL para Open Football
- [ ] Scripts de ingestão ETL para Football-Data.co.uk
- [ ] Scripts de ingestão ETL para StatsBomb Open Data
- [ ] Scripts de ingestão ETL para Kaggle datasets
- [x] Scripts de ingestão ETL para football-data.org API
- [x] Camada de normalização de dados
- [x] Sistema de cache em múltiplas camadas (Edge, KV, D1)
- [ ] Modelos estatísticos para fair odds (Poisson, ELO)
- [ ] Modelos de predição de partidas
- [ ] Suite de testes de contrato
- [ ] Testes de snapshot para validação de schema
- [ ] Documentação da API
- [ ] Gate de paridade final
