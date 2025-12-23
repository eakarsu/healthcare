'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  CheckCircle2,
  Users,
  RefreshCw,
  Target,
  Award,
  Info,
} from 'lucide-react'

interface QualityMeasure {
  measureId: string
  measureTitle: string
  numerator: number
  denominator: number
  exclusions: number
  performanceRate: number
  starRating: number
  benchmarks: {
    star3: number
    star4: number
    star5: number
  }
  gapCount: number
}

interface DashboardData {
  provider: {
    id: string
    name: string
    specialty: string
    npi: string
  }
  performanceYear: number
  mipsScore: {
    final: number
    quality: number
    pi: number
    ia: number
    cost: number
    paymentAdjustment: number
  }
  qualityMeasures: QualityMeasure[]
  gapOpportunities: Array<{
    measureId: string
    measureTitle: string
    gapCount: number
    impact: string
  }>
  reportedMeasures: number
  availableMeasures: number
}

export default function QualityDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [calculating, setCalculating] = useState(false)
  const [selectedMeasure, setSelectedMeasure] = useState<QualityMeasure | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [year])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/quality/dashboard?year=${year}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const recalculateMeasures = async () => {
    setCalculating(true)
    try {
      await fetch('/api/quality/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year }),
      })
      fetchDashboard()
    } catch (error) {
      console.error('Failed to recalculate:', error)
    } finally {
      setCalculating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStarDisplay = (stars: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))
  }

  const getAdjustmentColor = (adj: number) => {
    if (adj > 0) return 'text-green-600'
    if (adj < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-gray-500">
        <BarChart3 className="mb-4 h-12 w-12 text-gray-300" />
        <p>No quality data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Measures & MIPS</h1>
          <p className="text-gray-500">
            {data.provider.name} - {data.provider.specialty}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={recalculateMeasures}
            disabled={calculating}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </div>

      {/* MIPS Score Overview */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-2 bg-gradient-to-br from-teal-500 to-teal-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100">Final MIPS Score</p>
                <p className="text-5xl font-bold mt-2">{data.mipsScore.final.toFixed(1)}</p>
                <p className="text-teal-100 mt-2">out of 100</p>
              </div>
              <div className="text-right">
                <Award className="h-16 w-16 text-teal-200" />
                <p className={`text-lg font-semibold mt-2 ${data.mipsScore.paymentAdjustment >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {data.mipsScore.paymentAdjustment >= 0 ? '+' : ''}{data.mipsScore.paymentAdjustment.toFixed(2)}%
                </p>
                <p className="text-teal-200 text-sm">Payment Adjustment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Quality</p>
                <p className={`text-2xl font-bold ${getScoreColor(data.mipsScore.quality)}`}>
                  {data.mipsScore.quality.toFixed(1)}
                </p>
              </div>
            </div>
            <Progress value={data.mipsScore.quality} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Promoting Interop.</p>
                <p className={`text-2xl font-bold ${getScoreColor(data.mipsScore.pi)}`}>
                  {data.mipsScore.pi.toFixed(1)}
                </p>
              </div>
            </div>
            <Progress value={data.mipsScore.pi} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Improvement</p>
                <p className={`text-2xl font-bold ${getScoreColor(data.mipsScore.ia)}`}>
                  {data.mipsScore.ia.toFixed(1)}
                </p>
              </div>
            </div>
            <Progress value={data.mipsScore.ia} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Gap Opportunities */}
      {data.gapOpportunities.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Top Gap Opportunities
            </CardTitle>
            <CardDescription className="text-orange-700">
              Patients who need attention to close quality measure gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {data.gapOpportunities.slice(0, 3).map((gap) => (
                <div
                  key={gap.measureId}
                  className="p-4 bg-white rounded-lg border border-orange-200"
                >
                  <p className="font-medium text-gray-900">{gap.measureTitle}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span className="text-2xl font-bold text-orange-600">
                        {gap.gapCount}
                      </span>
                      <span className="text-gray-500">patients</span>
                    </div>
                    <Badge
                      className={
                        gap.impact === 'High'
                          ? 'bg-red-100 text-red-800'
                          : gap.impact === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {gap.impact} Impact
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Measures Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quality Measures</CardTitle>
              <CardDescription>
                {data.reportedMeasures} of {data.availableMeasures} measures reported
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Measure</TableHead>
                <TableHead className="text-center">Performance</TableHead>
                <TableHead className="text-center">Numerator / Denominator</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Gaps</TableHead>
                <TableHead className="text-center">Benchmark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.qualityMeasures.map((measure) => (
                <TableRow
                  key={measure.measureId}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedMeasure(measure)
                    setDetailOpen(true)
                  }}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{measure.measureId}</p>
                      <p className="text-sm text-gray-500 max-w-md truncate">
                        {measure.measureTitle}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(measure.performanceRate)}`}>
                        {measure.performanceRate.toFixed(1)}%
                      </span>
                      {measure.performanceRate >= measure.benchmarks.star4 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : measure.performanceRate < measure.benchmarks.star3 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-gray-600">
                    {measure.numerator} / {measure.denominator}
                    {measure.exclusions > 0 && (
                      <span className="text-gray-400 text-sm"> ({measure.exclusions} excl.)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">{getStarDisplay(measure.starRating)}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    {measure.gapCount > 0 ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        {measure.gapCount} gaps
                      </Badge>
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <span>3★: {measure.benchmarks.star3}%</span>
                      <span>5★: {measure.benchmarks.star5}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Measure Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-teal-600" />
              {selectedMeasure?.measureId}
            </DialogTitle>
            <DialogDescription>
              {selectedMeasure?.measureTitle}
            </DialogDescription>
          </DialogHeader>
          {selectedMeasure && (
            <div className="space-y-6 py-4">
              {/* Performance */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Performance Rate</p>
                  <p className={`text-3xl font-bold ${getScoreColor(selectedMeasure.performanceRate)}`}>
                    {selectedMeasure.performanceRate.toFixed(1)}%
                  </p>
                </div>
                <div className="flex">{getStarDisplay(selectedMeasure.starRating)}</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-teal-600">{selectedMeasure.numerator}</p>
                  <p className="text-xs text-gray-500">Numerator</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedMeasure.denominator}</p>
                  <p className="text-xs text-gray-500">Denominator</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{selectedMeasure.exclusions}</p>
                  <p className="text-xs text-gray-500">Exclusions</p>
                </div>
              </div>

              {/* Gaps */}
              {selectedMeasure.gapCount > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <p className="font-medium text-orange-800">
                      {selectedMeasure.gapCount} patients need attention
                    </p>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    These patients are in the denominator but haven't met the measure criteria.
                  </p>
                </div>
              )}

              {/* Benchmarks */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">CMS Benchmarks</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-2">3-Star</span>
                    </span>
                    <span className="font-medium">{selectedMeasure.benchmarks.star3}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-2">4-Star</span>
                    </span>
                    <span className="font-medium">{selectedMeasure.benchmarks.star4}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-2">5-Star</span>
                    </span>
                    <span className="font-medium">{selectedMeasure.benchmarks.star5}%</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={() => setDetailOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
