import { useApi } from "./useApi";
import { api } from "../lib/api";
import {
  createRestaurantData,
  getRestaurantDisplayData,
} from "../types/restaurant";

export function useRestaurants() {
  const {
    data,
    loading,
    error,
    execute: fetchRestaurants,
    isSuccess,
  } = useApi(api.getRestaurants, []);

  const restaurants = data
    ? data.map((item) => getRestaurantDisplayData(createRestaurantData(item)))
    : [];

  return {
    restaurants,
    loading,
    error,
    fetchRestaurants,
    isSuccess,
  };
}

export function useRestaurant(id) {
  const {
    data,
    loading,
    error,
    execute: fetchRestaurant,
  } = useApi(() => api.getRestaurant(id), [id]);

  const restaurant = data
    ? getRestaurantDisplayData(createRestaurantData(data))
    : null;

  return {
    restaurant,
    loading,
    error,
    fetchRestaurant,
  };
}
