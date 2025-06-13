import PropTypes from 'prop-types';
import { Card } from './ui/card';

/**
 * NavigationCard component for dashboard navigation
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.color - CSS classes for icon background and text color
 * @param {Function} props.onClick - Click handler function
 * @returns {React.ReactElement} NavigationCard component
 */
export function NavigationCard({ title, description, icon, color, onClick }) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow h-full"
      onClick={onClick}
    >
      <div className="flex p-5 h-full">
        <div>
          <div className={`p-3 rounded-full ${color} mr-4 flex-shrink-0`}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col justify-center overflow-hidden">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
    </Card>
  );
}

NavigationCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};