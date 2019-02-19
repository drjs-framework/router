import { getInternalizationPath } from './utils';
import GenerateRoutes from './GenerateRoutes';

export default class ListRoutes {
  constructor(routes, defaultLanguage, languages) {
    const generateRoutes = new GenerateRoutes(routes, { defaultLanguage, languages });
    this.routes = generateRoutes.build();
    this.defaultLanguage = defaultLanguage;
    this.languages = languages;
  }

  routeToStr(route, language) {
    return {
      path: getInternalizationPath(
        route.path,
        this.defaultLanguage,
        language,
        route.showDefaultLanguage
      ),
      language,
      name: route.calculateName,
    };
  }

  transformRoutesToList(routes, listRoutes) {
    for (const route of routes) {
      if (typeof route.path === 'string') {
        listRoutes.push(this.routeToStr(route, this.defaultLanguage));
      } else if (typeof route.path === 'object') {
        for (const language of Object.keys(route.path)) {
          listRoutes.push(this.routeToStr(route, language));
        }
      }
      if (route.routes) {
        this.transformRoutesToList(route.routes, listRoutes);
      }
    }
  }

  listRoutes() {
    const listRoutes = [];
    this.transformRoutesToList(this.routes.routes, listRoutes);
    return listRoutes;
  }
}
