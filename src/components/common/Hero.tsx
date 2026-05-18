import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock, Truck } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-charcoal transform skew-x-12 translate-x-32 hidden lg:block"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-20 lg:py-32 flex flex-col lg:flex-row items-center">
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-charcoal leading-[1.1] mb-6">
              Build Your <br />
              <span className="text-primary italic">Future</span> With <br />
              Superior Materials.
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
              Masamas provides the most reliable construction materials for projects that demand excellence. Strength, durability, and trust delivered to your site.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/products" className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center">
                <span>Shop Materials</span>
                <ArrowRight size={20} />
              </Link>
              <Link href="/about" className="px-8 py-3 border-2 border-charcoal text-charcoal font-bold rounded hover:bg-charcoal hover:text-white transition-all w-full sm:w-auto text-center">
                Learn More
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <ShieldCheck className="text-primary" size={24} />
                <span className="text-sm font-medium">Quality Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Truck className="text-primary" size={24} />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Clock className="text-primary" size={24} />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Illustration */}
          <div className="lg:w-1/2 mt-16 lg:mt-0 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop" 
                alt="Construction Site" 
                className="w-full h-auto"
              />
            </div>
            {/* Floating stats card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-xl shadow-xl z-20 border border-gray-100 hidden sm:block animate-bounce-subtle">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center rounded-full">
                  <ArrowRight size={24} className="-rotate-45" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Project Success</p>
                  <p className="text-2xl font-bold text-charcoal">99.9%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
