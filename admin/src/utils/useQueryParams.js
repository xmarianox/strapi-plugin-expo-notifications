import { useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { parse, stringify } from "qs";

const useQueryParams = (initialParams) => {
  const { search } = useLocation();
  const navigate = useNavigate();

  const query = useMemo(() => {
    const searchQuery = search.substring(1);

    if (!search) {
      return initialParams;
    }

    return parse(searchQuery);
  }, [search, initialParams]);

  const setQuery = useCallback(
    (nextParams, method = "push") => {
      let nextQuery = { ...query };

      if (method === "remove") {
        Object.keys(nextParams).forEach((key) => {
          delete nextQuery[key];
        });
      } else {
        nextQuery = { ...query, ...nextParams };
      }

      navigate({ search: stringify(nextQuery, { encode: false }) });
    },
    [navigate, query]
  );

  return [{ query, rawQuery: search }, setQuery];
};

export default useQueryParams;
