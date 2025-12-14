import { Scorecard } from "./schemas";

/**
 * Enforces scorecard consistency:
 * - Ensures scores sum correctly
 * - Forces NoBidIneligible if hard stops triggered
 * - Clamps confidence when hard stops present
 * - Prevents nonsense total scores
 */
export function enforceScorecardConsistency(scorecard: Scorecard): Scorecard {
  const sum = scorecard.category_scores.reduce((acc, c) => acc + c.score_0_max, 0);

  // If hard stop triggered, force decision
  if (scorecard.hard_stops_triggered.length > 0) {
    scorecard.decision.bid_decision = "NoBidIneligible";
    scorecard.decision.confidence_0_100 = Math.min(scorecard.decision.confidence_0_100, 80);
  }

  // Clamp total score
  scorecard.decision.fit_score_0_100 = Math.max(0, Math.min(100, sum));

  return scorecard;
}
