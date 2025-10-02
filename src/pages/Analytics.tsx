import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Plot from 'react-plotly.js'
import { useAnalytics } from '../hooks/useAnalytics'
import { useBuildingContext } from '../context/BuildingContext'
import { ExportService } from '../services/exportService'
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  CreditCardIcon,
  UsersIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const Analytics: React.FC = () => {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingContext()
  
  const [periodFilter, setPeriodFilter] = useState('thisMonth')
  
  // Calculate date range based on period filter using useMemo to prevent infinite loops
  const dateRange = useMemo(() => {
    const now = new Date()
    const start = new Date()
    
    switch (periodFilter) {
      case 'thisMonth':
        start.setDate(1)
        break
      case 'lastMonth':
        start.setMonth(now.getMonth() - 1, 1)
        break
      case 'last3Months':
        start.setMonth(now.getMonth() - 3, 1)
        break
      case 'thisYear':
        start.setMonth(0, 1)
        break
      default:
        start.setDate(1)
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    }
  }, [periodFilter])

  const { revenue, occupancy, maintenance, payments, tenants, loading, error, refetch } = useAnalytics(dateRange)

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const analyticsData = { revenue, occupancy, maintenance, payments, tenants, loading, error }
      
      switch (format) {
        case 'pdf':
          await ExportService.exportToPDF(analyticsData, dateRange, selectedBuilding?.name)
          break
        case 'excel':
          await ExportService.exportToExcel(analyticsData, dateRange, selectedBuilding?.name)
          break
        case 'csv':
          await ExportService.exportToCSV(analyticsData, dateRange, selectedBuilding?.name)
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={refetch}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('analytics')}</h1>
          <p className="text-gray-600">
            {selectedBuilding ? `${t('analyticsFor')} ${selectedBuilding.name}` : t('allBuildingsAnalytics')}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Period Filter */}
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="thisMonth">{t('thisMonth')}</option>
              <option value="lastMonth">{t('lastMonth')}</option>
              <option value="last3Months">{t('last3Months')}</option>
              <option value="thisYear">{t('thisYear')}</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Excel</span>
            </button>
                  <button
              onClick={() => handleExport('csv')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>CSV</span>
                  </button>
          </div>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('revenueAnalytics')}</h2>
              <p className="text-gray-600">{t('revenueTrendsAndProfitability')}</p>
            </div>
          </div>
        </div>

        {/* Revenue Summary Cards - Moved to top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t('totalRevenue')}</p>
                <p className="text-2xl font-bold text-green-900">
                  ${revenue.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">{t('totalExpenses')}</p>
                <p className="text-2xl font-bold text-red-900">
                  ${revenue.reduce((sum, r) => sum + r.expenses, 0).toLocaleString()}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{t('netProfit')}</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${revenue.reduce((sum, r) => sum + r.profit, 0).toLocaleString()}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('revenueTrend')}</h3>
            <Plot
              data={[
                {
                  x: revenue.map(r => r.month),
                  y: revenue.map(r => r.revenue),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: t('revenue'),
                  line: { color: '#10B981', width: 3 },
                  marker: { size: 8 },
                  text: revenue.map(r => `$${r.revenue.toLocaleString()}`),
                  textposition: 'top center',
                  textfont: { size: 10 }
                }
              ]}
              layout={{
                title: { text: t('revenueTrend') },
                xaxis: { title: { text: t('month') } },
                yaxis: { title: { text: t('amount') } },
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 60 },
                showlegend: false
              }}
              config={{ displayModeBar: false }}
            />
          </div>

          {/* Profit/Loss Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profitLoss')}</h3>
            <Plot
              data={[
                {
                  x: revenue.map(r => r.month),
                  y: revenue.map(r => r.profit),
                  type: 'bar',
                  name: t('profit'),
                  marker: { 
                    color: revenue.map(r => r.profit >= 0 ? '#10B981' : '#EF4444')
                  },
                  text: revenue.map(r => `$${r.profit.toLocaleString()}`),
                  textposition: 'outside',
                  textfont: { size: 10 }
                }
              ]}
              layout={{
                title: { text: t('profitLoss') },
                xaxis: { title: { text: t('month') } },
                yaxis: { title: { text: t('amount') } },
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 60 },
                showlegend: false
              }}
              config={{ displayModeBar: false }}
            />
        </div>
        </div>
      </div>

      {/* Occupancy Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HomeIcon className="w-6 h-6 text-blue-600" />
            </div>
                <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('occupancyAnalytics')}</h2>
              <p className="text-gray-600">{t('buildingOccupancyRates')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Occupancy Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('occupancyByBuilding')}</h3>
            <Plot
              data={[
                {
                  x: occupancy.map(o => o.building_name),
                  y: occupancy.map(o => o.occupancy_rate),
                  type: 'bar',
                  name: t('occupancyRate'),
                  marker: { color: '#3B82F6' },
                  text: occupancy.map(o => `${o.occupancy_rate.toFixed(1)}%`),
                  textposition: 'outside',
                  textfont: { size: 10 }
                }
              ]}
              layout={{
                title: { text: t('occupancyByBuilding') },
                xaxis: { title: { text: t('building') } },
                yaxis: { title: { text: t('occupancyRate') + ' (%)' } },
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 60 },
                showlegend: false
              }}
              config={{ displayModeBar: false }}
            />
          </div>

          {/* Occupancy Pie Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('occupancyDistribution')}</h3>
            <Plot
              data={[
                {
                  labels: [t('occupied'), t('vacant')],
                  values: [
                    occupancy.reduce((sum, o) => sum + o.occupied_apartments, 0),
                    occupancy.reduce((sum, o) => sum + (o.total_apartments - o.occupied_apartments), 0)
                  ],
                  type: 'pie',
                  marker: { colors: ['#10B981', '#EF4444'] }
                }
              ]}
              layout={{
                title: { text: t('occupancyDistribution') },
                height: 300,
                margin: { t: 20, r: 20, b: 20, l: 20 },
                showlegend: true
              }}
              config={{ displayModeBar: false }}
            />
          </div>
                </div>
              </div>

      {/* Maintenance Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <WrenchScrewdriverIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('maintenanceAnalytics')}</h2>
              <p className="text-gray-600">{t('maintenanceRequestsAndCosts')}</p>
            </div>
          </div>
        </div>

        {/* Maintenance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">{t('totalRequests')}</p>
                <p className="text-2xl font-bold text-orange-900">
                  {maintenance.reduce((sum, m) => sum + m.total_requests, 0)}
                </p>
              </div>
              <WrenchScrewdriverIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t('completedRequests')}</p>
                <p className="text-2xl font-bold text-green-900">
                  {maintenance.reduce((sum, m) => sum + m.completed_requests, 0)}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{t('totalCost')}</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${maintenance.reduce((sum, m) => sum + m.total_cost, 0).toLocaleString()}
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maintenance Requests Trend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('maintenanceRequests')}</h3>
            <Plot
              data={[
                {
                  x: maintenance.map(m => m.month),
                  y: maintenance.map(m => m.total_requests),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: t('totalRequests'),
                  line: { color: '#F59E0B', width: 3 },
                  marker: { size: 8 },
                  text: maintenance.map(m => m.total_requests.toString()),
                  textposition: 'top center',
                  textfont: { size: 10 }
                },
                {
                  x: maintenance.map(m => m.month),
                  y: maintenance.map(m => m.completed_requests),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: t('completedRequests'),
                  line: { color: '#10B981', width: 3 },
                  marker: { size: 8 },
                  text: maintenance.map(m => m.completed_requests.toString()),
                  textposition: 'top center',
                  textfont: { size: 10 }
                }
              ]}
              layout={{
                title: { text: t('maintenanceRequests') },
                xaxis: { title: { text: t('month') } },
                yaxis: { title: { text: t('numberOfRequests') } },
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 60 },
                showlegend: true
              }}
              config={{ displayModeBar: false }}
            />
                  </div>

          {/* Maintenance Costs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('maintenanceCosts')}</h3>
            <Plot
              data={[
                {
                  x: maintenance.map(m => m.month),
                  y: maintenance.map(m => m.total_cost),
                  type: 'bar',
                  name: t('totalCost'),
                  marker: { color: '#EF4444' },
                  text: maintenance.map(m => `$${m.total_cost.toLocaleString()}`),
                  textposition: 'outside',
                  textfont: { size: 10 }
                }
              ]}
              layout={{
                title: { text: t('maintenanceCosts') },
                xaxis: { title: { text: t('month') } },
                yaxis: { title: { text: t('cost') } },
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 60 },
                showlegend: false
              }}
              config={{ displayModeBar: false }}
            />
                  </div>
                  </div>
                  </div>

      {/* Payment Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCardIcon className="w-6 h-6 text-purple-600" />
                  </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('paymentAnalytics')}</h2>
              <p className="text-gray-600">{t('paymentCollectionAndOverdue')}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">{t('totalAmount')}</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${payments.reduce((sum, p) => sum + p.total_amount, 0).toLocaleString()}
                </p>
              </div>
              <CreditCardIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t('collected')}</p>
                <p className="text-2xl font-bold text-green-900">
                  ${payments.reduce((sum, p) => sum + p.collected_amount, 0).toLocaleString()}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">{t('overdue')}</p>
                <p className="text-2xl font-bold text-red-900">
                  ${payments.reduce((sum, p) => sum + p.overdue_amount, 0).toLocaleString()}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Collection Rate */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('collectionRate')}</h3>
            <Plot
              data={[
                {
                  x: payments.map(p => p.month),
                  y: payments.map(p => p.collection_rate),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: t('collectionRate'),
                  line: { color: '#8B5CF6', width: 3 },
                  marker: { size: 8 },
                  text: payments.map(p => `${p.collection_rate.toFixed(1)}%`),
                  textposition: 'top center',
                  textfont: { size: 10 }
                }
              ]}
              layout={{
                title: { text: t('collectionRate') },
                xaxis: { title: { text: t('month') } },
                yaxis: { title: { text: t('collectionRate') + ' (%)' } },
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 60 },
                showlegend: false
              }}
              config={{ displayModeBar: false }}
            />
          </div>

          {/* Payment Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('paymentStatus')}</h3>
            <Plot
              data={[
                {
                  x: payments.map(p => p.month),
                  y: payments.map(p => p.collected_amount),
                  type: 'bar',
                  name: t('collected'),
                  marker: { color: '#10B981' },
                  text: payments.map(p => p.collected_amount > 0 ? `$${p.collected_amount.toLocaleString()}` : ''),
                  textposition: 'inside',
                  textfont: { size: 9, color: 'white' }
                },
                {
                  x: payments.map(p => p.month),
                  y: payments.map(p => p.overdue_amount),
                  type: 'bar',
                  name: t('overdue'),
                  marker: { color: '#EF4444' },
                  text: payments.map(p => p.overdue_amount > 0 ? `$${p.overdue_amount.toLocaleString()}` : ''),
                  textposition: 'inside',
                  textfont: { size: 9, color: 'white' }
                }
              ]}
              layout={{
                title: { text: t('paymentStatus') },
                xaxis: { title: { text: t('month') } },
                yaxis: { title: { text: t('amount') } },
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 60 },
                showlegend: true,
                barmode: 'stack'
              }}
              config={{ displayModeBar: false }}
            />
          </div>
        </div>
      </div>

      {/* Tenant Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('tenantAnalytics')}</h2>
              <p className="text-gray-600">{t('tenantDemographicsAndSatisfaction')}</p>
            </div>
          </div>
              </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">{t('totalTenants')}</p>
                <p className="text-2xl font-bold text-indigo-900">{tenants.total_tenants}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t('newTenants')}</p>
                <p className="text-2xl font-bold text-green-900">{tenants.new_tenants}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{t('avgTenancyDuration')}</p>
                <p className="text-2xl font-bold text-blue-900">{tenants.avg_tenancy_duration.toFixed(1)} {t('months')}</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">{t('satisfactionScore')}</p>
                <p className="text-2xl font-bold text-yellow-900">{tenants.satisfaction_score}/5</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics