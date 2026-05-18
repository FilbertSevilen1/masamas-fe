import Link from 'next/link';

const categories = [
  { id: 1, name: 'Cement & Concrete', slug: 'cement', icon: '🏗️', count: 12 },
  { id: 2, name: 'Reinforcement Steel', slug: 'steel', icon: '🔗', count: 8 },
  { id: 3, name: 'Bricks & Stones', slug: 'bricks', icon: '🧱', count: 15 },
  { id: 4, name: 'Roofing Materials', slug: 'roofing', icon: '🏠', count: 10 },
  { id: 5, name: 'Lumber & Timber', slug: 'lumber', icon: '🪵', count: 14 },
  { id: 6, name: 'Plumbing Supplies', slug: 'plumbing', icon: '🚰', count: 20 },
];

const CategoryGrid = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal mb-4">Shop by Category</h2>
          <div className="w-20 h-1.5 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Browse our extensive collection of high-grade materials organized by construction phase and requirement.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${category.slug}`}
              className="bg-white p-8 rounded-xl border border-gray-100 flex flex-col items-center text-center group hover:border-primary hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="font-bold text-charcoal mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-gray-400">{category.count} Products</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
