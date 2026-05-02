import React from 'react';

interface CategoriesMenuProps {
  categories: string[];
  onSelectCategory: (category: string) => void;
  activeCategory: string;
}

const CategoriesMenu: React.FC<CategoriesMenuProps> = ({ categories, onSelectCategory, activeCategory }) => {
  return (
    <div className="categories-menu bg-gray-100 p-4">
      <ul className="flex space-x-4">
        {categories.map((category, index) => (
          <li
            key={index}
            className={`cursor-pointer hover:text-blue-600 ${activeCategory === category ? 'font-bold text-blue-700' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesMenu;
