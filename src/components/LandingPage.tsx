import React from 'react';

interface TeamMember {
  image: string;
  name: string;
  position: string;
}

const LandingPage: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      image: '/images/1.jpg',
      name: 'JAMRODDIN SHEK',
      position: 'Founder and MD'
    },
    {
      image: '/images/2.jpg',
      name: 'Srinivas',
      position: 'CEO'
    },
    {
      image: '/images/3.jpg',
      name: 'BALAKRISHNA AVULA',
      position: 'Chairman'
    },
    {
      image: '/images/4.jpg',
      name: 'RAJU YELLAPOGU',
      position: 'MD'
    }
  ];

  const products = [
    { image: '/images/IMG-20250425-WA0038.jpg', name: 'Product 1' },
    { image: '/images/IMG-20250425-WA0039.jpg', name: 'Product 2' },
    { image: '/images/IMG-20250425-WA0040.jpg', name: 'Product 3' },
    { image: '/images/IMG-20250425-WA0041.jpg', name: 'Product 4' },
    { image: '/images/IMG-20250425-WA0042.jpg', name: 'Product 5' },
    { image: '/images/IMG-20250425-WA0043.jpg', name: 'Product 6' },
    { image: '/images/IMG-20250425-WA0044.jpg', name: 'Product 7' },
    { image: '/images/IMG-20250425-WA0045.jpg', name: 'Product 8' },
    { image: '/images/IMG-20250425-WA0046.jpg', name: 'Product 9' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Logo */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <img src="/images/logo.jpg" alt="Company Logo" className="h-16 object-contain" />
        </div>
      </header>

      {/* Team Members Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-full overflow-hidden mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-center">{member.name}</h3>
                <p className="text-gray-600 text-center">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-center">{product.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 