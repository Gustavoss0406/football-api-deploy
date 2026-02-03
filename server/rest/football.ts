import { Router } from "express";
import {
  getCountries,
  getLeagues,
  getTeams,
  getFixtures,
  getStandings,
} from "../football-db";

export const footballRestRouter = Router();

/**
 * GET /api/public/countries
 */
footballRestRouter.get("/countries", async (_req, res) => {
  const data = await getCountries();
  res.json(data);
});

/**
 * GET /api/public/leagues?country=Brazil&season=2024
 */
footballRestRouter.get("/leagues", async (req, res) => {
  const { country, season } = req.query;

  const data = await getLeagues({
    country: country as string,
    season: Number(season),
  });

  res.json(data);
});

/**
 * GET /api/public/teams?league=71&season=2024
 */
footballRestRouter.get("/teams", async (req, res) => {
  const { league, season } = req.query;

  const data = await getTeams({
    league: Number(league),
    season: Number(season),
  });

  res.json(data);
});

/**
 * GET /api/public/fixtures?league=71&season=2024
 */
footballRestRouter.get("/fixtures", async (req, res) => {
  const { league, season } = req.query;

  const data = await getFixtures({
    league: Number(league),
    season: Number(season),
  });

  res.json(data);
});

/**
 * GET /api/public/standings?league=71&season=2024
 */
footballRestRouter.get("/standings", async (req, res) => {
  const { league, season } = req.query;

  const data = await getStandings({
    league: Number(league),
    season: Number(season),
  });

  res.json(data);
});
