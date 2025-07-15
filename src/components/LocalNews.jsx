import React, { useState, useEffect } from "react";
import {
  Clock,
  ExternalLink,
  Calendar,
  User,
  ChevronDown,
  Search,
  Filter,
  RefreshCw,
  Globe,
} from "lucide-react";
import { getUserCountry, getNewsData, getMockNewsData } from "../services/api.js"; // Import from api.js

const LocalNews = ({ coords }) => {
  const [allNews, setAllNews] = useState([]);
  const [displayedNews, setDisplayedNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [apiStatus, setApiStatus] = useState("loading"); // loading, success, fallback

  const ITEMS_PER_PAGE = 8;

  const categories = [
    { value: "general", label: "General" },
    { value: "business", label: "Business" },
    { value: "technology", label: "Technology" },
    { value: "health", label: "Health" },
    { value: "science", label: "Science" },
    { value: "sports", label: "Sports" },
    { value: "entertainment", label: "Entertainment" },
  ];

  const loadNews = async (category = selectedCategory, query = searchQuery) => {
    setLoading(true);
    setError(null);
    setApiStatus("loading");

    try {
      // Get user location if not already available
      if (!userLocation) {
        const location = await getUserCountry();
        setUserLocation(location);
      }

      const countryCode = userLocation?.countryCode || "us";
      const data = await getNewsData(countryCode, category, query);

      setAllNews(data.articles);
      setDisplayedNews(data.articles.slice(0, ITEMS_PER_PAGE));
      setCurrentIndex(ITEMS_PER_PAGE);
      setHasLoaded(true);
      setApiStatus(data.source === "mock" ? "fallback" : "success");
    } catch (err) {
      console.error("News fetch error:", err);
      setError("Failed to fetch news. Using offline data.");
      setApiStatus("fallback");

      // Use mock data as fallback
      const mockData = getMockNewsData();
      setAllNews(mockData.articles);
      setDisplayedNews(mockData.articles.slice(0, ITEMS_PER_PAGE));
      setCurrentIndex(ITEMS_PER_PAGE);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNews = () => {
    setLoadingMore(true);

    setTimeout(() => {
      const nextItems = allNews.slice(
        currentIndex,
        currentIndex + ITEMS_PER_PAGE
      );
      setDisplayedNews((prev) => [...prev, ...nextItems]);
      setCurrentIndex((prev) => prev + ITEMS_PER_PAGE);
      setLoadingMore(false);
    }, 500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setHasLoaded(false);
    setDisplayedNews([]);
    setCurrentIndex(0);
    loadNews(selectedCategory, searchQuery);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setHasLoaded(false);
    setDisplayedNews([]);
    setCurrentIndex(0);
    loadNews(category, searchQuery);
  };

  const handleRefresh = () => {
    setHasLoaded(false);
    setDisplayedNews([]);
    setCurrentIndex(0);
    setError(null);
    setUserLocation(null); // Reset location to get fresh data
    loadNews();
  };

  // Auto-load news on component mount
  useEffect(() => {
    if (!hasLoaded) {
      loadNews();
    }
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = Math.floor((now - publishedDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return formatDate(dateString);
  };

  const handleArticleClick = (url) => {
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const hasMoreNews = currentIndex < allNews.length;

  const getStatusColor = () => {
    switch (apiStatus) {
      case "success":
        return "text-green-100";
      case "fallback":
        return "text-yellow-100";
      default:
        return "text-blue-100";
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case "success":
        return "Live News";
      case "fallback":
        return "Demo Mode";
      default:
        return "Loading...";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Latest News</h2>
              <div className="flex items-center gap-2 text-sm">
                <p className="text-blue-100">
                  {userLocation ? `${userLocation.country}` : "Global"} •{" "}
                  {getStatusText()}
                </p>
                <div
                  className={`w-2 h-2 rounded-full ${
                    apiStatus === "success"
                      ? "bg-green-400"
                      : apiStatus === "fallback"
                      ? "bg-yellow-400"
                      : "bg-blue-400"
                  }`}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Refresh news"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Toggle filters"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e);
                    }
                  }}
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === category.value
                      ? "bg-white text-blue-600"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasLoaded && (
          <div className="text-right mt-4">
            <div className="text-sm text-blue-100">
              Showing {displayedNews.length} of {allNews.length} articles
            </div>
            {apiStatus === "fallback" && (
              <div className="text-xs text-yellow-100 mt-1">
                ⚠️ Add your GNews API key for live news
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <Globe className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {displayedNews.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedNews.map((article, i) => (
                <article
                  key={i}
                  className="group cursor-pointer border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-white"
                  onClick={() => handleArticleClick(article.url)}
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    {article.urlToImage && !imageErrors[i] ? (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(i)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <span className="text-4xl text-gray-400">📰</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>

                    {article.source?.name && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        {truncateText(article.source.name, 15)}
                      </div>
                    )}

                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {formatTimeAgo(article.publishedAt)}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-3 text-sm leading-snug">
                      {truncateText(article.title, 80)}
                    </h3>

                    {article.description && (
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                        {truncateText(article.description, 100)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {hasMoreNews && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreNews}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More News (
                      {Math.min(
                        ITEMS_PER_PAGE,
                        allNews.length - currentIndex
                      )}{" "}
                      more)
                    </>
                  )}
                </button>
              </div>
            )}

            {loadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {displayedNews.length === 0 && hasLoaded && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No news articles found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or category filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalNews;
