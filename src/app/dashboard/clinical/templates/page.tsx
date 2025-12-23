'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const defaultTemplates = [
  {
    id: '1',
    name: 'Annual Physical',
    category: 'Preventive',
    description: 'Comprehensive annual wellness visit template',
    content: {
      chiefComplaint: 'Annual wellness examination',
      subjective: 'Patient presents for annual physical examination. No acute complaints. Reviews of systems obtained and documented.',
      objective: 'General: Well-appearing, in no acute distress.\nVitals: See vitals section.\nHEENT: Normocephalic, PERRL, TMs clear, oropharynx clear.\nNeck: Supple, no lymphadenopathy.\nCV: RRR, no murmurs.\nLungs: CTA bilaterally.\nAbdomen: Soft, non-tender, no masses.\nExtremities: No edema, pulses intact.',
      assessment: 'Annual wellness visit - routine examination',
      plan: '1. Routine labs ordered (CBC, CMP, Lipid panel)\n2. Age-appropriate cancer screenings discussed\n3. Immunizations updated as needed\n4. Continue current medications\n5. Return in 1 year for annual exam',
    },
  },
  {
    id: '2',
    name: 'Upper Respiratory Infection',
    category: 'Acute',
    description: 'Common cold / URI evaluation',
    content: {
      chiefComplaint: 'Cold symptoms',
      subjective: 'Patient presents with nasal congestion, runny nose, and mild sore throat for [X] days. Denies fever, shortness of breath, or chest pain. No known sick contacts.',
      objective: 'General: Alert, in no acute distress.\nVitals: Afebrile.\nENT: Nasal mucosa erythematous, clear rhinorrhea, pharynx mildly erythematous without exudate.\nNeck: No lymphadenopathy.\nLungs: Clear to auscultation bilaterally.',
      assessment: 'Acute upper respiratory infection, likely viral',
      plan: '1. Supportive care: rest, fluids, OTC decongestants as needed\n2. Return if symptoms worsen or persist >10 days\n3. Return immediately if fever >101, difficulty breathing, or severe sore throat',
    },
  },
  {
    id: '3',
    name: 'Hypertension Follow-up',
    category: 'Chronic',
    description: 'Blood pressure management visit',
    content: {
      chiefComplaint: 'Hypertension follow-up',
      subjective: 'Patient returns for hypertension management. Reports taking medications as prescribed. Home BP readings averaging [X/X]. Denies headaches, chest pain, or shortness of breath.',
      objective: 'General: Well-appearing, in no acute distress.\nVitals: BP [X/X], HR [X].\nCV: RRR, no murmurs.\nLungs: Clear bilaterally.\nExtremities: No edema.',
      assessment: 'Essential hypertension - [controlled/uncontrolled]',
      plan: '1. Continue current antihypertensive regimen\n2. Low sodium diet, regular exercise counseling\n3. Labs: BMP to check renal function and electrolytes\n4. Return in [X] months',
    },
  },
  {
    id: '4',
    name: 'Diabetes Follow-up',
    category: 'Chronic',
    description: 'Type 2 diabetes management',
    content: {
      chiefComplaint: 'Diabetes follow-up',
      subjective: 'Patient returns for diabetes management. Taking medications as prescribed. Home glucose readings averaging [X]. Denies polyuria, polydipsia, or vision changes.',
      objective: 'General: Well-appearing, in no acute distress.\nVitals: As documented.\nCV: RRR, no murmurs.\nExtremities: No ulcers, monofilament sensation intact bilaterally.\nFeet: No lesions, pulses palpable.',
      assessment: 'Type 2 diabetes mellitus - [controlled/uncontrolled]',
      plan: '1. A1c today\n2. Continue current diabetes medications\n3. Diet and exercise counseling\n4. Annual eye exam recommended\n5. Return in [X] months',
    },
  },
]

export default function TemplatesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [templates, setTemplates] = useState(defaultTemplates)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof defaultTemplates[0] | null>(null)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'Acute',
    description: '',
    chiefComplaint: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  })

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Acute',
      description: '',
      chiefComplaint: '',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    })
    setEditingTemplateId(null)
  }

  const startEditTemplate = (template: typeof defaultTemplates[0]) => {
    setEditingTemplateId(template.id)
    setFormData({
      name: template.name,
      category: template.category,
      description: template.description,
      chiefComplaint: template.content.chiefComplaint,
      subjective: template.content.subjective,
      objective: template.content.objective,
      assessment: template.content.assessment,
      plan: template.content.plan,
    })
    setIsDialogOpen(true)
  }

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.chiefComplaint) {
      toast({
        title: 'Missing information',
        description: 'Please fill in name and chief complaint',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    if (editingTemplateId) {
      // Update existing template
      setTemplates(templates.map(t =>
        t.id === editingTemplateId
          ? {
              ...t,
              name: formData.name,
              category: formData.category,
              description: formData.description,
              content: {
                chiefComplaint: formData.chiefComplaint,
                subjective: formData.subjective,
                objective: formData.objective,
                assessment: formData.assessment,
                plan: formData.plan,
              },
            }
          : t
      ))
      toast({
        title: 'Template updated',
        description: 'Your template has been updated.',
      })
    } else {
      // Create new template
      const newTemplate = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        description: formData.description,
        content: {
          chiefComplaint: formData.chiefComplaint,
          subjective: formData.subjective,
          objective: formData.objective,
          assessment: formData.assessment,
          plan: formData.plan,
        },
      }
      setTemplates([newTemplate, ...templates])
      toast({
        title: 'Template created',
        description: 'Your new template has been saved.',
      })
    }

    setIsDialogOpen(false)
    resetForm()
    setSaving(false)
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId))
    toast({
      title: 'Template deleted',
      description: 'The template has been removed.',
    })
  }

  const copyTemplate = (template: typeof defaultTemplates[0]) => {
    const text = `Chief Complaint: ${template.content.chiefComplaint}\n\nSubjective:\n${template.content.subjective}\n\nObjective:\n${template.content.objective}\n\nAssessment:\n${template.content.assessment}\n\nPlan:\n${template.content.plan}`
    navigator.clipboard.writeText(text)
    toast({
      title: 'Template copied',
      description: 'The template has been copied to your clipboard.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Note Templates</h1>
          <p className="text-gray-500">Pre-built templates for common encounters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 active:scale-95"
              onClick={() => resetForm()}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplateId ? 'Edit Template' : 'Create New Template'}</DialogTitle>
              <DialogDescription>
                {editingTemplateId ? 'Update the template details below' : 'Create a reusable template for common encounters'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    placeholder="e.g., Back Pain Evaluation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Acute">Acute</SelectItem>
                      <SelectItem value="Chronic">Chronic</SelectItem>
                      <SelectItem value="Preventive">Preventive</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description of template"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Chief Complaint *</Label>
                <Input
                  placeholder="e.g., Lower back pain"
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Subjective</Label>
                <Textarea
                  placeholder="Patient history and symptoms..."
                  rows={3}
                  value={formData.subjective}
                  onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Objective</Label>
                <Textarea
                  placeholder="Physical exam findings..."
                  rows={3}
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Assessment</Label>
                <Textarea
                  placeholder="Diagnosis and clinical impression..."
                  rows={2}
                  value={formData.assessment}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <Textarea
                  placeholder="Treatment plan and follow-up..."
                  rows={3}
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                >
                  {saving ? 'Saving...' : editingTemplateId ? 'Update Template' : 'Save Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search templates..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="hover:border-teal-500 transition-colors cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Badge variant="outline">{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">CHIEF COMPLAINT</p>
                  <p className="text-sm">{template.content.chiefComplaint}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">SUBJECTIVE (preview)</p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.content.subjective}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => copyTemplate(template)}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditTemplate(template)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Detail Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedTemplate?.name}</DialogTitle>
              <Badge variant="outline">{selectedTemplate?.category}</Badge>
            </div>
            <p className="text-sm text-gray-500">{selectedTemplate?.description}</p>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">CHIEF COMPLAINT</p>
                <p className="text-sm font-medium">{selectedTemplate.content.chiefComplaint}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">SUBJECTIVE</p>
                <p className="text-sm whitespace-pre-wrap">{selectedTemplate.content.subjective}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">OBJECTIVE</p>
                <p className="text-sm whitespace-pre-wrap">{selectedTemplate.content.objective}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">ASSESSMENT</p>
                <p className="text-sm whitespace-pre-wrap">{selectedTemplate.content.assessment}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">PLAN</p>
                <p className="text-sm whitespace-pre-wrap">{selectedTemplate.content.plan}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    copyTemplate(selectedTemplate)
                    setSelectedTemplate(null)
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Template
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
