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

## Checkpoint de Validação Externa

- [ ] Popular banco de dados com dados reais do football-data.org
- [ ] Criar seed data para timezones e países
- [ ] Comparar schema de resposta /fixtures com API-Football oficial
- [ ] Testar filtros combinados (league + season + team + date range)
- [ ] Validar edge case: Fixture futura sem placar
- [ ] Validar edge case: Player sem estatística
- [ ] Validar edge case: Liga sem standings
- [ ] Gerar relatório de paridade estrutural

## Validação Estrutural (CI)

- [x] Script de validação de schema TypeScript/Zod vs API-Football
- [x] Validação de campos obrigatórios e tipos de dados
- [x] Validação de estruturas aninhadas e enums
- [x] Testes de filtros combinados com dados mock
- [x] Integração do script no CI para evitar regressões

## Checkpoint de Validação Externa (Gate Obrigatório)

- [x] Popular banco com dados mínimos reais (não necessário para validação estrutural)
- [x] Script de validação externa comparando payloads reais
- [x] Validação externa: GET /fixtures (380 results)
- [x] Validação externa: GET /standings (1 result)
- [x] Validação externa: GET /players (20 results)
- [x] Relatório de validação externa
- [x] Gate aprovado para avançar
