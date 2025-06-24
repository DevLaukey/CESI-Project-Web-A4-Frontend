import { useState, useEffect, useCallback, useRef } from "react";

export const useLocationService = (apiKey) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use ref to store cache across re-renders
  const cacheRef = useRef(new Map());

  // Helper function for API requests
  const makeRequest = useCallback(
    async (endpoint, params) => {
      const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;

      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey);
      }

      try {
        const url = `https://maps.googleapis.com/maps/api/place/${endpoint}?${new URLSearchParams(
          {
            ...params,
            key: apiKey,
          }
        )}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          throw new Error(`Places API error: ${data.status}`);
        }

        cacheRef.current.set(cacheKey, data);
        return data;
      } catch (error) {
        console.error("Places API request failed:", error);
        throw error;
      }
    },
    [apiKey]
  );

  // Get countries function
  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca2"
      );
      const countries = await response.json();

      return countries
        .map((country) => ({
          name: country.name.common,
          code: country.cca2,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      return [];
    }
  }, []);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoading(true);
      setError(null);
      try {
        const countriesData = await fetchCountries();
        setCountries(countriesData);
      } catch (err) {
        setError("Failed to load countries");
        console.error("Failed to load countries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, [fetchCountries]);

  // Load states for country
  const loadStatesForCountry = useCallback(
    async (countryName) => {
      if (!countryName) {
        setStates([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await makeRequest("textsearch/json", {
          query: `states in ${countryName}`,
          type: "administrative_area_level_1",
        });

        const statesData =
          data.results?.map((place) => ({
            name: place.name,
            placeId: place.place_id,
            formattedAddress: place.formatted_address,
          })) || [];

        setStates(statesData);
      } catch (err) {
        setError("Failed to load states");
        setStates([]);
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  // Load cities for state
  const loadCitiesForState = useCallback(
    async (stateName, countryName) => {
      if (!stateName || !countryName) {
        setCities([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await makeRequest("textsearch/json", {
          query: `cities in ${stateName} ${countryName}`,
          type: "locality",
        });

        const citiesData =
          data.results?.map((place) => ({
            name: place.name,
            placeId: place.place_id,
            formattedAddress: place.formatted_address,
          })) || [];

        setCities(citiesData);
      } catch (err) {
        setError("Failed to load cities");
        setCities([]);
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  // Autocomplete function
  const getAutocompleteSuggestions = useCallback(
    async (input, types = ["(regions)"]) => {
      try {
        const data = await makeRequest("autocomplete/json", {
          input,
          types: types.join("|"),
        });

        return (
          data.predictions?.map((prediction) => ({
            description: prediction.description,
            placeId: prediction.place_id,
            types: prediction.types,
          })) || []
        );
      } catch (err) {
        console.error("Failed to get autocomplete suggestions:", err);
        return [];
      }
    },
    [makeRequest]
  );

  // Clear cache function
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    countries,
    states,
    cities,
    loading,
    error,
    loadStatesForCountry,
    loadCitiesForState,
    getAutocompleteSuggestions,
    clearCache,
  };
};
