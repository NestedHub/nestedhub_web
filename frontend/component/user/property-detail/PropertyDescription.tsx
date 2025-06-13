// components/user/property-detail/PropertyDescription.tsx
interface PropertyDescriptionProps {
  description: string;
}

export function PropertyDescription({ description }: PropertyDescriptionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Description</h2>
      <p className="text-gray-700 leading-relaxed">
        {description}
      </p>
    </div>
  );
}