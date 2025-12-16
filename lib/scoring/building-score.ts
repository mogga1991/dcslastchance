import { BuildingRequirement, PropertyBuilding, BuildingBreakdown } from './types';

export function scoreBuilding(
  property: PropertyBuilding,
  requirement: BuildingRequirement
): { score: number; breakdown: BuildingBreakdown } {
  let score = 50; // Base score
  const breakdown: BuildingBreakdown = {
    classMatch: false,
    accessibilityMet: true,
    featuresMet: [],
    featuresMissing: [],
    certificationsMet: [],
    certificationsMissing: [],
    notes: [],
  };

  // Safety check for buildingClass
  if (!property.buildingClass) {
    breakdown.notes.push('Building class information not available');
    return { score: 50, breakdown };
  }

  // Normalize building class (handle A+ as A)
  const normalizedClass = property.buildingClass.replace('+', '') as 'A' | 'B' | 'C';

  // Building Class (+20 / +10 / -20)
  if (requirement.buildingClass && requirement.buildingClass.length > 0) {
    if (requirement.buildingClass.includes(normalizedClass)) {
      breakdown.classMatch = true;
      if (requirement.buildingClass[0] === normalizedClass) {
        score += 20; // Preferred class
        breakdown.notes.push(`Class ${property.buildingClass} - preferred`);
      } else {
        score += 10; // Acceptable class
        breakdown.notes.push(`Class ${property.buildingClass} - acceptable`);
      }
    } else {
      score -= 20;
      breakdown.notes.push(
        `Class ${property.buildingClass} - not in acceptable list`
      );
    }
  }

  // Accessibility (CRITICAL - can be disqualifying)
  if (requirement.accessibility?.adaCompliant && !property.adaCompliant) {
    breakdown.accessibilityMet = false;
    score -= 30;
    breakdown.notes.push('ADA compliance required but not met');
  }

  if (requirement.accessibility?.publicTransit && !property.publicTransitAccess) {
    score -= 5;
    breakdown.notes.push('Public transit access preferred');
  }

  // Features scoring
  const featureChecks: [keyof typeof requirement.features, number][] = [
    ['fiber', 5],
    ['backupPower', 5],
    ['loadingDock', 5],
    ['security24x7', 5],
    ['secureAccess', 5],
    ['scifCapable', 10], // Higher weight for specialized
    ['dataCenter', 10],
    ['cafeteria', 2],
    ['fitnessCenter', 2],
    ['conferenceCenter', 3],
  ];

  for (const [feature, points] of featureChecks) {
    if (requirement.features?.[feature]) {
      if (property.features?.[feature]) {
        breakdown.featuresMet.push(feature);
        score += points;
      } else {
        breakdown.featuresMissing.push(feature);
        score -= Math.ceil(points / 2); // Half penalty for missing
      }
    }
  }

  // Certifications
  if (requirement.certifications && property.certifications) {
    // Ensure certifications are arrays
    const reqCerts = Array.isArray(requirement.certifications)
      ? requirement.certifications
      : [];
    const propCerts = Array.isArray(property.certifications)
      ? property.certifications
      : [];

    for (const cert of reqCerts) {
      const hasCert = propCerts.some((pc) =>
        pc.toLowerCase().includes(cert.toLowerCase())
      );
      if (hasCert) {
        breakdown.certificationsMet.push(cert);
        score += 5;
      } else {
        breakdown.certificationsMissing.push(cert);
      }
    }
  }

  return { score: Math.max(0, Math.min(100, score)), breakdown };
}
