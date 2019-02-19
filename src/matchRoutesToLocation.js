import { matchPath } from 'react-router';
import queryString from 'query-string';

const mergePatterns = (a, b) => {
  const finalPattern = a[a.length - 1] === '/' && b[0] === '/' ?
    `${a.slice(0, a.length - 1)}${b}` :
    `${a}${b}`;
  return finalPattern;
};

function removeQueryString(location) {
  const query = queryString.extract(location);
  if (query && query !== '') {
    return location.substr(0, location.indexOf(query) - 1);
  }
  return location;
}

export function getMatch(location, parentPattern, path, exact, strict) {
  const nestedPattern = mergePatterns(parentPattern, path || '');

  const match = matchPath(
    removeQueryString(location), {
      path: nestedPattern,
      exact,
      strict,
    }
  );

  return match;
}

function buildMatch(parentPattern, route, location) {
  if (!route.path) {
    return true;
  }

  const { exact = false, strict = false } = route;

  if (typeof route.path === 'string') {
    const match = getMatch(location, parentPattern, route.path, exact, strict);
    return match;
  }

  const langs = Object.keys(route.path);

  for (const lang of langs) {
    const path = route.path[lang];
    const match = getMatch(location, parentPattern, path, exact, strict);
    if (match) {
      return match;
    }
  }

  return false;
}

function matchRoutesToLocation(
  routesConfig, multiLanguage, location, matchedRoutes = [],
  matchedExactRoutes = [], params = {}, parentPattern = ''
) {
  const { defaultLanguage, languages } = multiLanguage;

  routesConfig.routes.forEach((route) => {
    const match = buildMatch(
      parentPattern, route, location,
      defaultLanguage, languages
    );

    if (match) {
      matchedRoutes.push(route);
      if (match.isExact) {
        matchedExactRoutes.push(route);
      }

      if (match.params) {
        Object.keys(match.params).forEach(key => params[key] = match.params[key]); // eslint-disable-line
      }
    }

    if (route.routes) {
      const nestedPattern = mergePatterns(parentPattern, route.path || '');
      const routeCloned = Object.assign({
        defaultLanguage,
        languages,
      }, route);

      matchRoutesToLocation(
        routeCloned, multiLanguage, location, matchedRoutes,
        matchedExactRoutes, params,
        nestedPattern);
    }
  });

  return { matchedRoutes, matchedExactRoutes, params };
}

export default matchRoutesToLocation;
