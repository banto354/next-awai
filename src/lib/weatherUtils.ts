// 天気IDを文字列に変換する簡易ヘルパー
export function getWeatherLabel(weatherId: number | null): string {
    if (!weatherId) return "天気不明";
    // OpenWeatherMapのID範囲に基づく判定
    // https://openweathermap.org/weather-conditions
    if (weatherId >= 200 && weatherId < 300) return "雷雨";
    if (weatherId >= 300 && weatherId < 500) return "霧雨";
    if (weatherId >= 500 && weatherId < 600) return "雨";
    if (weatherId >= 600 && weatherId < 700) return "雪";
    if (weatherId >= 700 && weatherId < 800) return "霧"; // Mist, Smoke, Haze etc.
    if (weatherId === 800) return "晴";
    if (weatherId > 800) return "曇";
    return "天気不明";
}