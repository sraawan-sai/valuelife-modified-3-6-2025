import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
  headerAction,
  onClick,
  hoverable = false,
}) => {
  const cardClasses = `
    bg-white rounded-lg shadow-card overflow-hidden
    ${hoverable ? 'transition-shadow duration-300 hover:shadow-card-hover' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || icon || subtitle || headerAction) && (
        <div className={`px-6 py-4 border-b border-neutral-200 ${headerClassName}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {icon && <div className="mr-3 text-primary-600">{icon}</div>}
              <div>
                {title && <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>}
                {subtitle && <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>}
              </div>
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export type { CardProps };
export default Card;