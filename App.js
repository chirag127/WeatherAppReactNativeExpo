import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

const API_KEY = "a3e4cd436cc2cbb0c907419be4f189cb";

export default function App() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // cost 5 days weather

    useEffect(() => {
        getWeather();
    }, []);

    async function getWeather() {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError("Permission to access location was denied");
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            );

            setWeather(response.data);
        } catch (err) {
            setError("Could not fetch weather data");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00f" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.city}>{weather.name}</Text>
            <Image
                source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                }}
                style={styles.weatherIcon}
            />
            <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
            <Text style={styles.desc}>{weather.weather[0].description}</Text>

            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
    },
    city: {
        fontSize: 30,
        fontWeight: "bold",
    },
    weatherIcon: {
        width: 100,
        height: 100,
    },
    temp: {
        fontSize: 40,
        fontWeight: "bold",
    },
    desc: {
        fontSize: 20,
        textTransform: "capitalize",
    },
    error: {
        fontSize: 18,
        color: "red",
    },
});
