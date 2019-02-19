import {
  buildRoutesWithComputedNames, buildWithExactParameter,
  buildRouteWithPathTranslations,
} from './utils';

export default class GenerateRoutes {
  constructor(
    routes,
    multiLanguage = false,
    options = {}
  ) {
    this.routesInit = routes;
    this.multiLanguage = multiLanguage;
    this.options = options;
  }

  build() {
    buildRoutesWithComputedNames(this.routesInit);
    buildWithExactParameter(this.routesInit);
    if (!this.multiLanguage.hideLanguage) {
      buildRouteWithPathTranslations(this.routesInit, this.multiLanguage);
    }

    this.routesInit.multiLanguage = this.multiLanguage;
    this.routesInit.multiLanguage.showDefaultLanguage =
      typeof this.multiLanguage.showDefaultLanguage !== 'undefined' ?
        this.multiLanguage.showDefaultLanguage :
        false;

    return this.routesInit;
  }
}
