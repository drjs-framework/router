import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router';

export default function RouteMatch({ routes, component: Component, ...rest }) {
  if (Component) {
    return (
      <Route
        {...rest}
        render={
          matchProps => (
            <Component {...matchProps} routes={routes} {...rest} />
          )
        }
      />
    );
  }
  return null;
}

RouteMatch.propTypes = {
  routes: PropTypes.object.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]),
};

RouteMatch.defaultProps = {
  component: null,
};
