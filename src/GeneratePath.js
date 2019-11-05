import queryString from 'query-string';
import pathToRegexp, { compile } from 'path-to-regexp';
import {
  urlJoin, findRouteByName, searchDomain, getTranslatePath,
} from './utils';

export default class GeneratePath {
  constructor(routes) {
    this.routes = routes;
  }

  generateQueryString(parameters) {
    return queryString.stringify(parameters, { arrayFormat: 'bracket' });
  }


  removePathParameters(parameters, parametersNotDelete) {
    const cloneParameters = Object.assign({}, parameters);
    const keys = Object.keys(parameters);
    for (const parameter of keys) {
      if (parametersNotDelete.indexOf(parameter) === -1) {
        delete cloneParameters[parameter];
      }
    }
    return cloneParameters;
  }

  getPathOfRoute(route, options) {
    let { path } = route;
    if (typeof route.path !== 'string') {
      if (typeof options.language === 'undefined') {
        throw Error(
          'If you defined a multilanguage path you must send a laguange in parameters option'
        );
      }

      if (this.routes.multiLanguage.languages.indexOf(options.language) === -1) {
        throw Error(`You send an invalid language => ${options.language}`);
      }

      path = route.path[options.language];
    }
    return path;
  }

  concatenateLanguage(path, language) {
    return getTranslatePath(path, this.routes.multiLanguage, language);
  }

  removePort80(domain) {
    const domainParts = domain.split(':');
    const port = domainParts[domainParts.length - 1];
    if (!Number.isNaN(port) && port === '80') {
      const newDomain = domainParts.slice(0, domainParts.length - 1).join(':');
      return newDomain;
    }
    return domain;
  }

  concatenateDomain(path, options) {
    const { domain, absolute } = options;
    if (absolute) {
      return this.removePort80(domain) + path;
    }
    return path;
  }

  buildPathWithRoute(route, parameters = {},
    options = {
      absolute: false,
      showDefaultLanguage: true,
    },
    hash = null,
  ) {
    if (!route.path) {
      return urlJoin('/', this.generateQueryString(parameters));
    }

    const path = this.getPathOfRoute(route, options);

    const parametersOfPath = [];
    pathToRegexp(path, parametersOfPath);

    const parametersOfPathSimple = parametersOfPath.map(parameter => parameter.name);
    const parametersNameQuery =
      Object.keys(parameters).filter(parameter => parametersOfPathSimple.indexOf(parameter) === -1);

    const searchParameters = this.removePathParameters(parameters, parametersNameQuery);

    const toPath = compile(path);

    let finalPath = toPath(parameters);
    if (Object.keys(searchParameters).length > 0) {
      finalPath = `${finalPath}?${this.generateQueryString(searchParameters)}`;
    }

    if (typeof route.path !== 'string') {
      finalPath = this.concatenateLanguage(finalPath, options.language);
    }

    if (typeof hash === 'string' && hash && hash !== '') {
      finalPath = `${finalPath}#${hash}`;
    }

    return this.concatenateDomain(finalPath, options);
  }

  buildOptionsWithRoutesConf(routes, route) {
    return {
      domain: searchDomain(routes, route),
    };
  }

  buildPathWithRoutes(
    name, parameters = {},
    options = {
      absolute: false,
    },
    hash = null,
  ) {
    const route = findRouteByName(name, this.routes);

    if (!route) {
      return '';
    }

    const finalOptions = Object.assign(
      options, this.buildOptionsWithRoutesConf(this.routes, route)
    );
    return this.buildPathWithRoute(route, parameters, finalOptions, hash);
  }
}
