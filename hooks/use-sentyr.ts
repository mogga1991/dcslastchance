"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { CompanyProfile, Analysis, AnalysisCredit } from "@/lib/services";

// ============================================
// COMPANY PROFILE HOOK
// ============================================

export function useCompanyProfile() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoaded || !user) {
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user, isUserLoaded]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else if (response.status === 404) {
        setProfile(null);
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (data: Omit<CompanyProfile, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      const result = await response.json();
      setProfile(result.profile);
      return result.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Omit<CompanyProfile, "id" | "user_id" | "created_at" | "updated_at">>) => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      setProfile(result.profile);
      return result.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refetch: fetchProfile,
  };
}

// ============================================
// ANALYSES HOOK
// ============================================

export function useAnalyses() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoaded || !user) {
      setLoading(false);
      return;
    }

    fetchAnalyses();
  }, [user, isUserLoaded]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analyses");
      if (!response.ok) {
        throw new Error("Failed to fetch analyses");
      }
      const data = await response.json();
      setAnalyses(data.analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analyses");
    } finally {
      setLoading(false);
    }
  };

  const createAnalysis = async (data: {
    document_type: string;
    title: string;
    file_url?: string;
  }) => {
    try {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create analysis");
      }

      const result = await response.json();
      setAnalyses((prev) => [result.analysis, ...prev]);
      return result.analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
      throw err;
    }
  };

  return {
    analyses,
    loading,
    error,
    createAnalysis,
    refetch: fetchAnalyses,
  };
}

// ============================================
// SINGLE ANALYSIS HOOK
// ============================================

export function useAnalysis(id: string) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analyses/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analysis");
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    loading,
    error,
    refetch: fetchAnalysis,
  };
}

// ============================================
// CREDITS HOOK
// ============================================

export function useCredits() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [credits, setCredits] = useState<AnalysisCredit[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoaded || !user) {
      setLoading(false);
      return;
    }

    fetchCredits();
  }, [user, isUserLoaded]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/credits");
      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }
      const data = await response.json();
      setCredits(data.credits);
      setTotalCredits(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credits");
    } finally {
      setLoading(false);
    }
  };

  return {
    credits,
    totalCredits,
    loading,
    error,
    refetch: fetchCredits,
  };
}

// ============================================
// DASHBOARD STATS HOOK
// ============================================

export function useDashboardStats() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [stats, setStats] = useState({
    total_analyses: 0,
    completed_analyses: 0,
    processing_analyses: 0,
    strong_bids: 0,
    credits_remaining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoaded || !user) {
      setLoading(false);
      return;
    }

    fetchStats();
  }, [user, isUserLoaded]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
