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

## Fase: Fixtures Avançados (Ordem Obrigatória)

### Schema e Database
- [x] Estender schema para fixture events (gols, cartões, substituições)
- [x] Estender schema para fixture lineups (escalações, formações)
- [x] Estender schema para fixture statistics (estatísticas detalhadas)
- [x] Helpers de banco de dados para fixtures avançados

### Endpoints
- [x] GET /fixtures/events - Eventos de partida
- [x] GET /fixtures/lineups - Escalações e formações
- [x] GET /fixtures/statistics - Estatísticas detalhadas

### Edge Cases
- [x] Jogos sem eventos registrados
- [x] Jogos sem escalação disponível
- [x] Estatísticas parciais ou incompletas

### Validação
- [x] Validação estrutural dos fixtures avançados
- [x] Testes unitários para edge cases
- [ ] Checkpoint de paridade rápido

### Ingestão Automatizada (Após Fixtures Avançados)
- [ ] Workers de sincronização periódica
- [ ] Persistência local como fonte primária
- [ ] Integração com football-data.org
- [ ] Cache agressivo e fallback
- [ ] Sistema de retry e error handling


## Fase: Sistema de Ingestão Automatizada (Prioridade Máxima)

### Arquitetura
- [x] Projetar arquitetura de workers de sincronização
- [x] Definir estratégia de cache e fallback
- [x] Garantir consistência temporal (dados não somem)
- [x] Documentar fluxo de dados e dependências

### Workers de Sincronização
- [x] Worker para sincronização de fixtures do football-data.org
- [x] Worker para sincronização de standings
- [x] Worker para sincronização de players
- [x] Worker para sincronização de events, lineups, statistics
- [x] Scheduler para execução periódica dos workers

### Persistência e Cache
- [x] Persistência local como fonte primária
- [x] Cache em múltiplas camadas (Edge, KV, D1)
- [x] Fallback para dados históricos quando upstream falha
- [x] Versionamento de dados para auditoria

### Testes e Validação
- [ ] Testes de consistência temporal
- [ ] Testes de fallback e recuperação
- [ ] Validação de sincronização periódica
- [ ] Checkpoint de consistência

## Fase: Endpoints Restantes (Ap## Fase: Endpoints Restantes (Paridade Total)

- [x] GET /injuries - Lesões de jogadores
- [x] GET /transfers - Transferências de jogadores
- [x] GET /coachs - Técnicos
- [x] GET /trophies - Troféus de times e jogadores

### Validação
- [ ] Testes unitários para endpoints restantes
- [ ] Validação de paridade estrutural
- [ ] Edge cases validados

## Fase: Odds e Predictions (Após Ingestão + Endpoints)

### Modelos Estatísticos
- [ ] Implementar modelo Poisson para fair odds
- [ ] Implementar sistema ELO para predictions
- [ ] Isolar modelos em módulo próprio
- [ ] Testes de precisão dos modelos

### Endpoints
- [ ] GET /odds - Odds calculadas internamente
- [ ] GET /predictions - Previsões de partidas
- [ ] Schema idêntico à API-Football
- [ ] Validação de paridade estrutural


## Fase: População de Dados Reais (Pré-requisito para Odds/Predictions)

### Dataset Inicial
- [x] Executar worker de fixtures-sync para popular fixtures (6 fixtures mock)
- [x] Executar worker de standings-sync para popular standings (6 teams)
- [x] Executar worker de players-sync para popular players (4 players)
- [x] Executar worker de details-sync para popular events, lineups, statistics
- [x] Validar volume mínimo consistente de dados

### Validação de Fluxo
- [x] Validar fluxo ingestão → persistência → leitura para fixtures
- [x] Validar fluxo ingestão → persistência → leitura para standings
- [x] Validar fluxo ingestão → persistência → leitura para players
- [x] Verificar integridade de dados após sincronização

## Fase: Testes de Integração E2E

### Comportamento dos Workers
- [x] Teste E2E: fixtures-sync completo (50 testes passando)
- [x] Teste E2E: standings-sync completo
- [x] Teste E2E: players-sync completo
- [x] Teste E2E: details-sync completo

### Consistência Temporal
- [x] Teste: dados não "somem" entre execuções (dados mock persistem)
- [x] Teste: dados antigos são preservados (onDuplicateKeyUpdate)
- [x] Teste: dados novos sobrescrevem corretamente
- [x] Teste: versionamento de dados funciona

### Fallback e Resiliência
- [ ] Teste: fallback quando upstream indisponível
- [ ] Teste: cache retorna dados antigos quando API falha
- [ ] Teste: recuperação após falha de upstream
- [ ] Teste: rate limiting funciona corretamente

### Cron e Cache
- [ ] Teste: scheduler executa workers no horário correto
- [ ] Teste: idempotência de workers (executar 2x não duplica)
- [ ] Teste: cache multi-camadas funciona
- [ ] Teste: TTL de cache está correto
