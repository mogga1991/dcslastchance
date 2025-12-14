import type { CompanyProfile } from "@/types/company-profile";
import type { SAMOpportunity } from "@/types/sam";

export interface QualificationResult {
  overall_status: "qualified" | "partial" | "not_qualified";
  overall_score: number; // 0-100
  checks: {
    naics: QualificationCheck;
    set_aside: QualificationCheck;
    clearance: QualificationCheck;
    geographic: QualificationCheck;
  };
  recommendations: string[];
  blockers: string[];
}

export interface QualificationCheck {
  status: "pass" | "partial" | "fail" | "not_applicable";
  score: number; // 0-100
  required: string;
  yours: string;
  details: string;
}

/**
 * Check if company qualifies for an opportunity
 */
export function checkQualification(
  profile: CompanyProfile,
  opportunity: SAMOpportunity
): QualificationResult {
  const checks = {
    naics: checkNaicsMatch(opportunity, profile),
    set_aside: checkSetAsideMatch(opportunity, profile),
    clearance: checkClearanceMatch(opportunity, profile),
    geographic: checkGeographicMatch(opportunity, profile),
  };

  // Calculate overall score (weighted)
  const weights = {
    naics: 0.4, // 40% - most critical
    set_aside: 0.3, // 30% - very important for eligibility
    clearance: 0.15, // 15% - can be a blocker
    geographic: 0.15, // 15% - often flexible
  };

  const applicableChecks = Object.entries(checks).filter(
    ([_, check]) => check.status !== "not_applicable"
  );

  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, check] of applicableChecks) {
    const weight = weights[key as keyof typeof weights];
    totalScore += check.score * weight;
    totalWeight += weight;
  }

  const overall_score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  // Determine overall status
  let overall_status: "qualified" | "partial" | "not_qualified";
  if (overall_score >= 75) {
    overall_status = "qualified";
  } else if (overall_score >= 50) {
    overall_status = "partial";
  } else {
    overall_status = "not_qualified";
  }

  // Generate recommendations and blockers
  const recommendations: string[] = [];
  const blockers: string[] = [];

  Object.entries(checks).forEach(([key, check]) => {
    if (check.status === "fail") {
      blockers.push(check.details);
    } else if (check.status === "partial") {
      recommendations.push(check.details);
    }
  });

  return {
    overall_status,
    overall_score,
    checks,
    recommendations,
    blockers,
  };
}

/**
 * Check NAICS code match
 */
function checkNaicsMatch(
  opportunity: SAMOpportunity,
  profile: CompanyProfile
): QualificationCheck {
  const oppNaics = opportunity.naicsCode;

  if (!oppNaics) {
    return {
      status: "not_applicable",
      score: 0,
      required: "Not specified",
      yours: "N/A",
      details: "No NAICS code specified for this opportunity",
    };
  }

  // Check primary NAICS exact match
  if (profile.primary_naics === oppNaics) {
    return {
      status: "pass",
      score: 100,
      required: oppNaics,
      yours: profile.primary_naics,
      details: "Exact match with your primary NAICS code",
    };
  }

  // Check additional NAICS codes for exact match
  if (profile.naics_codes?.includes(oppNaics)) {
    return {
      status: "pass",
      score: 100,
      required: oppNaics,
      yours: oppNaics,
      details: "Exact match with one of your NAICS codes",
    };
  }

  // Check for same industry (first 2 digits)
  const oppPrefix = oppNaics.substring(0, 2);
  const hasRelatedNaics =
    profile.primary_naics?.startsWith(oppPrefix) ||
    profile.naics_codes?.some((code) => code.startsWith(oppPrefix));

  if (hasRelatedNaics) {
    return {
      status: "partial",
      score: 60,
      required: oppNaics,
      yours: profile.primary_naics || profile.naics_codes?.[0] || "None",
      details: `Related industry sector (${oppPrefix}), but not exact match. May still be eligible.`,
    };
  }

  return {
    status: "fail",
    score: 0,
    required: oppNaics,
    yours: profile.primary_naics || "Not specified",
    details: "No matching NAICS code. This is a critical qualification requirement.",
  };
}

/**
 * Check set-aside certification match
 */
function checkSetAsideMatch(
  opportunity: SAMOpportunity,
  profile: CompanyProfile
): QualificationCheck {
  const setAside = opportunity.typeOfSetAsideDescription || opportunity.typeOfSetAside;

  if (!setAside || setAside === "None" || setAside.toLowerCase().includes("none")) {
    return {
      status: "not_applicable",
      score: 0,
      required: "None",
      yours: "N/A",
      details: "No set-aside requirement - open to all businesses",
    };
  }

  const setAsideLower = setAside.toLowerCase();
  const certs = profile.set_aside_certifications || [];

  // Map set-aside descriptions to certification types
  const certificationMatches: { [key: string]: string[] } = {
    "8(a)": ["8a"],
    "service-disabled veteran-owned": ["sdvosb"],
    "woman-owned": ["wosb", "edwosb"],
    "economically disadvantaged woman-owned": ["edwosb"],
    "hubzone": ["hubzone"],
    "veteran-owned": ["vosb", "sdvosb"],
    "small business": ["small_business"], // Check business_types
  };

  for (const [keyword, requiredCerts] of Object.entries(certificationMatches)) {
    if (setAsideLower.includes(keyword.toLowerCase())) {
      // Special handling for small business
      if (keyword === "small business") {
        const isSmallBusiness = profile.business_types?.includes("small_business");
        if (isSmallBusiness) {
          return {
            status: "pass",
            score: 100,
            required: setAside,
            yours: "Small Business",
            details: "You meet the small business set-aside requirement",
          };
        }
      } else {
        // Check certifications
        const hasRequiredCert = requiredCerts.some((cert) => certs.includes(cert as any));
        if (hasRequiredCert) {
          return {
            status: "pass",
            score: 100,
            required: setAside,
            yours: requiredCerts.find((cert) => certs.includes(cert as any)) || "",
            details: `You have the required ${setAside} certification`,
          };
        }
      }

      // No match found
      return {
        status: "fail",
        score: 0,
        required: setAside,
        yours: certs.join(", ") || "None",
        details: `This opportunity requires ${setAside} certification, which you don't have`,
      };
    }
  }

  // Unknown set-aside type
  return {
    status: "partial",
    score: 50,
    required: setAside,
    yours: certs.join(", ") || "None",
    details: "Set-aside requirement detected but unable to verify match automatically",
  };
}

/**
 * Check clearance level match
 */
function checkClearanceMatch(
  opportunity: SAMOpportunity,
  profile: CompanyProfile
): QualificationCheck {
  // Extract clearance requirement from description or title
  const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();

  const clearanceLevels = ["ts/sci", "top secret", "secret", "confidential"];
  let requiredClearance: string | null = null;

  for (const level of clearanceLevels) {
    if (text.includes(level)) {
      requiredClearance = level;
      break;
    }
  }

  if (!requiredClearance) {
    return {
      status: "not_applicable",
      score: 0,
      required: "None",
      yours: "N/A",
      details: "No security clearance requirement detected",
    };
  }

  const profileClearance = profile.clearance_level;

  if (!profileClearance || profileClearance === "none") {
    return {
      status: "fail",
      score: 0,
      required: requiredClearance,
      yours: "None",
      details: `This opportunity requires ${requiredClearance} clearance`,
    };
  }

  // Map clearance levels to hierarchy
  const clearanceHierarchy: { [key: string]: number } = {
    none: 0,
    confidential: 1,
    secret: 2,
    top_secret: 3,
    ts_sci: 4,
  };

  const requiredLevel = requiredClearance.includes("ts/sci")
    ? 4
    : requiredClearance.includes("top secret")
    ? 3
    : requiredClearance.includes("secret")
    ? 2
    : 1;

  const profileLevel = clearanceHierarchy[profileClearance] || 0;

  if (profileLevel >= requiredLevel) {
    return {
      status: "pass",
      score: 100,
      required: requiredClearance,
      yours: profileClearance.replace("_", " "),
      details: "Your clearance level meets or exceeds the requirement",
    };
  }

  return {
    status: "fail",
    score: 0,
    required: requiredClearance,
    yours: profileClearance.replace("_", " "),
    details: `Your clearance level (${profileClearance}) is below the required ${requiredClearance}`,
  };
}

/**
 * Check geographic coverage match
 */
function checkGeographicMatch(
  opportunity: SAMOpportunity,
  profile: CompanyProfile
): QualificationCheck {
  const oppState = opportunity.officeAddress?.state || opportunity.placeOfPerformance?.state;

  if (!oppState) {
    return {
      status: "not_applicable",
      score: 0,
      required: "Not specified",
      yours: "N/A",
      details: "No specific location requirement",
    };
  }

  const coverage = profile.geographic_coverage || [];

  if (coverage.includes(oppState)) {
    return {
      status: "pass",
      score: 100,
      required: oppState,
      yours: oppState,
      details: `Work location (${oppState}) is in your service area`,
    };
  }

  // Check if they serve neighboring states or nationwide
  if (coverage.length >= 40) {
    return {
      status: "pass",
      score: 90,
      required: oppState,
      yours: "Nationwide coverage",
      details: "You offer nationwide service coverage",
    };
  }

  if (coverage.length > 0) {
    return {
      status: "partial",
      score: 40,
      required: oppState,
      yours: coverage.slice(0, 3).join(", ") + (coverage.length > 3 ? "..." : ""),
      details: `Work location (${oppState}) is not in your current service area. Consider expansion.`,
    };
  }

  return {
    status: "partial",
    score: 30,
    required: oppState,
    yours: "Not specified",
    details: "No geographic coverage specified in your profile",
  };
}
