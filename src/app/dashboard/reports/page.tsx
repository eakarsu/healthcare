'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Download,
  Clock,
  Stethoscope,
  Building2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import * as XLSX from 'xlsx'

interface ReportConfig {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
}

const reports: ReportConfig[] = [
  {
    id: 'financial-summary',
    name: 'Financial Summary',
    description: 'Revenue, collections, and A/R overview',
    icon: DollarSign,
    category: 'Financial',
  },
  {
    id: 'production-by-provider',
    name: 'Production by Provider',
    description: 'Charges and collections by provider',
    icon: Stethoscope,
    category: 'Financial',
  },
  {
    id: 'ar-aging',
    name: 'A/R Aging Report',
    description: 'Outstanding balances by age',
    icon: Clock,
    category: 'Financial',
  },
  {
    id: 'payer-analysis',
    name: 'Payer Analysis',
    description: 'Revenue and denials by insurance',
    icon: Building2,
    category: 'Financial',
  },
  {
    id: 'patient-volume',
    name: 'Patient Volume',
    description: 'Appointment and visit statistics',
    icon: Users,
    category: 'Operations',
  },
  {
    id: 'appointment-analysis',
    name: 'Appointment Analysis',
    description: 'No-shows, cancellations, and utilization',
    icon: Calendar,
    category: 'Operations',
  },
  {
    id: 'new-patients',
    name: 'New Patient Report',
    description: 'New patient acquisition trends',
    icon: TrendingUp,
    category: 'Operations',
  },
  {
    id: 'procedure-analysis',
    name: 'Procedure Analysis',
    description: 'Most common CPT codes and services',
    icon: FileText,
    category: 'Clinical',
  },
  {
    id: 'diagnosis-report',
    name: 'Diagnosis Report',
    description: 'Common diagnoses and ICD codes',
    icon: BarChart3,
    category: 'Clinical',
  },
]

export default function ReportsPage() {
  const { toast } = useToast()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [reportData, setReportData] = useState<Record<string, unknown>[] | null>(null)

  const runReport = async () => {
    if (!selectedReport) return

    setLoading(true)
    try {
      const response = await fetch(`/api/reports/${selectedReport}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.data || [])
      }
    } catch (error) {
      console.error('Failed to run report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = async () => {
    if (!selectedReport) {
      toast({
        title: 'No report selected',
        description: 'Please select a report first',
        variant: 'destructive',
      })
      return
    }

    setExporting(true)
    try {
      // Fetch report data if not already loaded
      const response = await fetch(`/api/reports/${selectedReport}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report data')
      }

      const data = await response.json()
      const exportData = data.data || []

      if (exportData.length === 0) {
        toast({
          title: 'No data to export',
          description: 'The report has no data for the selected date range',
          variant: 'destructive',
        })
        return
      }

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Report')

      // Generate filename with report name and date range
      const reportName = reports.find(r => r.id === selectedReport)?.name || 'Report'
      const filename = `${reportName.replace(/\s+/g, '_')}_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`

      // Download the file
      XLSX.writeFile(wb, filename)

      toast({
        title: 'Export successful',
        description: `Report exported as ${filename}`,
      })
    } catch (error) {
      console.error('Failed to export report:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export the report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const categories = Array.from(new Set(reports.map(r => r.category)))

  // Mock data for preview
  const mockFinancialData = {
    totalCharges: 125000,
    totalPayments: 98500,
    totalAdjustments: 12000,
    netCollections: 86500,
    collectionRate: 87.8,
    avgDaysAR: 32,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Generate and analyze practice reports</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Report</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {categories.map((category) => (
              <div key={category}>
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">
                  {category}
                </div>
                <div className="space-y-1">
                  {reports.filter(r => r.category === category).map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                        selectedReport === report.id
                          ? 'bg-teal-50 border-l-2 border-teal-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <report.icon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Report Configuration & Preview */}
        <Card className="lg:col-span-2">
          {selectedReport ? (
            <>
              <CardHeader>
                <CardTitle>
                  {reports.find(r => r.id === selectedReport)?.name}
                </CardTitle>
                <CardDescription>
                  {reports.find(r => r.id === selectedReport)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Quick Date Ranges */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const start = new Date(today.getFullYear(), today.getMonth(), 1)
                      setDateRange({
                        startDate: start.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0],
                      })
                    }}
                  >
                    This Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                      const end = new Date(today.getFullYear(), today.getMonth(), 0)
                      setDateRange({
                        startDate: start.toISOString().split('T')[0],
                        endDate: end.toISOString().split('T')[0],
                      })
                    }}
                  >
                    Last Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const start = new Date(today.getFullYear(), 0, 1)
                      setDateRange({
                        startDate: start.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0],
                      })
                    }}
                  >
                    Year to Date
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const start = new Date(today.getFullYear() - 1, 0, 1)
                      const end = new Date(today.getFullYear() - 1, 11, 31)
                      setDateRange({
                        startDate: start.toISOString().split('T')[0],
                        endDate: end.toISOString().split('T')[0],
                      })
                    }}
                  >
                    Last Year
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={runReport}
                    disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Run Report
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={exportToExcel} disabled={exporting}>
                    {exporting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export to Excel
                      </>
                    )}
                  </Button>
                </div>

                {/* Sample Report Preview */}
                {selectedReport === 'financial-summary' && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-500">Total Charges</p>
                          <p className="text-2xl font-bold">{formatCurrency(mockFinancialData.totalCharges)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-500">Total Payments</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(mockFinancialData.totalPayments)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-500">Net Collections</p>
                          <p className="text-2xl font-bold">{formatCurrency(mockFinancialData.netCollections)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-500">Adjustments</p>
                          <p className="text-2xl font-bold text-gray-600">{formatCurrency(mockFinancialData.totalAdjustments)}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-500">Collection Rate</p>
                          <p className="text-2xl font-bold text-teal-600">{mockFinancialData.collectionRate}%</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-500">Avg Days in A/R</p>
                          <p className="text-2xl font-bold">{mockFinancialData.avgDaysAR}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-96 flex-col items-center justify-center text-gray-500">
              <BarChart3 className="mb-4 h-12 w-12 text-gray-300" />
              <p>Select a report from the list to get started</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
