import queryString from 'query-string';
import { matchRoutesToLocation, getMatch } from './matchRoutesToLocation';

export function simplifyArrayLanguages(languages) {
  return languages.map(language => (language.slug));
}

export function searchRouteForUrl(url) {
  let finalUrl = url;
  if (typeof url !== 'string') {
    finalUrl = url.pathname + url.search;
  }

  const routesConfig = configuration.get('routes');

  const { matchedExactRoutes, params } = matchRoutesToLocation(
    routesConfig,
    routesConfig.multiLanguage,
    finalUrl
  );

  const paramsDecoded = {};

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      paramsDecoded[key] = decodeURI(value);
    } else {
      paramsDecoded[key] = value;
    }
  });

  if (matchedExactRoutes.length === 0) {
    const message = `The route for url => ${finalUrl} not exists`;
    log.debug(message);
    throw new Error(message);
  }

  const searchUrl = queryString.extract(finalUrl);
  const finalParams = Object.assign({}, paramsDecoded, queryString.parse(searchUrl));

  const route = matchedExactRoutes[0];

  return { route, params: finalParams };
}


export function buildWithExactParameter(routes) {
  for (const route of routes.routes) {
    route.exact = true;
    if (route.routes) {
      buildWithExactParameter(route);
    }
  }
}

function getGeneratedName(routes, route, parentName) {
  if (typeof routes.parentName === 'string') {
    return `${routes.parentName}.${route.name}`;
  }

  if (typeof parentName === 'string') {
    return `${parentName}.${route.name}`;
  }

  return route.name;
}

function normalize(str, options) {
  let strNormalize = str.replace(/:\//g, '://');
  strNormalize = strNormalize.replace(/([^:\s])\/+/g, '$1/');
  if (!options.trailingSlash) {
    strNormalize = strNormalize.replace(/\/(\?|&|#[^!]|#$)/g, '$1');
  }
  strNormalize = strNormalize.replace(/(\?.+)\?/g, '$1&');

  return strNormalize;
}

/* eslint-disable prefer-rest-params, prefer-destructuring */
export function urlJoin() {
  let input = arguments;
  let options = {};

  if (typeof arguments[0] === 'object') {
    // new syntax with array and options
    input = arguments[0];
    options = arguments[1] || {};
  }

  const joined = [].slice.call(input, 0).join('/');
  return normalize(joined, options);
}
/* eslint-enable prefer-rest-params, prefer-destructuring */

export function isNecesaryTranslate(multiLanguage, actualLanguage) {
  if (multiLanguage.hideLanguage) {
    return false;
  }

  if (multiLanguage.defaultLanguage === actualLanguage && !multiLanguage.showDefaultLanguage) {
    return false;
  }

  return true;
}

export function getTranslatePath(path, multiLanguage, actualLanguage) {
  if (isNecesaryTranslate(multiLanguage, actualLanguage)) {
    const finalPath = urlJoin('', actualLanguage, path);
    return finalPath;
  }
  return path;
}

export function buildRoutesWithComputedNames(routes, parentName) {
  if (routes.routes) {
    for (const route of routes.routes) {
      route.calculateName = getGeneratedName(routes, route, parentName);
      if (route.routes && route.routes.length > 0) {
        buildRoutesWithComputedNames(route, route.calculateName);
      }
    }
  }
}

export function buildRouteWithPathTranslations(routes, multiLanguage) {
  if (routes.routes && multiLanguage) {
    for (const route of routes.routes) {
      if (typeof route.path !== 'undefined' && typeof route.path !== 'string') {
        const langs = Object.keys(route.path);
        for (const lang of langs) {
          route.path[lang] = getTranslatePath(
            route.path[lang], multiLanguage, lang
          );
        }
      }

      if (route.routes && route.routes.length > 0) {
        buildRouteWithPathTranslations(route, multiLanguage);
      }
    }
  }
}

function getParentName(routesConfig) {
  if (routesConfig.parentName && routesConfig.parentName !== '') {
    return routesConfig.parentName;
  }
  return '';
}

function genereteNameRoute(parent, route) {
  return route.name;
}

export function getPathsOfRoutes(routes, parent) {
  try {
    const paths = {};
    for (const route of routes) {
      const generatedName = genereteNameRoute(parent, route);
      if (route.routes && route.routes.length > 0) {
        paths[generatedName] = {
          ...(getPathsOfRoutes(route.routes, generatedName)),
          route,
        };
      } else {
        paths[generatedName] = { route };
      }
    }
    return paths;
  } catch (ex) {
    throw ex;
  }
}

export function generateTreeName(routesConfig) {
  const pathRoute = getParentName(routesConfig);
  const paths = getPathsOfRoutes(routesConfig.routes, pathRoute);
  if (pathRoute === '') {
    return paths;
  }
  return {
    [pathRoute]: paths,
  };
}

export function searchDomain(routes, route) {
  let domain = '';
  if (typeof routes.domain === 'string') {
    ({ domain } = routes);
  }

  const treeName = generateTreeName(routes);
  const paths = route.calculateName.split('.');

  let previosRoute = treeName;

  for (let i = 0; i < paths.length; ++i) {
    if (previosRoute[paths[i]].route && typeof previosRoute[paths[i]].route.domain === 'string') {
      domain = previosRoute[paths[i]].route.domain; // eslint-disable-line prefer-destructuring
    }

    previosRoute = previosRoute[paths[i]];
  }

  return domain;
}

function prospectPath(treeNames, pathOfName) {
  try {
    return pathOfName.reduce(
      (previousValue, actualValue) => previousValue[actualValue],
      treeNames);
  } catch (ex) {
    const name = pathOfName.join('.');
    throw Error(`The path with name ${name} not exists`);
  }
}

export function findRouteByName(name, routesConfig) {
  const treeNames = generateTreeName(routesConfig);
  const pathOfName = name.split('.');
  const goodPath = prospectPath(treeNames, pathOfName);
  if (goodPath) {
    return goodPath.route;
  }
  console.warn(`The path with name ${name} not exists`);
  return null;
}

export function getInternalizationPath(
  path,
  defaultLanguage,
  actualLanguage,
  showDefaultLanguage
) {
  if (typeof path === 'string') {
    return getTranslatePath(path, defaultLanguage, actualLanguage, false);
  }

  const simplePath = path[actualLanguage];
  return getTranslatePath(simplePath, defaultLanguage, actualLanguage, showDefaultLanguage);
}

export function buildMultiLanguageOptions() {
  return {
    languages: simplifyArrayLanguages(configuration.get('languages')),
    defaultLanguage: configuration.get('defaultLanguage'),
    showDefaultLanguage: configuration.get('showDefaultLanguage'),
    hideLanguage: configuration.get('hideLanguage'),
  };
}

export function getLanguageOfRoute(url) {
  const multiLanguage = buildMultiLanguageOptions();
  let cleanUrl = url;

  if (url.indexOf('/') === 0) {
    cleanUrl = url.substr(1);
  }

  const [withOutQuery] = cleanUrl.split('?');

  if (multiLanguage.hideLanguage) {
    const { route } = searchRouteForUrl(url);
    for (const [key, value] of Object.entries(route.path)) {
      const match = getMatch(url, '', value, true, true);
      if (match) {
        return key;
      }
    }
  }

  const [urlLocale] = withOutQuery.split('/');

  if (multiLanguage.languages.indexOf(urlLocale) > -1) {
    return urlLocale;
  }

  return multiLanguage.defaultLanguage;
}

export function getFullPath(path) {
  return urlJoin(configuration.get('url'), path);
}

export default null;
