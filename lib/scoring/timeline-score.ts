import { TimelineRequirement, PropertyTimeline, TimelineBreakdown } from './types';

export function scoreTimeline(
  property: PropertyTimeline,
  requirement: TimelineRequirement
): { score: number; breakdown: TimelineBreakdown } {
  const breakdown: TimelineBreakdown = {
    availableOnTime: false,
    leaseTermCompatible: true,
    daysUntilAvailable: null,
    daysBeforeOccupancy: null,
    notes: [],
  };

  const today = new Date();
  const availableDate = property.availableDate || today;
  const occupancyDate = requirement.occupancyDate;

  // Calculate days
  const daysUntilAvailable = Math.ceil(
    (availableDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysBeforeOccupancy = Math.ceil(
    (occupancyDate.getTime() - availableDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  breakdown.daysUntilAvailable = daysUntilAvailable;
  breakdown.daysBeforeOccupancy = daysBeforeOccupancy;

  let score = 0;

  // Availability scoring
  if (daysBeforeOccupancy >= 0) {
    breakdown.availableOnTime = true;

    // More buffer time = better
    if (daysBeforeOccupancy >= 90) {
      score = 100;
      breakdown.notes.push('Available 90+ days before occupancy');
    } else if (daysBeforeOccupancy >= 60) {
      score = 90;
      breakdown.notes.push('Available 60+ days before occupancy');
    } else if (daysBeforeOccupancy >= 30) {
      score = 80;
      breakdown.notes.push('Available 30+ days before occupancy');
    } else {
      score = 70;
      breakdown.notes.push('Tight timeline - available just before occupancy');
    }
  } else {
    // Not available in time
    const daysLate = Math.abs(daysBeforeOccupancy);

    if (daysLate <= 30) {
      score = 50;
      breakdown.notes.push(
        `Available ${daysLate} days after required occupancy`
      );
    } else if (daysLate <= 60) {
      score = 30;
      breakdown.notes.push(
        `Available ${daysLate} days after required occupancy`
      );
    } else {
      score = 10;
      breakdown.notes.push('Significantly delayed availability');
    }
  }

  // Lease term compatibility
  if (requirement.firmTermMonths) {
    const minTerm = property.minLeaseTermMonths || 0;
    const maxTerm = property.maxLeaseTermMonths || Infinity;

    if (requirement.firmTermMonths < minTerm) {
      score -= 10;
      breakdown.leaseTermCompatible = false;
      breakdown.notes.push(
        `Min lease term (${minTerm} mo) exceeds requirement`
      );
    }

    if (requirement.totalTermMonths && requirement.totalTermMonths > maxTerm) {
      score -= 5;
      breakdown.notes.push(
        'Max lease term may not accommodate full requirement'
      );
    }
  }

  return { score: Math.max(0, score), breakdown };
}
