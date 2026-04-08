import React from 'react';
import CategoriesMenu from './CategoriesMenu.tsx';
import useCategoryList from '@/pages/admin/category/hooks/useCategoryList.ts';

interface ComponentHeaderProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const ComponentHeader: React.FC<ComponentHeaderProps> = ({ activeCategory, onSelectCategory }) => {
  const { categories: fetchedCategories, isLoading, errorMsg } = useCategoryList();

  const categories = ['All', ...fetchedCategories.map(cat => cat.name)];

  if (isLoading) {
    return <div className="component-header p-4">Loading categories...</div>;
  }

  if (errorMsg) {
    return <div className="component-header p-4 text-red-600">{errorMsg}</div>;
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
