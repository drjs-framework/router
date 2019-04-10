import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import getRoute from './getRoute';

export default function LinkComponent({
  name,
  params,
  children,
  className,
  onClick,
  target,
}) {
  const path = getRoute(name, params);

  return (
    <Link
      className={className}
      to={path}
      onClick={onClick}
      target={target}
    >
      {children}
    </Link>
  );
}
LinkComponent.defaultProps = {
  params: {},
  children: null,
  className: 'Link',
  onClick: null,
  target: null,
};

LinkComponent.propTypes = {
  name: PropTypes.string.isRequired,
  params: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  className: PropTypes.string,
  onClick: PropTypes.func,
  target: PropTypes.string,
};
