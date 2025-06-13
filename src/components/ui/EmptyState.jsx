import { Button } from "./button";

/**
 * EmptyState component for displaying when no data is available
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {string} props.buttonText - Text for the action button
 * @param {Function} props.onAction - Function to call when the button is clicked
 * @returns {JSX.Element} EmptyState component
 */
export function EmptyState({ icon, title, description, buttonText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">
        {description}
      </p>
      {buttonText && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {buttonText}
        </Button>
      )}
    </div>
  );
}