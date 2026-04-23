import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Users, Zap, BookOpen, Heart, Building2, Briefcase } from 'lucide-react';
import { getCategoriesList } from '../../services/adminApi.js';

const iconMap = {
  बजार: TrendingUp,
  अर्थ: DollarSign,
  राजनीति: Users,
  ऊर्जा: Zap,
  शिक्षा: BookOpen,
  स्वास्थ्य: Heart,
  कृषि: Building2,
  व्यापार: Briefcase
};

const colorClasses = {
  0: 'bg-green-100 text-green-700 hover:bg-green-200',
  1: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  2: 'bg-red-100 text-red-700 hover:bg-red-200',
  3: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  4: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  5: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  6: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  7: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
};

const CategoryLinks = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesList();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="px-2 sm:px-3 lg:px-4 py-10 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="mx-auto w-full max-w-[90%]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">समाचार श्रेणीहरू</h2>
          <p className="text-gray-600">होतपाईंको रुचिको श्रेणी छान्नुस्</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => {
            const Icon = iconMap[category.name] || TrendingUp;
            const colorClass = colorClasses[index % 8];
            return (
              <Link
                key={category.id}
                to={`/category/${category.name}`}
                className={`${colorClass} rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg group`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white/50 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-sm">{category.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryLinks;

