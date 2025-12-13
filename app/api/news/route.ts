import { NextResponse } from "next/server";

const NEWS_API_KEY = "ae9fedd45109461eb546b5535f03aa6a";
const GOVINFO_API_KEY = "dImMBTFfAijSwAHXPChO608wAYWH8SAlb5UmsZQF";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";

    // Fetch from NewsAPI - focus on government contracting, real estate, policy news
    const newsApiPromises = [
      // Government contracting news
      fetch(
        `https://newsapi.org/v2/everything?q=government+contracting+OR+federal+contracts+OR+GSA&from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
      ),
      // Real estate and leasing news
      fetch(
        `https://newsapi.org/v2/everything?q=commercial+real+estate+OR+federal+leasing+OR+office+space&from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
      ),
      // Policy and compliance news
      fetch(
        `https://newsapi.org/v2/everything?q=federal+policy+OR+government+regulation+OR+compliance&from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
      ),
    ];

    // Fetch from GovInfo API - get recent collections
    const govInfoPromise = fetch(
      `https://api.govinfo.gov/collections?api_key=${GOVINFO_API_KEY}`
    );

    const [contractingRes, realEstateRes, policyRes, govInfoRes] =
      await Promise.all([...newsApiPromises, govInfoPromise]);

    const [contractingData, realEstateData, policyData, govInfoData] =
      await Promise.all([
        contractingRes.json(),
        realEstateRes.json(),
        policyRes.json(),
        govInfoRes.json(),
      ]);

    // Process NewsAPI articles
    const newsArticles: NewsArticle[] = [];

    // Add contracting articles
    if (contractingData.articles) {
      contractingData.articles.slice(0, 10).forEach((article: any, index: number) => {
        newsArticles.push({
          id: `news-contracting-${index}`,
          title: article.title || "Untitled",
          description: article.description || article.content || "No description available",
          source: article.source.name || "Unknown Source",
          publishedAt: article.publishedAt,
          url: article.url,
          category: "Government Contracting",
          imageUrl: article.urlToImage,
        });
      });
    }

    // Add real estate articles
    if (realEstateData.articles) {
      realEstateData.articles.slice(0, 8).forEach((article: any, index: number) => {
        newsArticles.push({
          id: `news-realestate-${index}`,
          title: article.title || "Untitled",
          description: article.description || article.content || "No description available",
          source: article.source.name || "Unknown Source",
          publishedAt: article.publishedAt,
          url: article.url,
          category: "Real Estate",
          imageUrl: article.urlToImage,
        });
      });
    }

    // Add policy articles
    if (policyData.articles) {
      policyData.articles.slice(0, 8).forEach((article: any, index: number) => {
        newsArticles.push({
          id: `news-policy-${index}`,
          title: article.title || "Untitled",
          description: article.description || article.content || "No description available",
          source: article.source.name || "Unknown Source",
          publishedAt: article.publishedAt,
          url: article.url,
          category: "Policy",
          imageUrl: article.urlToImage,
        });
      });
    }

    // Process GovInfo collections
    if (govInfoData.collections) {
      govInfoData.collections.slice(0, 5).forEach((collection: any, index: number) => {
        newsArticles.push({
          id: `govinfo-${index}`,
          title: collection.collectionName || "Government Document",
          description: `Official government collection: ${collection.collectionName}. Contains ${collection.packageCount} packages.`,
          source: "GovInfo.gov",
          publishedAt: new Date().toISOString(),
          url: `https://www.govinfo.gov/app/collection/${collection.collectionCode}`,
          category: "GSA Leasing",
        });
      });
    }

    // Sort by date (most recent first)
    newsArticles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Apply filters
    let filteredArticles = newsArticles;

    if (category !== "all") {
      filteredArticles = filteredArticles.filter(
        (article) => article.category === category
      );
    }

    if (search) {
      filteredArticles = filteredArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          article.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate stats
    const stats = {
      total: newsArticles.length,
      governmentContracting: newsArticles.filter(
        (a) => a.category === "Government Contracting"
      ).length,
      realEstate: newsArticles.filter((a) => a.category === "Real Estate")
        .length,
      thisWeek: newsArticles.filter(
        (a) =>
          new Date(a.publishedAt).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
    };

    return NextResponse.json({
      success: true,
      articles: filteredArticles,
      stats,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news",
        articles: [],
        stats: { total: 0, governmentContracting: 0, realEstate: 0, thisWeek: 0 },
      },
      { status: 500 }
    );
  }
}
