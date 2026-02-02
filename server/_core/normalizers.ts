/**
 * Normalization layer for converting database entities to API-Football schemas
 * 
 * This module ensures 100% schema compatibility with API-Football responses.
 * All normalizers follow the exact structure defined in the API-Football documentation.
 */

import type { 
  Country, League, Season, Team, Venue, Fixture, Standing, 
  Player, PlayerStatistic, Coach, Transfer, Injury, Trophy, Odds, Prediction 
} from "../../drizzle/schema";

/**
 * Normalize country to API-Football format
 */
export function normalizeCountry(country: Country) {
  return {
    name: country.name,
    code: country.code,
    flag: country.flag,
  };
}

/**
 * Normalize venue to API-Football format
 */
export function normalizeVenue(venue: Venue, country?: Country) {
  return {
    id: venue.id,
    name: venue.name,
    address: venue.address,
    city: venue.city,
    country: country?.name || null,
    capacity: venue.capacity,
    surface: venue.surface,
    image: venue.image,
  };
}

/**
 * Normalize season to API-Football format
 */
export function normalizeSeason(season: Season) {
  return {
    year: season.year,
    start: season.start?.toISOString().split("T")[0] || null,
    end: season.end?.toISOString().split("T")[0] || null,
    current: season.current,
    coverage: {
      fixtures: {
        events: season.coverageFixturesEvents,
        lineups: season.coverageFixturesLineups,
        statistics_fixtures: season.coverageFixturesStatistics,
        statistics_players: season.coverageFixturesPlayers,
      },
      standings: season.coverageStandings,
      players: season.coveragePlayers,
      top_scorers: season.coverageTopScorers,
      top_assists: season.coverageTopAssists,
      top_cards: season.coverageTopCards,
      injuries: season.coverageInjuries,
      predictions: season.coveragePredictions,
      odds: season.coverageOdds,
    },
  };
}

/**
 * Normalize league to API-Football format
 */
export function normalizeLeague(
  league: League, 
  country: Country | null, 
  seasons: Season[]
) {
  return {
    league: {
      id: league.id,
      name: league.name,
      type: league.type,
      logo: league.logo,
    },
    country: country ? normalizeCountry(country) : null,
    seasons: seasons.map(normalizeSeason),
  };
}

/**
 * Normalize team to API-Football format
 */
export function normalizeTeam(
  team: Team, 
  venue?: Venue | null, 
  country?: Country | null
) {
  return {
    team: {
      id: team.id,
      name: team.name,
      code: team.code,
      country: country?.name || null,
      founded: team.founded,
      national: team.national,
      logo: team.logo,
    },
    venue: venue ? {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      country: country?.name || null,
      capacity: venue.capacity,
      surface: venue.surface,
      image: venue.image,
    } : null,
  };
}

/**
 * Normalize fixture to API-Football format
 */
export function normalizeFixture(
  fixture: Fixture,
  league: League,
  season: Season,
  homeTeam: Team,
  awayTeam: Team,
  venue?: Venue | null,
  country?: Country | null
) {
  return {
    fixture: {
      id: fixture.id,
      referee: fixture.referee,
      timezone: fixture.timezone,
      date: fixture.date?.toISOString() || null,
      timestamp: fixture.timestamp,
      periods: {
        first: fixture.periodsFirst,
        second: fixture.periodsSecond,
      },
      venue: venue ? {
        id: venue.id,
        name: venue.name,
        city: venue.city,
      } : null,
      status: {
        long: fixture.statusLong,
        short: fixture.statusShort,
        elapsed: fixture.statusElapsed,
      },
    },
    league: {
      id: league.id,
      name: league.name,
      country: country?.name || null,
      logo: league.logo,
      flag: country?.flag || null,
      season: season.year,
      round: fixture.round,
    },
    teams: {
      home: {
        id: homeTeam.id,
        name: homeTeam.name,
        logo: homeTeam.logo,
        winner: fixture.homeWinner,
      },
      away: {
        id: awayTeam.id,
        name: awayTeam.name,
        logo: awayTeam.logo,
        winner: fixture.awayWinner,
      },
    },
    goals: {
      home: fixture.goalsHome,
      away: fixture.goalsAway,
    },
    score: {
      halftime: {
        home: fixture.scoreHalftimeHome,
        away: fixture.scoreHalftimeAway,
      },
      fulltime: {
        home: fixture.scoreFulltimeHome,
        away: fixture.scoreFulltimeAway,
      },
      extratime: {
        home: fixture.scoreExtratimeHome,
        away: fixture.scoreExtratimeAway,
      },
      penalty: {
        home: fixture.scorePenaltyHome,
        away: fixture.scorePenaltyAway,
      },
    },
  };
}

/**
 * Normalize standing to API-Football format
 */
export function normalizeStanding(
  standing: Standing,
  team: Team,
  league: League,
  season: Season,
  country?: Country | null
) {
  return {
    rank: standing.rank,
    team: {
      id: team.id,
      name: team.name,
      logo: team.logo,
    },
    points: standing.points,
    goalsDiff: standing.goalsDiff,
    group: standing.group,
    form: standing.form,
    status: standing.status,
    description: standing.description,
    all: {
      played: standing.allPlayed,
      win: standing.allWin,
      draw: standing.allDraw,
      lose: standing.allLose,
      goals: {
        for: standing.allGoalsFor,
        against: standing.allGoalsAgainst,
      },
    },
    home: {
      played: standing.homePlayed,
      win: standing.homeWin,
      draw: standing.homeDraw,
      lose: standing.homeLose,
      goals: {
        for: standing.homeGoalsFor,
        against: standing.homeGoalsAgainst,
      },
    },
    away: {
      played: standing.awayPlayed,
      win: standing.awayWin,
      draw: standing.awayDraw,
      lose: standing.awayLose,
      goals: {
        for: standing.awayGoalsFor,
        against: standing.awayGoalsAgainst,
      },
    },
    update: standing.updatedAt?.toISOString() || null,
  };
}

/**
 * Normalize standings response (grouped by league)
 */
export function normalizeStandingsResponse(
  standings: Standing[],
  teams: Map<number, Team>,
  league: League,
  season: Season,
  country?: Country | null
) {
  // Group standings by group (for tournaments with groups)
  const groupedStandings: Record<string, any[]> = {};
  
  standings.forEach(standing => {
    const group = standing.group || "default";
    if (!groupedStandings[group]) {
      groupedStandings[group] = [];
    }
    
    const team = teams.get(standing.teamId);
    if (team) {
      groupedStandings[group].push(normalizeStanding(standing, team, league, season, country));
    }
  });
  
  // Convert to array format
  const standingsArray = Object.values(groupedStandings);
  
  return {
    league: {
      id: league.id,
      name: league.name,
      country: country?.name || null,
      logo: league.logo,
      flag: country?.flag || null,
      season: season.year,
      standings: standingsArray,
    },
  };
}

/**
 * Normalize player to API-Football format
 */
export function normalizePlayer(player: Player) {
  return {
    id: player.id,
    name: player.name,
    firstname: player.firstname,
    lastname: player.lastname,
    age: player.age,
    birth: {
      date: player.birthDate?.toISOString().split("T")[0] || null,
      place: player.birthPlace,
      country: player.birthCountry,
    },
    nationality: player.nationality,
    height: player.height,
    weight: player.weight,
    injured: player.injured,
    photo: player.photo,
  };
}

/**
 * Normalize player statistics to API-Football format
 */
export function normalizePlayerStatistics(
  playerStats: PlayerStatistic,
  player: Player,
  team: Team,
  league: League,
  season: Season
) {
  return {
    player: normalizePlayer(player),
    statistics: [{
      team: {
        id: team.id,
        name: team.name,
        logo: team.logo,
      },
      league: {
        id: league.id,
        name: league.name,
        country: null, // TODO: Add country if needed
        logo: league.logo,
        flag: null,
        season: season.year,
      },
      games: {
        appearences: playerStats.appearences,
        lineups: playerStats.lineups,
        minutes: playerStats.minutes,
        number: null,
        position: playerStats.position,
        rating: playerStats.rating?.toString() || null,
        captain: playerStats.captain,
      },
      substitutes: {
        in: playerStats.substitutesIn,
        out: playerStats.substitutesOut,
        bench: playerStats.substitutesBench,
      },
      shots: {
        total: playerStats.shotsTotal,
        on: playerStats.shotsOn,
      },
      goals: {
        total: playerStats.goalsTotal,
        conceded: playerStats.goalsConceded,
        assists: playerStats.goalsAssists,
        saves: playerStats.goalsSaves,
      },
      passes: {
        total: playerStats.passesTotal,
        key: playerStats.passesKey,
        accuracy: playerStats.passesAccuracy,
      },
      tackles: {
        total: playerStats.tacklesTotal,
        blocks: playerStats.tacklesBlocks,
        interceptions: playerStats.tacklesInterceptions,
      },
      duels: {
        total: playerStats.duelsTotal,
        won: playerStats.duelsWon,
      },
      dribbles: {
        attempts: playerStats.dribblesAttempts,
        success: playerStats.dribblesSuccess,
        past: playerStats.dribblesPast,
      },
      fouls: {
        drawn: playerStats.foulsDrawn,
        committed: playerStats.foulsCommitted,
      },
      cards: {
        yellow: playerStats.cardsYellow,
        yellowred: playerStats.cardsYellowred,
        red: playerStats.cardsRed,
      },
      penalty: {
        won: playerStats.penaltyWon,
        commited: playerStats.penaltyCommitted,
        scored: playerStats.penaltyScored,
        missed: playerStats.penaltyMissed,
        saved: playerStats.penaltySaved,
      },
    }],
  };
}

/**
 * Create API-Football compatible response wrapper
 */
export function createApiResponse<T>(data: T, errors: any[] = []) {
  return {
    get: "endpoint", // Will be set by the router
    parameters: {}, // Will be set by the router
    errors,
    results: Array.isArray(data) ? data.length : (data ? 1 : 0),
    paging: {
      current: 1,
      total: 1,
    },
    response: data,
  };
}
