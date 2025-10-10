import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Brand/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  BuildingOfficeIcon as Building2,
  UsersIcon as Users,
  CreditCardIcon as CreditCard,
  WrenchScrewdriverIcon as Wrench,
  ChartBarIcon as BarChart3,
  ChatBubbleLeftRightIcon as MessageSquare,
  ArrowRightIcon as ArrowRight,
  CheckIcon as Check,
  ShieldCheckIcon as Shield,
  DevicePhoneMobileIcon as Smartphone,
  GlobeAltIcon as Globe,
  BoltIcon as Zap,
  StarIcon as Star,
  ArrowTrendingUpIcon as TrendingUp,
  ClockIcon as Clock,
  CurrencyDollarIcon as DollarSign,
  Bars3Icon as Menu,
  XMarkIcon as X
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Building2,
      title: t('smartBuildingManagement'),
      description: t('smartBuildingDesc'),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: t('seamlessTenantExperience'),
      description: t('seamlessTenantDesc'),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: CreditCard,
      title: t('automatedPayments'),
      description: t('automatedPaymentsDesc'),
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Wrench,
      title: t('intelligentMaintenance'),
      description: t('intelligentMaintenanceDesc'),
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: BarChart3,
      title: t('advancedAnalytics'),
      description: t('advancedAnalyticsDesc'),
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: MessageSquare,
      title: t('communityHub'),
      description: t('communityHubDesc'),
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  const stats = [
    { number: "50K+", label: t('unitsManaged'), icon: Building2 },
    { number: "98%", label: t('satisfactionRate'), icon: Star },
    { number: "45%", label: t('timeSaved'), icon: Clock },
    { number: "$2.5M+", label: t('revenueTracked'), icon: TrendingUp }
  ];

  const benefits = [
    t('benefit1'),
    t('benefit2'),
    t('benefit3'),
    t('benefit4'),
    t('benefit5'),
    t('benefit6')
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Logo size="md" pinColor="#FF385C" textColor="#1F2937" />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-red-500 transition-colors font-medium">{t('features')}</a>
              <a href="#benefits" className="text-gray-700 hover:text-red-500 transition-colors font-medium">{t('benefits')}</a>
              <a href="#pricing" className="text-gray-700 hover:text-red-500 transition-colors font-medium">{t('pricing')}</a>
              <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-red-500 transition-colors font-medium">
                {t('login')}
              </button>
              <button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
                {t('startFreeTrial')}
              </button>
              <LanguageSwitcher />
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
                <StarSolid className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">{t('trustedBy')}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {t('propertyManagement')}
                </span>
                <br />
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {t('reimagined')}
                </span>
            </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                {t('heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => navigate('/signup')} className="group bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center">
                  {t('startFreeTrial')}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
                <button onClick={() => navigate('/login')} className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all border-2 border-gray-200">
                  {t('watchDemo')}
              </button>
              </div>

              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white"></div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <StarSolid key={i} className="w-4 h-4 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{t('reviewsFrom')}</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                {/* Mock Dashboard */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg"></div>
                      <span className="text-white font-semibold">Dashboard</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {stats.slice(0, 4).map((stat, i) => (
                      <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-700">
                        <stat.icon className="w-6 h-6 text-red-400 mb-2" />
                        <div className="text-2xl font-bold text-white">{stat.number}</div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-end justify-between h-32">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                        <div key={i} className="flex-1 mx-1">
                          <div 
                            className="bg-gradient-to-t from-red-500 to-pink-500 rounded-t-lg transition-all duration-500 hover:from-red-400 hover:to-pink-400"
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -right-6 top-20 bg-white rounded-2xl shadow-2xl p-4 animate-pulse" style={{animationDuration: '3s'}}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t('paymentReceived')}</p>
                      <p className="text-xs text-gray-500">{t('unit')} 304 • $2,400</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-6 bottom-20 bg-white rounded-2xl shadow-2xl p-4 animate-pulse" style={{animationDuration: '4s'}}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t('maintenanceDone')}</p>
                      <p className="text-xs text-gray-500">{t('unit')} 201 • {t('plumbing')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t('everythingYouNeed')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                {t('nothingYouDont')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t('transformYourOperations')}
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('transformSubtitle')}
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center">
                {t('seeHowItWorks')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform">
                    <TrendingUp className="w-12 h-12 mb-4" />
                    <div className="text-4xl font-bold mb-2">35%</div>
                    <div className="text-purple-100">{t('higherRevenue')}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform">
                    <Users className="w-12 h-12 mb-4" />
                    <div className="text-4xl font-bold mb-2">92%</div>
                    <div className="text-blue-100">{t('tenantRetention')}</div>
                  </div>
                </div>
                <div className="space-y-6 mt-8">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform">
                    <Clock className="w-12 h-12 mb-4" />
                    <div className="text-4xl font-bold mb-2">45%</div>
                    <div className="text-green-100">{t('timeSaved')}</div>
                </div>
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform">
                    <DollarSign className="w-12 h-12 mb-4" />
                    <div className="text-4xl font-bold mb-2">25%</div>
                    <div className="text-orange-100">{t('costReduction')}</div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('builtForTheFuture')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('technologySubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: t('bankLevelSecurity'), desc: t('bankLevelSecurityDesc') },
              { icon: Smartphone, title: t('mobileFirst'), desc: t('mobileFirstDesc') },
              { icon: Globe, title: t('cloudBased'), desc: t('cloudBasedDesc') },
              { icon: Zap, title: t('lightningFast'), desc: t('lightningFastDesc') }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 group-hover:bg-white/20 transition-all">
                  <item.icon className="w-8 h-8 text-red-400" />
            </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('readyToGetStarted')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('ctaSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button onClick={() => navigate('/signup')} className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center">
              {t('startFreeTrial')}
              <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            <button onClick={() => navigate('/login')} className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all">
              {t('scheduleDemoCall')}
              </button>
          </div>

          <p className="text-white/80 text-sm">
            {t('noCreditCard')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <Logo size="md" pinColor="#FF385C" textColor="#FFFFFF" />
              </div>
              <p className="text-gray-400 mb-4">
                {t('modernPropertyManagement')}
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'instagram'].map((social) => (
                  <div key={social} className="w-10 h-10 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors cursor-pointer"></div>
                ))}
            </div>
            </div>

            {[
              { title: t('productTitle'), links: [t('features'), t('pricing'), t('integrations'), t('api')] },
              { title: t('resourcesTitle'), links: [t('blog'), t('helpCenter'), t('documentation'), t('statusPage')] },
              { title: t('companyTitle'), links: [t('about'), t('careers'), t('privacy'), t('terms')] }
            ].map((section, i) => (
              <div key={i}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Barrio. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
