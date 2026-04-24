'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2, RefreshCw, Info } from 'lucide-react'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel?: () => void
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  default: {
    icon: Info,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
    buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${config.iconBg}`}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button className={config.buttonClass} onClick={onConfirm} disabled={loading}>
            {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
