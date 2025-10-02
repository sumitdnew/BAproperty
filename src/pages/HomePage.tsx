import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Brand/Logo';
import {
  BuildingOfficeIcon,
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  EnvelopeIcon,
  UserGroupIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: BuildingOfficeIcon,
      title: "Building Management",
      description: "Complete building and property management with detailed tracking of units, occupancy rates, and building information."
    },
    {
      icon: UsersIcon,
      title: "Tenant Management",
      description: "Streamlined tenant onboarding, lease management, and communication tools for better tenant relationships."
    },
    {
      icon: CreditCardIcon,
      title: "Payment Processing",
      description: "Automated rent collection, payment tracking, and financial reporting with multiple payment methods."
    },
    {
      icon: WrenchScrewdriverIcon,
      title: "Maintenance Requests",
      description: "Digital maintenance request system with priority tracking, technician assignment, and cost management."
    },
    {
      icon: ChartBarIcon,
      title: "Analytics & Reports",
      description: "Comprehensive analytics dashboard with occupancy rates, revenue tracking, and performance metrics."
    },
    {
      icon: UserGroupIcon,
      title: "Community Features",
      description: "Building community platform for announcements, events, and resident communication."
    }
  ];

  const benefits = [
    "Reduce administrative workload by 70%",
    "Improve rent collection rates by 25%",
    "Streamline maintenance response times",
    "Enhance tenant satisfaction and retention",
    "Real-time financial reporting and insights",
    "Mobile-first design for on-the-go management"
  ];

  const stats = [
    { number: "500+", label: "Properties Managed" },
    { number: "10,000+", label: "Happy Tenants" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Logo size="lg" pinColor="#FF385C" textColor="#1F2937" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-red-500 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern Property Management
              <span className="text-red-500 block">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your property management operations with our comprehensive platform. 
              From tenant management to maintenance tracking, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-red-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-red-500 text-red-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-50 transition-colors"
              >
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools you need to efficiently manage 
              your properties, tenants, and operations in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Barrio?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of property managers who have transformed their operations 
                with our platform. Experience the difference modern technology can make.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500 mb-3" />
                  <div className="text-2xl font-bold text-gray-900">25%</div>
                  <div className="text-sm text-gray-600">Increase in Revenue</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <ClockIcon className="h-8 w-8 text-red-500 mb-3" />
                  <div className="text-2xl font-bold text-gray-900">50%</div>
                  <div className="text-sm text-gray-600">Faster Response Time</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <UsersIcon className="h-8 w-8 text-purple-500 mb-3" />
                  <div className="text-2xl font-bold text-gray-900">90%</div>
                  <div className="text-sm text-gray-600">Tenant Satisfaction</div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <ChartBarIcon className="h-8 w-8 text-orange-500 mb-3" />
                  <div className="text-2xl font-bold text-gray-900">70%</div>
                  <div className="text-sm text-gray-600">Less Admin Work</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Platform Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From property management to tenant communication, our platform covers every aspect 
              of modern property management operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Property Management */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <BuildingOfficeIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Property Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Multi-building portfolio management</li>
                <li>• Unit and apartment tracking</li>
                <li>• Occupancy rate monitoring</li>
                <li>• Property maintenance scheduling</li>
                <li>• Building amenities management</li>
              </ul>
            </div>

            {/* Tenant Management */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <UsersIcon className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tenant Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Digital tenant onboarding</li>
                <li>• Lease agreement management</li>
                <li>• Tenant communication portal</li>
                <li>• Payment history tracking</li>
                <li>• Emergency contact management</li>
              </ul>
            </div>

            {/* Financial Management */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <CreditCardIcon className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Financial Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Automated rent collection</li>
                <li>• Multiple payment methods</li>
                <li>• Financial reporting & analytics</li>
                <li>• Expense tracking</li>
                <li>• Profit & loss statements</li>
              </ul>
            </div>

            {/* Maintenance System */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <WrenchScrewdriverIcon className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Maintenance System</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Digital work order management</li>
                <li>• Priority-based scheduling</li>
                <li>• Technician assignment</li>
                <li>• Cost tracking & budgeting</li>
                <li>• Preventive maintenance alerts</li>
              </ul>
            </div>

            {/* Analytics & Reporting */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <ChartBarIcon className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics & Reporting</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Real-time performance metrics</li>
                <li>• Occupancy analytics</li>
                <li>• Revenue trend analysis</li>
                <li>• Custom report generation</li>
                <li>• Data export capabilities</li>
              </ul>
            </div>

            {/* Communication Tools */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <UserGroupIcon className="h-12 w-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Communication Tools</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Building community platform</li>
                <li>• Announcement system</li>
                <li>• Event management</li>
                <li>• Tenant feedback collection</li>
                <li>• Multi-language support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is built on cutting-edge technology to ensure reliability, 
              security, and scalability for your property management needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <ShieldCheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-gray-600">Enterprise-grade security with encryption and compliance standards.</p>
            </div>
            <div className="text-center">
              <DevicePhoneMobileIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile-First Design</h3>
              <p className="text-gray-600">Access your property data anywhere with our responsive mobile platform.</p>
            </div>
            <div className="text-center">
              <GlobeAltIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cloud-Based</h3>
              <p className="text-gray-600">Scalable cloud infrastructure with 99.9% uptime guarantee.</p>
            </div>
            <div className="text-center">
              <CogIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Integration</h3>
              <p className="text-gray-600">Seamless integration with existing property management tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Property Management?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            Join thousands of property managers who have already made the switch. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-red-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-red-500 transition-colors"
              >
                Schedule Demo
              </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Logo size="md" pinColor="#FF385C" textColor="#FFFFFF" />
              </div>
              <p className="text-gray-400">
                Modern property management platform for the digital age.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Barrio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
