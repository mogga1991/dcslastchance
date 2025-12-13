"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Newspaper,
  ExternalLink,
  TrendingUp,
  Calendar,
  Tag,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  category: string;
  imageUrl?: string;
}

interface NewsStats {
  total: number;
  governmentContracting: number;
  realEstate: number;
  thisWeek: number;
}

export default function MarketNewsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [stats, setStats] = useState<NewsStats>({
    total: 0,
    governmentContracting: 0,
    realEstate: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to fetch news");
      }
    } catch (err) {
      setError("An error occurred while fetching news");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchNews();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, categoryFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "GSA Leasing":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "Government Contracting":
        return "bg-purple-50 text-purple-700 border-purple-300";
      case "Real Estate":
        return "bg-green-50 text-green-700 border-green-300";
      case "Compliance":
        return "bg-orange-50 text-orange-700 border-orange-300";
      case "Policy":
        return "bg-indigo-50 text-indigo-700 border-indigo-300";
      case "Technology":
        return "bg-cyan-50 text-cyan-700 border-cyan-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    } else {
      return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    }
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-semibold tracking-tight">Market News</h1>
          </div>
          <Button
            onClick={fetchNews}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground">
          Stay updated with relevant news about government contracting, GSA leasing, and commercial real estate
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <CardDescription>Total Articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900">
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.total}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-2">
            <CardDescription>Government Contracting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-purple-600">
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.governmentContracting}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-2">
            <CardDescription>Real Estate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-green-600">
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.realEstate}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-orange-600 flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <TrendingUp className="h-6 w-6" />
                  {stats.thisWeek}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-52 border-gray-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="GSA Leasing">GSA Leasing</SelectItem>
              <SelectItem value="Government Contracting">Government Contracting</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="Policy">Policy</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-44 border-gray-300">
              <SelectValue placeholder="Most Recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="py-6">
            <p className="text-red-700 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && articles.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-gray-200">
              <CardHeader>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* News Articles Grid */}
      {!loading || articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedArticles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-lg transition-all cursor-pointer group border-gray-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getCategoryColor(article.category)}`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-base">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    {article.source}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:text-blue-600 transition-colors"
                    onClick={() => window.open(article.url, "_blank")}
                  >
                    Read More
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* No Results */}
      {!loading && sortedArticles.length === 0 && !error && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-12 text-center">
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
