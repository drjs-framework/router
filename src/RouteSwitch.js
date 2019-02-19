import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router';
import RouteMatch from './RouteMatch';

export default class RouteSwitch extends React.Component {
  static propTypes = {
    languages: PropTypes.array.isRequired,
    defaultLanguage: PropTypes.string.isRequired,
    actualLanguage: PropTypes.string.isRequired,
    routesConf: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.bindFunctions();
  }

  bindFunctions() {
    this.getRoutes = this.getRoutes.bind(this);
    this.getRoutesMultilanguage = this.getRoutesMultilanguage.bind(this);
  }

  getRoutes() {
    const { routesConf } = this.props;
    return routesConf.routes.map(this.getRoutesMultilanguage);
  }

  getRoutesMultilanguage(route, index) {
    const { languages } = this.props;

    return languages.map(language => (this.getRoute(route, index, language)));
  }

  getRoute = (route, index, actualLanguage) => {
    const { routesConf } = this.props;

    const routeCloned = Object.assign({}, route);

    const path = this.buildPath(routeCloned.path, actualLanguage);

    if (route.routes && route.routes.length > 0) {
      routeCloned.multiLanguage = routesConf.multiLanguage;
      return (
        <RouteSwitch
          key={index}
          {...this.props}
          routesConf={routeCloned}
        />
      );
    }
    return (
      <RouteMatch key={index} routes={routesConf} {...route} path={path} />
    );
  }

  isSimplePath(path) {
    return !(path && typeof path !== 'string');
  }

  isActualLanguageTheDefault() {
    const { actualLanguage, defaultLanguage } = this.props;
    return (actualLanguage === defaultLanguage);
  }

  buildPath(path, actualLanguage) {
    if (!this.isSimplePath(path)) {
      return path[actualLanguage];
    }
    return path;
  }

  render() {
    return (
      <Switch>
        {this.getRoutes()}
      </Switch>
    );
  }
}
