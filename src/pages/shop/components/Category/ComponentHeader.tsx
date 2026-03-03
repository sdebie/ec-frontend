import React, { useEffect, useState } from 'react';
import CategoriesMenu from './CategoriesMenu';
import { getAllCategories, CategoryData } from '../../../../services/CatagoryService';

interface ComponentHeaderProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const ComponentHeader: React.FC<ComponentHeaderProps> = ({ activeCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories: CategoryData[] = await getAllCategories();
        const categoryNames = ['All', ...fetchedCategories.map(cat => cat.name)];
        setCategories(categoryNames);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories.");
        setCategories(['All']); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="component-header p-4">Loading categories...</div>;
  }

  if (error) {
    return <div className="component-header p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="component-header">
      <CategoriesMenu
        categories={categories}
        onSelectCategory={onSelectCategory}
        activeCategory={activeCategory}
      />
    </div>
  );
};

export default ComponentHeader;
