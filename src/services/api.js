// API Configuration
const API_CONFIG = {
  weather: {
    baseUrl: "https://api.openweathermap.org/data/2.5",
    key: process.env.REACT_APP_WEATHER_API_KEY || "2fb100196f332c47ab247d472ce11edd",
  },
  news: {
    baseUrl: "https://newsapi.org/v2",
    key: process.env.REACT_APP_NEWS_API_KEY || "285a0a0a4990450f912b15b90e783319",
  },
};

// Weather API Service
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
    // Fallback to mock data if API fails
    return getMockWeatherData();
  }
};

// News API Service
export const getNewsData = async () => {
  try {
    const url = `${API_CONFIG.news.baseUrl}/top-headlines?country=in&apiKey=${API_CONFIG.news.key}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("News API request failed");
    }

    const data = await response.json();

    return {
      articles: data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
      })),
    };
  } catch (error) {
    console.error("News API error:", error);
    return getMockNewsData();
  }
};


// Mock data fallbacks
const getMockWeatherData = () => ({
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

const getMockNewsData = () => ({
  articles: [
    {
      title: "Tech Innovation Reaches New Heights in 2025",
      description:
        "Latest developments in artificial intelligence and quantum computing are reshaping the technology landscape.",
      url: "#",
      urlToImage: null,
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Climate Change: New Solutions Emerge",
      description:
        "Scientists discover breakthrough methods for carbon capture and renewable energy storage.",
      url: "#",
      urlToImage: null,
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Space Exploration Milestone Achieved",
      description:
        "International space agencies collaborate on unprecedented deep space mission.",
      url: "#",
      urlToImage: null,
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Healthcare Revolution Through AI",
      description:
        "Machine learning algorithms are transforming medical diagnosis and treatment.",
      url: "#",
      urlToImage: null,
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Sustainable Transportation Solutions",
      description:
        "Electric vehicles and smart city infrastructure are reducing carbon emissions globally.",
      url: "#",
      urlToImage: null,
      publishedAt: new Date().toISOString(),
    },
  ],
});