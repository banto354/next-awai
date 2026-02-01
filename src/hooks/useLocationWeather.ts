import { useState, useEffect } from 'react';

type WeatherData = {
    temp: number;
    description: string;
    weatherId: number;
};

type LocationData = {
    lat: number;
    lng: number;
};

export function useLocationWeather() {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ブラウザで位置情報が使えるか確認
        if (typeof window === "undefined" || !("geolocation" in navigator)) {
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                try {
                    const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
                    if (res.ok) {
                        const data = await res.json();
                        setWeather({
                            temp: Math.round(data.temp),
                            weatherId: data.weatherId,
                            description: data.main
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch weather:", error);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLoading(false);
            }
        );
    }, []);

    return { location, weather, loading };
}