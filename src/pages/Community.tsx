// pages/Community.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  HomeIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  BellIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'

const Community: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('building')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Mock building community data
  const buildingPosts = [
    {
      id: 1,
      type: 'announcement',
      title: 'Reunión de consorcio - Febrero 2024',
      content: 'Se convoca a todos los propietarios a la reunión mensual del consorcio. Orden del día: presupuesto, obras pendientes y nuevas propuestas.',
      author: 'Administración',
      authorType: 'admin',
      createdAt: '2024-01-28T10:00:00',
      likes: 12,
      comments: 5,
      pinned: true,
      category: 'meeting'
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Corte de agua programado - 3A y 3B',
      content: 'El día miércoles 31/01 entre las 9:00 y 12:00 hs se realizarán trabajos de plomería en los departamentos 3A y 3B. Disculpen las molestias.',
      author: 'Carlos Técnico',
      authorType: 'staff',
      createdAt: '2024-01-27T14:30:00',
      likes: 8,
      comments: 3,
      pinned: false,
      category: 'maintenance'
    },
    {
      id: 3,
      type: 'social',
      title: 'Asado de fin de verano',
      content: 'Organizamos un asado en la terraza para el sábado 10/02 a las 19:00. ¡Confirmen asistencia! Cada familia trae algo para compartir.',
      author: 'María González',
      authorType: 'tenant',
      createdAt: '2024-01-26T16:45:00',
      likes: 24,
      comments: 18,
      pinned: false,
      category: 'social'
    },
    {
      id: 4,
      type: 'complaint',
      title: 'Ruidos molestos en el 2do piso',
      content: 'Durante las últimas noches hay ruidos fuertes en el segundo piso después de las 23:00. Les pedimos más consideración con los vecinos.',
      author: 'Roberto Martínez',
      authorType: 'tenant',
      createdAt: '2024-01-25T22:15:00',
      likes: 6,
      comments: 12,
      pinned: false,
      category: 'complaint'
    }
  ]

  // Mock public community data  
  const publicCommunities = [
    {
      id: 1,
      name: 'Propietarios Buenos Aires Centro',
      description: 'Comunidad para propietarios de edificios en el centro de Buenos Aires',
      members: 1247,
      category: 'owners',
      isJoined: true,
      recentActivity: '2 horas atrás'
    },
    {
      id: 2,
      name: 'Administradores de Consorcio BA',
      description: 'Grupo profesional para administradores de consorcios en Buenos Aires',
      members: 892,
      category: 'professional',
      isJoined: false,
      recentActivity: '1 día atrás'
    },
    {
      id: 3,
      name: 'Vecinos Barrio Norte',
      description: 'Comunidad de vecinos del Barrio Norte para compartir información local',
      members: 2156,
      category: 'neighborhood',
      isJoined: true,
      recentActivity: '3 horas atrás'
    },
    {
      id: 4,
      name: 'Mantenimiento Edilicio Argentina',
      description: 'Tips, consejos y contactos para el mantenimiento de edificios',
      members: 3421,
      category: 'maintenance',
      isJoined: false,
      recentActivity: '5 horas atrás'
    }
  ]

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'social': return 'bg-green-100 text-green-800 border border-green-200'
      case 'complaint': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getAuthorTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'tenant': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCommunityIcon = (category: string) => {
    switch (category) {
      case 'owners': return '🏢'
      case 'professional': return '👔'
      case 'neighborhood': return '🏘️'
      case 'maintenance': return '🔧'
      default: return '👥'
    }
  }

  const filteredBuildingPosts = buildingPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredPublicCommunities = publicCommunities.filter(community => {
    return community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           community.description.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('community')}</h1>
          <p className="text-gray-600 mt-1">{t('connectWithResidentsAndNeighbors')}</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors">
          <PlusIcon className="w-4 h-4" />
          <span>{t('newPost')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('building')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'building'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HomeIcon className="w-5 h-5" />
                <span>{t('buildingCommunity')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="w-5 h-5" />
                <span>{t('publicCommunities')}</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Building Community Tab */}
      {activeTab === 'building' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalPosts')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{buildingPosts.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 border border-blue-200">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('activeMembers')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">18</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 border border-green-200">
                  <UserGroupIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('upcomingEvents')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">2</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 border border-purple-200">
                  <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('unreadNotifications')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 border border-yellow-200">
                  <BellIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchPosts')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('allCategories')}</option>
                <option value="meeting">{t('meetings')}</option>
                <option value="maintenance">{t('maintenance')}</option>
                <option value="social">{t('socialEvents')}</option>
                <option value="complaint">{t('complaints')}</option>
              </select>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredBuildingPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{post.author}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAuthorTypeColor(post.authorType)}`}>
                          {t(post.authorType)}
                        </span>
                        {post.pinned && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded-full">
                            {t('pinned')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('es-AR')} - {new Date(post.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(post.type)}`}>
                    {t(post.type)}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h4>
                  <p className="text-gray-700">{post.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <span>👍</span>
                      <span className="text-sm">{post.likes} {t('likes')}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span className="text-sm">{post.comments} {t('comments')}</span>
                    </button>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {t('viewDetails')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Communities Tab */}
      {activeTab === 'public' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchCommunities')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPublicCommunities.map((community) => (
              <div key={community.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">
                      {getCommunityIcon(community.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{community.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{community.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{community.members.toLocaleString()} {t('members')}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('lastActivity')}: {community.recentActivity}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    community.isJoined 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {community.isJoined ? t('joined') : t('notJoined')}
                  </span>
                  <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    community.isJoined
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {community.isJoined ? t('leave') : t('join')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Community