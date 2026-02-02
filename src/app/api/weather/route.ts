import { NextResponse } from 'next/server';
import { getCurrentWeather } from '@/lib/weather';

// export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    console.log("API Debug: latStr=", latStr, "lonStr=", lonStr);
    if (!latStr || !lonStr) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 文字列を数値に変換
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    console.log("API Debug: parsed lat=", lat, "lon=", lon);
    console.log("API Debug: API Key exists?", !!process.env.OPENWEATHER_API_KEY);
    // ★ここで共通関数を呼ぶ（APIキーの処理は関数内にあるので気にしなくてOK）
    const weatherData = await getCurrentWeather(lat, lon);

    if (!weatherData) {
        console.log("API Debug: Failed to fetch weather");
        return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
    }

    // 必要ならクライアント向けに少し整形して返す
    return NextResponse.json({
        temp: weatherData.temp,
        main: weatherData.description, // または weatherData.main (APIの戻り値に合わせて調整)
        weatherId: weatherData.weatherId
    });
}