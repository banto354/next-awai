import { NextResponse } from 'next/server';
import { getCurrentWeather } from '@/lib/weather';

// export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    console.log("API Debug: latStr=", latStr, "lonStr=", lonStr);

    // パラメータ存在チェック
    if (!latStr || !lonStr) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 文字列を数値に変換
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    // 数値バリデーション（NaNチェック + 範囲チェック）
    if (isNaN(lat) || isNaN(lon)) {
        return NextResponse.json({ error: 'Invalid number format' }, { status: 400 });
    }

    // 緯度: -90 〜 90、経度: -180 〜 180
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
    }

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