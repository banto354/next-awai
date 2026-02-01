// 天気IDを文字列に変換する簡易ヘルパー
export function getWeatherLabel(weatherId: number | null): string {
    if (!weatherId) return "Unknown";

    // OpenWeatherMapのID範囲に基づく判定
    // https://openweathermap.org/weather-conditions
    if (weatherId >= 200 && weatherId < 300) return "Thunderstorm";
    if (weatherId >= 300 && weatherId < 500) return "Drizzle";
    if (weatherId >= 500 && weatherId < 600) return "Rain";
    if (weatherId >= 600 && weatherId < 700) return "Snow";
    if (weatherId >= 700 && weatherId < 800) return "Fog"; // Mist, Smoke, Haze etc.
    if (weatherId === 800) return "Clear";
    if (weatherId > 800) return "Cloudy";

    return "Unknown";
}