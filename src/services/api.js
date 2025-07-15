// API Configuration with GNews API as primary source
const API_CONFIG = {
  weather: {
    baseUrl: "https://api.openweathermap.org/data/2.5",
    key:
      process.env.REACT_APP_WEATHER_API_KEY ||
      "2fb100196f332c47ab247d472ce11edd",
  },
  news: {
    // GNews API (Primary source - Free tier: 100 requests/day, supports CORS)
    gnews: {
      baseUrl: "https://gnews.io/api/v4",
      key: process.env.REACT_APP_GNEWS_API_KEY || "YOUR_GNEWS_API_KEY", // Get from https://gnews.io/
    },
  },
  geolocation: {
    baseUrl: "https://ipapi.co/json/",
  },
};

// Country code mapping for GNews API
const COUNTRY_CODES = {
  "United States": "us",
  "United Kingdom": "gb",
  Canada: "ca",
  Australia: "au",
  India: "in",
  Germany: "de",
  France: "fr",
  Italy: "it",
  Spain: "es",
  Japan: "jp",
  China: "cn",
  Brazil: "br",
  Russia: "ru",
  Mexico: "mx",
  Netherlands: "nl",
  "South Korea": "kr",
  Singapore: "sg",
  // Add more as needed
};

// Get user's country from IP address
export const getUserCountry = async () => {
  try {
    const response = await fetch(API_CONFIG.geolocation.baseUrl);
    if (!response.ok) {
      throw new Error("Geolocation API request failed");
    }
    const data = await response.json();
    return {
      country: data.country_name,
      countryCode: data.country_code?.toLowerCase(),
      city: data.city,
      region: data.region,
    };
  } catch (error) {
    console.error("Geolocation API error:", error);
    return { country: "United States", countryCode: "us" };
  }
};

// GNews API Integration - Top Headlines
export const getTopHeadlines = async (userCountryCode = "us") => {
  try {
    const url = `${API_CONFIG.news.gnews.baseUrl}/top-headlines?country=${userCountryCode}&token=${API_CONFIG.news.gnews.key}&lang=en&max=50`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`GNews API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      articles: data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        source: { name: article.source.name },
      })),
      source: "gnews-headlines",
    };
  } catch (error) {
    console.error("GNews Headlines API error:", error);
    throw error;
  }
};

// GNews API Integration - Search by Category
export const getNewsByCategory = async (
  category = "general",
  userCountryCode = "us"
) => {
  try {
    const url = `${API_CONFIG.news.gnews.baseUrl}/top-headlines?country=${userCountryCode}&category=${category}&token=${API_CONFIG.news.gnews.key}&lang=en&max=50`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`GNews Category API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      articles: data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        source: { name: article.source.name },
        category: category,
      })),
      source: "gnews-category",
    };
  } catch (error) {
    console.error("GNews Category API error:", error);
    throw error;
  }
};

// GNews API Integration - Search by Keywords
export const searchNews = async (query, userCountryCode = "us") => {
  try {
    const url = `${API_CONFIG.news.gnews.baseUrl}/search?q=${encodeURIComponent(
      query
    )}&country=${userCountryCode}&token=${
      API_CONFIG.news.gnews.key
    }&lang=en&max=50`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`GNews Search API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      articles: data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.image,
        publishedAt: article.publishedAt,
        source: { name: article.source.name },
        query: query,
      })),
      source: "gnews-search",
    };
  } catch (error) {
    console.error("GNews Search API error:", error);
    throw error;
  }
};

// Main news function using GNews API
export const getNewsData = async (
  userCountryCode = null,
  category = null,
  searchQuery = null
) => {
  try {
    let countryCode = userCountryCode;

    // If no country code provided, detect it
    if (!countryCode) {
      const userLocation = await getUserCountry();
      countryCode = userLocation.countryCode || "us";
    }

    // Handle different types of news requests
    if (searchQuery) {
      return await searchNews(searchQuery, countryCode);
    } else if (category) {
      return await getNewsByCategory(category, countryCode);
    } else {
      return await getTopHeadlines(countryCode);
    }
  } catch (error) {
    console.error("GNews API failed:", error);
    return getMockNewsData();
  }
};

// Get news by multiple categories
export const getNewsByMultipleCategories = async (
  categories = ["general", "business", "technology"],
  userCountryCode = "us"
) => {
  try {
    const newsPromises = categories.map((category) =>
      getNewsByCategory(category, userCountryCode)
    );

    const results = await Promise.all(newsPromises);

    // Combine all articles from different categories
    const allArticles = results.flatMap((result) => result.articles);

    // Sort by publication date (newest first)
    allArticles.sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    return {
      articles: allArticles,
      source: "gnews-multiple-categories",
      categories: categories,
    };
  } catch (error) {
    console.error("Multiple categories news error:", error);
    return getMockNewsData();
  }
};

// Weather API Service (unchanged)
export const getWeatherData = async (lat, lon) => {
  try {
    const currentWeatherUrl = `${API_CONFIG.weather.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${API_CONFIG.weather.key}&units=metric`;
    const forecastUrl = `${API_CONFIG.weather.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${API_CONFIG.weather.key}&units=metric`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error("Weather API request failed");
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    return {
      current: {
        temp: Math.round(currentData.main.temp),
        feels_like: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        wind_speed: Math.round(currentData.wind.speed),
        visibility: Math.round(currentData.visibility / 1000),
        weather: currentData.weather,
      },
      location: {
        name: currentData.name,
        country: currentData.sys.country,
      },
      daily: forecastData.list
        .filter((item, index) => index % 8 === 0)
        .slice(0, 7)
        .map((item) => ({
          dt: item.dt * 1000,
          temp: {
            day: Math.round(item.main.temp),
            min: Math.round(item.main.temp_min),
            max: Math.round(item.main.temp_max),
          },
          weather: item.weather,
        })),
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return getMockWeatherData();
  }
};

// Mock data fallbacks
export const getMockWeatherData = () => ({
  current: {
    temp: Math.round(25 + Math.random() * 10),
    feels_like: Math.round(27 + Math.random() * 8),
    humidity: Math.round(60 + Math.random() * 30),
    wind_speed: Math.round(5 + Math.random() * 10),
    visibility: Math.round(8 + Math.random() * 2),
    weather: [
      {
        main: "Clear",
        description: "clear sky",
        icon: "01d",
      },
    ],
  },
  location: {
    name: "Demo Location",
    country: "US",
  },
  daily: Array.from({ length: 7 }, (_, i) => ({
    dt: Date.now() + i * 24 * 60 * 60 * 1000,
    temp: {
      day: Math.round(20 + Math.random() * 15),
      min: Math.round(15 + Math.random() * 10),
      max: Math.round(25 + Math.random() * 15),
    },
    weather: [
      {
        main: i % 2 === 0 ? "Clear" : "Clouds",
        description: i % 2 === 0 ? "clear sky" : "scattered clouds",
      },
    ],
  })),
});

export const getMockNewsData = () => ({
  articles: [
    {
      title: "Tech Innovation Reaches New Heights in 2025",
      description:
        "Latest developments in artificial intelligence and quantum computing are reshaping the technology landscape.",
      url: "https://example.com/tech-news",
      urlToImage:
        "https://via.placeholder.com/400x300/0066cc/ffffff?text=Tech+News",
      publishedAt: new Date().toISOString(),
      source: { name: "Tech Today" },
    },
    {
      title: "Climate Change: New Solutions Emerge",
      description:
        "Scientists discover breakthrough methods for carbon capture and renewable energy storage.",
      url: "https://example.com/climate-news",
      urlToImage:
        "https://via.placeholder.com/400x300/00aa44/ffffff?text=Climate+News",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: { name: "Environment Weekly" },
    },
    {
      title: "Space Exploration Milestone Achieved",
      description:
        "International space agencies collaborate on unprecedented deep space mission.",
      url: "https://example.com/space-news",
      urlToImage:
        "https://via.placeholder.com/400x300/6600cc/ffffff?text=Space+News",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: { name: "Space Chronicle" },
    },
  ],
  source: "mock",
});

// Enhanced function to get both weather and news based on user location
export const getLocationBasedData = async (
  newsCategory = null,
  searchQuery = null
) => {
  try {
    // Get user's location
    const userLocation = await getUserCountry();

    // Get weather data using browser geolocation if available
    let weatherData;
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
          });
        });
        weatherData = await getWeatherData(
          position.coords.latitude,
          position.coords.longitude
        );
      } catch (geoError) {
        console.warn("Geolocation failed:", geoError);
        weatherData = getMockWeatherData();
      }
    } else {
      weatherData = getMockWeatherData();
    }

    // Get news data for user's country
    const newsData = await getNewsData(
      userLocation.countryCode,
      newsCategory,
      searchQuery
    );

    return {
      weather: weatherData,
      news: newsData,
      location: userLocation,
    };
  } catch (error) {
    console.error("Location-based data error:", error);
    return {
      weather: getMockWeatherData(),
      news: getMockNewsData(),
      location: { country: "United States", countryCode: "us" },
    };
  }
};
