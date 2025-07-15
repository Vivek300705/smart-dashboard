import React, { useState } from "react";
import { Clock, ExternalLink, Calendar, User, ChevronDown } from "lucide-react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { getNewsData } from "../services/api";

const LocalNews = ({ coords }) => {
  const [allNews, setAllNews] = useState([]);
  const [displayedNews, setDisplayedNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const ITEMS_PER_PAGE = 12; // Increased for better grid layout

  const loadNews = async () => {
    if (hasLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getNewsData();
      setAllNews(data.articles);
      setDisplayedNews(data.articles.slice(0, ITEMS_PER_PAGE));
      setCurrentIndex(ITEMS_PER_PAGE);
      setHasLoaded(true);
    } catch (err) {
      console.error("News fetch error:", err);
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNews = () => {
    setLoadingMore(true);

    // Simulate loading delay for better UX
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

  const [ref, isIntersecting] = useIntersectionObserver(loadNews, {
    threshold: 0.1,
  });

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
    setImageErrors((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const hasMoreNews = currentIndex < allNews.length;

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Latest News</h2>
              <p className="text-blue-100 text-sm">
                Stay updated with current events
              </p>
            </div>
          </div>
          {hasLoaded && (
            <div className="text-right">
              <div className="text-sm text-blue-100">
                Showing {displayedNews.length} of {allNews.length}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {!hasLoaded && !loading && (
          <div className="text-center py-12">
            <div className="animate-bounce mb-4 text-5xl">📰</div>
            <p className="text-gray-500 text-lg">
              Scroll down to load latest news...
            </p>
          </div>
        )}

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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setHasLoaded(false);
                setDisplayedNews([]);
                setCurrentIndex(0);
                loadNews();
              }}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {displayedNews.length > 0 && (
          <>
            {/* Square News Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedNews.map((article, i) => (
                <article
                  key={i}
                  className="group cursor-pointer border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-white"
                  onClick={() => handleArticleClick(article.url)}
                >
                  {/* Square Image Container */}
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

                    {/* Overlay for external link */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>

                    {/* Source badge */}
                    {article.source?.name && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        {truncateText(article.source.name, 15)}
                      </div>
                    )}

                    {/* Time badge */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {formatTimeAgo(article.publishedAt)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-3 text-sm leading-snug">
                      {truncateText(article.title, 80)}
                    </h3>

                    {article.description && (
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                        {truncateText(article.description, 100)}
                      </p>
                    )}

                    {/* Meta information */}
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

            {/* Load More Button */}
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

            {/* Loading More Indicator */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalNews;
