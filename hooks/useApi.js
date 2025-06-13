import { useState, useEffect, useCallback } from "react";
import { createApiState, API_STATUS } from "../types/api";

export function useApi(apiFunction, dependencies = []) {
  const [state, setState] = useState(createApiState());

  const execute = useCallback(
    async (...args) => {
      setState((prev) => ({
        ...prev,
        status: API_STATUS.LOADING,
        loading: true,
        error: null,
      }));

      try {
        const data = await apiFunction(...args);
        setState({
          data,
          status: API_STATUS.SUCCESS,
          loading: false,
          error: null,
        });
        return data;
      } catch (error) {
        setState({
          data: null,
          status: API_STATUS.ERROR,
          loading: false,
          error: error.message || "An error occurred",
        });
        throw error;
      }
    },
    [apiFunction]
  );

  useEffect(() => {
    if (dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  const reset = useCallback(() => {
    setState(createApiState());
  }, []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.loading,
    isSuccess: state.status === API_STATUS.SUCCESS,
    isError: state.status === API_STATUS.ERROR,
    isIdle: state.status === API_STATUS.IDLE,
  };
}
