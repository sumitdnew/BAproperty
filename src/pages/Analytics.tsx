// pages/Analytics.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ArrowDownTrayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

const Analytics: React.FC = () => {
  const { t } = useTranslation()
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')

  const reportTypes = [
    {
      title: t('maintenanceReport'),
      description: t('detailedMaintenanceAnalysis'),
      icon: '🔧',
      color: 'blue',
      stats: {
        total: 12,
        completed: 8,
        pending: 4,
        avgCost: 47500
      }
    },
    {
      title: t('financialReport'),
      description: t('incomeAndExpensesReport'),
      icon: '💰',
      color: 'green',
      stats: {
        income: 855000,
        expenses: 295000,
        profit: 560000,
        profitMargin: 65
      }
    },
    {
      title: t('occupancyReport'),
      description: t('buildingOccupancyAnalysis'),
      icon: '🏢',
      color: 'purple',
      stats: {
        totalUnits: 24,
        occupied: 18,
        vacant: 6,
        occupancyRate: 75
      }
    },
    {
      title: t('tenantReport'),
      description: t('tenantSatisfactionAnalysis'),
      icon: '👥',
      color: 'indigo',
      stats: {
        totalTenants: 18,
        activeTenants: 18,
        renewalRate: 85,
        avgStay: 2.3
      }
    }
  ]

  const quickStats = [
    {
      label: t('monthlyRevenue'),
      value: '$855,000',
      change: '+12%',
      trend: 'up'
    },
    {
      label: t('occupancyRate'),
      value: '75%',
      change: '+5%',
      trend: 'up'
    },
    {
      label: t('maintenanceCosts'),
      value: '$295,000',
      change: '-8%',
      trend: 'down'
    },
    {
      label: t('tenantSatisfaction'),
      value: '4.2/5',
      change: '+0.3',
      trend: 'up'
    }
  ]

  const exportOptions = [
    {
      label: t('exportAsExcel'),
      format: 'xlsx',
      description: t('detailedSpreadsheet')
    },
    {
      label: t('exportAsPDF'),
      format: 'pdf', 
      description: t('formattedReport')
    },
    {
      label: t('exportAsCSV'),
      format: 'csv',
      description: t('rawDataFile')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('analytics')}</h1>
          <p className="text-gray-600 mt-1">{t('generateReportsAndAnalytics')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="thisMonth">{t('thisMonth')}</option>
            <option value="lastMonth">{t('lastMonth')}</option>
            <option value="last3Months">{t('last3Months')}</option>
            <option value="last6Months">{t('last6Months')}</option>
            <option value="thisYear">{t('thisYear')}</option>
          </select>
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>{t('export')}</span>
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-1">
                {exportOptions.map((option, index) => (
                  <button
                    key={index}
                    className="flex flex-col px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 w-full transition-colors"
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className={`flex items-center mt-2 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{stat.change}</span>
                  <span className="ml-1">{t('vsLastPeriod')}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <ChartBarIcon className={`w-6 h-6 ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{report.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                </div>
              </div>
              <button className={`px-3 py-1 text-sm font-medium rounded-md bg-${report.color}-100 text-${report.color}-600 hover:bg-${report.color}-200 transition-colors`}>
                {t('generate')}
              </button>
            </div>
            
            {/* Report-specific stats preview */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              {report.title.includes('Mantenimiento') || report.title.includes('Maintenance') ? (
                <>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{report.stats.total}</div>
                    <div className="text-xs text-gray-600">{t('totalRequests')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{report.stats.completed}</div>
                    <div className="text-xs text-gray-600">{t('completed')}</div>
                  </div>
                </>
              ) : report.title.includes('Financiero') || report.title.includes('Financial') ? (
                <>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">${((report.stats.income || 0) / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-600">{t('income')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{report.stats.profitMargin}%</div>
                    <div className="text-xs text-gray-600">{t('profitMargin')}</div>
                  </div>
                </>
              ) : report.title.includes('Ocupación') || report.title.includes('Occupancy') ? (
                <>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{report.stats.occupancyRate}%</div>
                    <div className="text-xs text-gray-600">{t('occupied')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{report.stats.vacant}</div>
                    <div className="text-xs text-gray-600">{t('vacant')}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{report.stats.renewalRate}%</div>
                    <div className="text-xs text-gray-600">{t('renewalRate')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{report.stats.avgStay}</div>
                    <div className="text-xs text-gray-600">{t('avgYears')}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentActivity')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('monthlyFinancialReport')}</p>
                <p className="text-sm text-gray-600">{t('generatedToday')} - {t('january')} 2024</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {t('download')}
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('occupancyAnalysis')}</p>
                <p className="text-sm text-gray-600">{t('generated')} 2 {t('daysAgo')}</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {t('download')}
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('maintenanceReport')}</p>
                <p className="text-sm text-gray-600">{t('generated')} 1 {t('weekAgo')}</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {t('download')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics