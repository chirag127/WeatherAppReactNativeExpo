import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import 'react-native-gesture-handler';

const Stack = createStackNavigator();
const API_KEY = "a3e4cd436cc2cbb0c907419be4f189cb";

function HomeScreen({ navigation }) {
    const [weather, setWeather] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
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
            <TouchableOpacity 
                style={styles.forecastButton}
                onPress={() => navigation.navigate('Forecast', { 
                    lat: weather.coord.lat, 
                    lon: weather.coord.lon 
                })}
            >
                <Text style={styles.forecastButtonText}>5-Day Forecast</Text>
            </TouchableOpacity>
        </View>
    );
}

function ForecastScreen({ route }) {
    const [forecast, setForecast] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const { lat, lon } = route.params;

    React.useEffect(() => {
        getForecast();
    }, []);

    async function getForecast() {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            );
            setForecast(response.data);
        } catch (err) {
            setError("Could not fetch forecast data");
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
            <Text style={styles.title}>5-Day Forecast</Text>
            {forecast && forecast.list
                .filter((item, index) => index % 8 === 0) // Get one reading per day
                .map((item, index) => (
                    <View key={index} style={styles.forecastItem}>
                        <Text style={styles.forecastDate}>
                            {new Date(item.dt * 1000).toLocaleDateString()}
                        </Text>
                        <Image
                            source={{
                                uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                            }}
                            style={styles.forecastIcon}
                        />
                        <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
                        <Text style={styles.forecastDesc}>{item.weather[0].description}</Text>
                    </View>
                ))}
        </View>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Current Weather" component={HomeScreen} />
                <Stack.Screen name="Forecast" component={ForecastScreen} />
            </Stack.Navigator>
        </NavigationContainer>
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
    forecastButton: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    forecastButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    forecastItem: {
        alignItems: "center",
        marginVertical: 10,
        padding: 10,
        backgroundColor: "white",
        borderRadius: 10,
        width: "80%",
    },
    forecastDate: {
        fontSize: 16,
        fontWeight: "bold",
    },
    forecastIcon: {
        width: 50,
        height: 50,
    },
    forecastTemp: {
        fontSize: 20,
        fontWeight: "bold",
    },
    forecastDesc: {
        fontSize: 16,
        textTransform: "capitalize",
    },
});
