import GeneratePath from './GeneratePath';
import { searchRouteForUrl, simplifyArrayLanguages } from './utils';

export default function getRoute(
  name, parameters, options = { absolute: false, translate: false }
) {
  const finalOptions = Object.assign({
    language: Translate.locale,
    languages: simplifyArrayLanguages(configuration.get('languages')),
    defaultLanguage: configuration.get('defaultLanguage'),
  }, options); // eslint-disable-line

  const generatePath = new GeneratePath(configuration.get('routes'));
  return generatePath.buildPathWithRoutes(
    name,
    parameters,
    finalOptions
  );
}

export function getUrlForAnotherLanguage(url, language) {
  if (typeof path === 'string') {
    return null;
  }
  const routesConfig = configuration.get('routes');
  const { route, params } = searchRouteForUrl(url);

  const generatePath = new GeneratePath(routesConfig);

  return generatePath.buildPathWithRoutes(
    route.calculateName,
    params,
    { absolute: true, language }
  );
}
