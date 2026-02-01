export async function getCurrentWeather(lat: number, lon: number) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        console.error("OpenWeatherMap API Key is missing, check .env file");
        return null;
    }

    // Current Weather Data APIのエンドポイント
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
        const res = await fetch(url, { cache: 'no-store' }); // 常に最新を取得
        if (!res.ok) {
            console.error("Weather API エラー:", await res.text());
            return null;
        }

        const data = await res.json();
        // 必要なデータだけ抽出
        return {
            temp: data.main.temp,       // 気温 (Celsius)
            weatherId: data.weather[0].id, // 天気ID (例: 800=Clear, 500=Rain)
            description: data.weather[0].main // "Clear", "Rain" など
        };
    } catch (error) {
        console.error("Weather API エラー:", error);
        return null;
    }
}