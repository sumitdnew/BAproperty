import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { AnalyticsData } from '../hooks/useAnalytics'

export class ExportService {
  static async exportToPDF(analyticsData: AnalyticsData, dateRange: { start: string; end: string }, buildingName?: string) {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 20

    // Title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Analytics Report', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // Subtitle
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const subtitle = buildingName ? `Building: ${buildingName}` : 'All Buildings'
    pdf.text(subtitle, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 5

    // Date Range
    pdf.setFontSize(10)
    pdf.text(`Period: ${dateRange.start} to ${dateRange.end}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Revenue Summary
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Revenue Summary', 20, yPosition)
    yPosition += 10

    const totalRevenue = analyticsData.revenue.reduce((sum, r) => sum + r.revenue, 0)
    const totalExpenses = analyticsData.revenue.reduce((sum, r) => sum + r.expenses, 0)
    const netProfit = totalRevenue - totalExpenses

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Total Expenses: $${totalExpenses.toLocaleString()}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Net Profit: $${netProfit.toLocaleString()}`, 20, yPosition)
    yPosition += 15

    // Occupancy Summary
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Occupancy Summary', 20, yPosition)
    yPosition += 10

    const totalApartments = analyticsData.occupancy.reduce((sum, o) => sum + o.total_apartments, 0)
    const occupiedApartments = analyticsData.occupancy.reduce((sum, o) => sum + o.occupied_apartments, 0)
    const overallOccupancyRate = totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total Apartments: ${totalApartments}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Occupied Apartments: ${occupiedApartments}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Overall Occupancy Rate: ${overallOccupancyRate.toFixed(1)}%`, 20, yPosition)
    yPosition += 15

    // Maintenance Summary
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Maintenance Summary', 20, yPosition)
    yPosition += 10

    const totalRequests = analyticsData.maintenance.reduce((sum, m) => sum + m.total_requests, 0)
    const completedRequests = analyticsData.maintenance.reduce((sum, m) => sum + m.completed_requests, 0)
    const totalMaintenanceCost = analyticsData.maintenance.reduce((sum, m) => sum + m.total_cost, 0)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total Requests: ${totalRequests}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Completed Requests: ${completedRequests}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Total Maintenance Cost: $${totalMaintenanceCost.toLocaleString()}`, 20, yPosition)
    yPosition += 15

    // Payment Summary
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Payment Summary', 20, yPosition)
    yPosition += 10

    const totalPayments = analyticsData.payments.reduce((sum, p) => sum + p.total_amount, 0)
    const collectedPayments = analyticsData.payments.reduce((sum, p) => sum + p.collected_amount, 0)
    const overduePayments = analyticsData.payments.reduce((sum, p) => sum + p.overdue_amount, 0)
    const avgCollectionRate = analyticsData.payments.length > 0 
      ? analyticsData.payments.reduce((sum, p) => sum + p.collection_rate, 0) / analyticsData.payments.length 
      : 0

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total Payments: $${totalPayments.toLocaleString()}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Collected Payments: $${collectedPayments.toLocaleString()}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Overdue Payments: $${overduePayments.toLocaleString()}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Average Collection Rate: ${avgCollectionRate.toFixed(1)}%`, 20, yPosition)
    yPosition += 15

    // Tenant Summary
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Tenant Summary', 20, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total Tenants: ${analyticsData.tenants.total_tenants}`, 20, yPosition)
    yPosition += 6
    pdf.text(`New Tenants: ${analyticsData.tenants.new_tenants}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Average Tenancy Duration: ${analyticsData.tenants.avg_tenancy_duration.toFixed(1)} months`, 20, yPosition)
    yPosition += 6
    pdf.text(`Satisfaction Score: ${analyticsData.tenants.satisfaction_score}/5`, 20, yPosition)

    // Save the PDF
    const fileName = `analytics-report-${buildingName ? buildingName.replace(/\s+/g, '-').toLowerCase() : 'all-buildings'}-${dateRange.start}-to-${dateRange.end}.pdf`
    pdf.save(fileName)
  }

  static async exportToExcel(analyticsData: AnalyticsData, dateRange: { start: string; end: string }, buildingName?: string) {
    const workbook = XLSX.utils.book_new()

    // Revenue Data Sheet
    const revenueSheet = XLSX.utils.json_to_sheet(analyticsData.revenue.map(r => ({
      Month: r.month,
      Revenue: r.revenue,
      Expenses: r.expenses,
      Profit: r.profit
    })))
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue')

    // Occupancy Data Sheet
    const occupancySheet = XLSX.utils.json_to_sheet(analyticsData.occupancy.map(o => ({
      Building: o.building_name,
      'Total Apartments': o.total_apartments,
      'Occupied Apartments': o.occupied_apartments,
      'Occupancy Rate (%)': o.occupancy_rate
    })))
    XLSX.utils.book_append_sheet(workbook, occupancySheet, 'Occupancy')

    // Maintenance Data Sheet
    const maintenanceSheet = XLSX.utils.json_to_sheet(analyticsData.maintenance.map(m => ({
      Month: m.month,
      'Total Requests': m.total_requests,
      'Completed Requests': m.completed_requests,
      'Average Cost': m.avg_cost,
      'Total Cost': m.total_cost
    })))
    XLSX.utils.book_append_sheet(workbook, maintenanceSheet, 'Maintenance')

    // Payment Data Sheet
    const paymentSheet = XLSX.utils.json_to_sheet(analyticsData.payments.map(p => ({
      Month: p.month,
      'Total Amount': p.total_amount,
      'Collected Amount': p.collected_amount,
      'Overdue Amount': p.overdue_amount,
      'Collection Rate (%)': p.collection_rate
    })))
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Payments')

    // Tenant Summary Sheet
    const tenantSheet = XLSX.utils.json_to_sheet([{
      'Total Tenants': analyticsData.tenants.total_tenants,
      'New Tenants': analyticsData.tenants.new_tenants,
      'Average Tenancy Duration (months)': analyticsData.tenants.avg_tenancy_duration,
      'Satisfaction Score': analyticsData.tenants.satisfaction_score
    }])
    XLSX.utils.book_append_sheet(workbook, tenantSheet, 'Tenants')

    // Summary Sheet
    const totalRevenue = analyticsData.revenue.reduce((sum, r) => sum + r.revenue, 0)
    const totalExpenses = analyticsData.revenue.reduce((sum, r) => sum + r.expenses, 0)
    const netProfit = totalRevenue - totalExpenses
    const totalApartments = analyticsData.occupancy.reduce((sum, o) => sum + o.total_apartments, 0)
    const occupiedApartments = analyticsData.occupancy.reduce((sum, o) => sum + o.occupied_apartments, 0)
    const overallOccupancyRate = totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0

    const summarySheet = XLSX.utils.json_to_sheet([{
      'Report Period': `${dateRange.start} to ${dateRange.end}`,
      'Building': buildingName || 'All Buildings',
      'Total Revenue': totalRevenue,
      'Total Expenses': totalExpenses,
      'Net Profit': netProfit,
      'Total Apartments': totalApartments,
      'Occupied Apartments': occupiedApartments,
      'Overall Occupancy Rate (%)': overallOccupancyRate,
      'Total Tenants': analyticsData.tenants.total_tenants,
      'New Tenants': analyticsData.tenants.new_tenants,
      'Average Tenancy Duration (months)': analyticsData.tenants.avg_tenancy_duration,
      'Satisfaction Score': analyticsData.tenants.satisfaction_score
    }])
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Save the Excel file
    const fileName = `analytics-report-${buildingName ? buildingName.replace(/\s+/g, '-').toLowerCase() : 'all-buildings'}-${dateRange.start}-to-${dateRange.end}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  static async exportToCSV(analyticsData: AnalyticsData, dateRange: { start: string; end: string }, buildingName?: string) {
    // Create a comprehensive CSV with all data
    const csvData = []

    // Add header
    csvData.push(['Analytics Report', buildingName || 'All Buildings', `${dateRange.start} to ${dateRange.end}`])
    csvData.push([])

    // Revenue data
    csvData.push(['Revenue Data'])
    csvData.push(['Month', 'Revenue', 'Expenses', 'Profit'])
    analyticsData.revenue.forEach(r => {
      csvData.push([r.month, r.revenue, r.expenses, r.profit])
    })
    csvData.push([])

    // Occupancy data
    csvData.push(['Occupancy Data'])
    csvData.push(['Building', 'Total Apartments', 'Occupied Apartments', 'Occupancy Rate (%)'])
    analyticsData.occupancy.forEach(o => {
      csvData.push([o.building_name, o.total_apartments, o.occupied_apartments, o.occupancy_rate])
    })
    csvData.push([])

    // Maintenance data
    csvData.push(['Maintenance Data'])
    csvData.push(['Month', 'Total Requests', 'Completed Requests', 'Average Cost', 'Total Cost'])
    analyticsData.maintenance.forEach(m => {
      csvData.push([m.month, m.total_requests, m.completed_requests, m.avg_cost, m.total_cost])
    })
    csvData.push([])

    // Payment data
    csvData.push(['Payment Data'])
    csvData.push(['Month', 'Total Amount', 'Collected Amount', 'Overdue Amount', 'Collection Rate (%)'])
    analyticsData.payments.forEach(p => {
      csvData.push([p.month, p.total_amount, p.collected_amount, p.overdue_amount, p.collection_rate])
    })
    csvData.push([])

    // Tenant data
    csvData.push(['Tenant Data'])
    csvData.push(['Total Tenants', 'New Tenants', 'Average Tenancy Duration (months)', 'Satisfaction Score'])
    csvData.push([
      analyticsData.tenants.total_tenants,
      analyticsData.tenants.new_tenants,
      analyticsData.tenants.avg_tenancy_duration,
      analyticsData.tenants.satisfaction_score
    ])

    // Convert to CSV string
    const csvString = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    // Save the CSV file
    const fileName = `analytics-report-${buildingName ? buildingName.replace(/\s+/g, '-').toLowerCase() : 'all-buildings'}-${dateRange.start}-to-${dateRange.end}.csv`
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, fileName)
  }
}
