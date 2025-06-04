import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface TeamMember {
  image: string;
  name: string;
  position: string;
  description: string;
}

const LandingPage: React.FC = () => {
  const productsRef = useRef<HTMLDivElement>(null);
  const [networkNodes, setNetworkNodes] = useState<{ x: number; y: number; level: number }[]>([]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });

    // Auto-scrolling for products
    const scrollProducts = () => {
      if (productsRef.current) {
        const container = productsRef.current;
        const scrollAmount = 1;
        
        const scroll = () => {
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
            container.scrollLeft = 0;
          } else {
            container.scrollLeft += scrollAmount;
          }
        };

        const intervalId = setInterval(scroll, 50);
        return () => clearInterval(intervalId);
      }
    };

    const cleanup = scrollProducts();

    // Generate network nodes
    const generateNodes = () => {
      const nodes = [];
      const levels = 3;
      const baseY = 100;
      const levelGap = 180;
      const containerWidth = window.innerWidth * 0.8;
      const startX = (window.innerWidth - containerWidth) / 2;

      // Root node (centered at top)
      const rootX = window.innerWidth / 2;
      nodes.push({ x: rootX, y: baseY, level: 0 });

      // Level 1 (2 nodes)
      const level1Spacing = containerWidth / 3;
      nodes.push({ x: rootX - level1Spacing, y: baseY + levelGap, level: 1 });
      nodes.push({ x: rootX + level1Spacing, y: baseY + levelGap, level: 1 });

      // Level 2 (4 nodes)
      const level2Spacing = containerWidth / 5;
      nodes.push({ x: rootX - level1Spacing - level2Spacing, y: baseY + (levelGap * 2), level: 2 });
      nodes.push({ x: rootX - level1Spacing + level2Spacing, y: baseY + (levelGap * 2), level: 2 });
      nodes.push({ x: rootX + level1Spacing - level2Spacing, y: baseY + (levelGap * 2), level: 2 });
      nodes.push({ x: rootX + level1Spacing + level2Spacing, y: baseY + (levelGap * 2), level: 2 });

      setNetworkNodes(nodes);
    };

    generateNodes();
    window.addEventListener('resize', generateNodes);
    
    return () => {
      cleanup && cleanup();
      window.removeEventListener('resize', generateNodes);
    };
  }, []);

  const teamMembers: TeamMember[] = [
    {
      image: '/images/1.jpg',
      name: 'JAMRODDIN SHEK',
      position: 'Founder and Marketing Director',
      description: 'A dedicated professional with 9 years of experience in network marketing, specializing in team building and sales growth with 12 years of expertise in the RO industry.'
    },
    {
      image: '/images/2.jpg',
      name: 'KAVITHA SRINIVAS KONKATA',
      position: 'CEO OF VALUE LIFE',
      description: 'An experienced leader driving innovation and growth in the MLM industry with a focus on sustainable business practices.'
    },
    {
      image: '/images/3.jpg',
      name: 'BALAKRISHNA AVULA',
      position: 'Chairman',
      description: 'A seasoned professional with 23 years in real estate, 7 years in network marketing, and 13 years in media industry.'
    },
    {
      image: '/images/4.jpg',
      name: 'RAJU YELLAPOGU',
      position: 'MD',
      description: 'Holds a B.Sc. degree with 7 years of experience in network marketing and expertise in team building and technical services.'
    }
  ];

  const products = [
    { image: '/images/IMG_1.jpg', name: 'PH Alkaline Water Filter', description: 'Advanced water purification system for healthier living' },
    { image: '/images/IMG_2.jpg', name: 'Bio Magnetic Mattress', description: 'Revolutionary sleep technology for better health' },
    { image: '/images/IMG_3.jpg', name: 'Health Supplements', description: 'Premium quality supplements for overall wellness' },
    { image: '/images/IMG_4.jpg', name: 'Wellness Products', description: 'Innovative solutions for a healthier lifestyle' },
    { image: '/images/IMG_5.jpg', name: 'Natural Care', description: 'Organic and natural personal care products' },
    { image: '/images/IMG-20250425-WA0043.jpg', name: 'Lifestyle Products', description: 'Enhanced living through innovative products' },
    { image: '/images/IMG-20250425-WA0044.jpg', name: 'Home Essentials', description: 'Quality products for your daily needs' },
    { image: '/images/IMG-20250425-WA0045.jpg', name: 'Premium Collection', description: 'Exclusive range of premium products' },
    { image: '/images/IMG-20250425-WA0046.jpg', name: 'Wellness Solutions', description: 'Complete wellness solutions for modern living' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header with Logo and Navigation */}
      <header className="landing-nav flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <div className="flex items-center">
          <img src="/images/logo.jpg" alt="Logo" className="h-10 w-10 object-contain" />
          <h1 className="landing-logo ml-2 font-semibold">Value Life</h1>
        </div>
        
        <nav className="landing-nav-links flex items-center gap-3">
          <Link
            to="/login"
            className="landing-nav-link px-4 py-1.5 text-gray-600 hover:text-gray-800 hover:border hover:border-gray-200 rounded-full transition-all"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="landing-nav-link px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
          >
            Join
          </Link>
      </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-vibrantBlue to-customOrange">  {/*from-blue-600 to-blue-800*/}
        <div className="container mx-auto px-4" data-aos="fade-up">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your Health & Create Wealth
          </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100">
              "Value Life means every person should have good values, and those values should reflect in our life."
          </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                Start Your Journey
            </Link>
              <Link to="/products" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all">
                Explore Products
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
            <h2 className="text-4xl font-bold mb-8 text-gray-800">Our Vision</h2>
            <p className="text-xl text-gray-600 mb-12">
              If you buy our product, you become healthy. If you work with us, you become wealthy. 
              Our mission is to transform 100,000 people into millionaires through our innovative products and business opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Network Visualization Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-white overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">Our Growing Network</h2>
            <p className="text-xl text-gray-600">
              Join our expanding community of successful entrepreneurs building wealth through our proven MLM structure.
            </p>
          </div>

          <div className="relative h-[700px] mb-16" data-aos="fade-up">
            {/* Network Visualization */}
            <svg className="w-full h-full">
              {/* Connection Lines */}
              {networkNodes.map((node, index) => {
                if (node.level === 0) return null;
                const parentIndex = Math.floor((index - 1) / 2);
                const parent = networkNodes[parentIndex];
                return (
                  <g key={`connection-${index}`}>
                    {/* Background static line */}
                    <line
                      x1={parent.x}
                      y1={parent.y}
                      x2={node.x}
                      y2={node.y}
                      className="stroke-blue-100"
                      strokeWidth="3"
                    />
                    {/* Animated line overlay */}
                    <line
                      x1={parent.x}
                      y1={parent.y}
                      x2={node.x}
                      y2={node.y}
                      className="stroke-blue-400"
                      strokeWidth="3"
                      strokeDasharray="6,6"
                      style={{
                        animation: `flowLine 2s ${index * 0.2}s infinite linear`
                      }}
                    />
                    {/* Pulse effect along the line */}
                    <circle
                      className="fill-blue-400"
                      r="4"
                      style={{
                        animation: `moveDot 2s ${index * 0.2}s infinite linear`
                      }}
                    >
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path={`M ${parent.x} ${parent.y} L ${node.x} ${node.y}`}
                      />
                    </circle>
                  </g>
                );
              })}
              
              {/* Nodes */}
              {networkNodes.map((node, index) => (
                <g key={`node-${index}`}>
                  {/* Outer glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="24"
                    className="fill-blue-200/30"
                    style={{
                      animation: `pulse 2s ${index * 0.2}s infinite`
                    }}
                  />
                  {/* Main node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="16"
                    className={`${
                      node.level === 0 ? 'fill-blue-500' : 'fill-blue-400'
                    } shadow-lg transition-all duration-300`}
                    style={{
                      animation: `float 3s ${index * 0.2}s infinite ease-in-out`
                    }}
                  />
                  {/* Inner pulse */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    className="fill-blue-300"
                    style={{
                      animation: `innerPulse 1.5s ${index * 0.2}s infinite ease-out`
                    }}
                  />
                </g>
              ))}
            </svg>

            {/* Floating Stats Cards */}
            <div className="absolute inset-0 pointer-events-none">
              {networkNodes.map((node, index) => (
                <div
                  key={`stat-${index}`}
                  className="absolute transform -translate-x-1/2 bg-white rounded-lg shadow-md p-3 transition-all duration-300"
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y - 45}px`,
                    minWidth: '110px',
                    animation: `floatCard 3s ${index * 0.2}s infinite ease-in-out`
                  }}
                >
                  <div className="text-sm font-medium text-blue-500">
                    {node.level === 0 ? 'You' : `Level ${node.level}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {node.level === 0 ? 'Start Here' : `${Math.pow(2, node.level)} Partners`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards with updated styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto px-8" data-aos="fade-up">
            <div className="bg-white rounded-xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-blue-600 mb-3">7 Levels</div>
              <p className="text-gray-600 font-medium">Deep Network Structure</p>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-blue-600 mb-3">∞</div>
              <p className="text-gray-600 font-medium">Unlimited Earning Potential</p>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-blue-600 mb-3">20%</div>
              <p className="text-gray-600 font-medium">Direct Referral Bonus</p>
            </div>
          </div>
        </div>

        {/* Enhanced Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800" data-aos="fade-up">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
                data-aos="zoom-in-up"
                data-aos-delay={index * 200}
                data-aos-duration="1000"
              >
                <div className="aspect-w-3 aspect-h-2 relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {/* <div className="absolute bottom-0 p-6 text-white transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{member.description}</p>
                    </div> */}
                  </div>
                </div>
                <div className="p-6 bg-white transform group-hover:bg-gradient-to-r from-blue-50 to-white transition-colors duration-500">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{member.name}</h3>
                  <p className="text-blue-600 mt-1 transform group-hover:translate-x-2 transition-transform duration-300">{member.position}</p>
                  <div className="h-1 w-10 bg-blue-600 mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </div>
          </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section with Auto-scroll */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800" data-aos="fade-up">Our Premium Products</h2>
          <div 
            ref={productsRef}
            className="flex overflow-x-hidden gap-8 pb-8"
            style={{ scrollBehavior: 'smooth' }}
          >
            {[...products, ...products].map((product, index) => (
              <div 
                key={index} 
                className="flex-none w-80 group bg-white rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 p-6 text-white">
                      <p className="text-sm">{product.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                </div>
          </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center" data-aos="fade-up">
          <h2 className="text-4xl font-bold mb-8">Ready to Transform Your Life?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
          Join thousands who are already improving their health and creating wealth with Value Life.
            Start your journey today with zero registration fees and lifetime validity!
          </p>
          <Link to="/register" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
            Begin Your Success Story
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Value Life</h3>
              <p className="text-gray-400">Transforming lives through health and wealth opportunities.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-400">Gayatri Nagar, Karmanghat<br />LB Nagar, Hyderabad 500079</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
                <li><Link to="/business" className="hover:text-white transition-colors">Business Plan</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <p className="text-gray-400">www.valuelife.in</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Value Life. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 