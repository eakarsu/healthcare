'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Paperclip,
  ChevronLeft,
  User,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'

interface Message {
  id: string
  from: string
  to: string
  subject: string
  body: string
  date: string
  unread: boolean
  replies?: Message[]
}

export default function PortalMessagesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  // Compose form state
  const [composeRecipient, setComposeRecipient] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')

  // Mock data
  const messages: Message[] = [
    {
      id: '1',
      from: 'Dr. Sarah Wilson',
      to: 'John Smith',
      subject: 'Lab Results Available',
      body: 'Dear John,\n\nYour recent lab results are now available for review. Overall, your results look good. Your cholesterol levels have improved since your last visit.\n\nPlease schedule a follow-up appointment if you have any questions or concerns.\n\nBest regards,\nDr. Sarah Wilson',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      unread: true,
      replies: [
        {
          id: '1-1',
          from: 'John Smith',
          to: 'Dr. Sarah Wilson',
          subject: 'Re: Lab Results Available',
          body: 'Thank you Dr. Wilson! I\'m glad to hear the results look good. I\'ll schedule a follow-up soon.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          unread: false,
        },
      ],
    },
    {
      id: '2',
      from: 'Front Desk',
      to: 'John Smith',
      subject: 'Appointment Reminder',
      body: 'This is a reminder for your upcoming appointment on Friday at 10:00 AM with Dr. Wilson.\n\nPlease remember to:\n- Arrive 15 minutes early\n- Bring your insurance card\n- Bring a list of current medications\n\nIf you need to reschedule, please call our office or use the patient portal.',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      unread: false,
    },
    {
      id: '3',
      from: 'Billing Department',
      to: 'John Smith',
      subject: 'Statement Available',
      body: 'Dear John Smith,\n\nYour statement for services rendered on October 15, 2024 is now available. You can view and pay your balance through the patient portal.\n\nIf you have any questions about your bill, please contact our billing department.\n\nThank you,\nBilling Department',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      unread: false,
    },
  ]

  const filteredMessages = messages.filter((msg) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      msg.subject.toLowerCase().includes(searchLower) ||
      msg.from.toLowerCase().includes(searchLower) ||
      msg.body.toLowerCase().includes(searchLower)
    )
  })

  const handleSendMessage = () => {
    if (!composeRecipient || !composeSubject || !composeBody) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Message sent',
      description: 'Your message has been sent successfully.',
    })
    setIsComposeOpen(false)
    setComposeRecipient('')
    setComposeSubject('')
    setComposeBody('')
  }

  const handleSendReply = () => {
    if (!replyText.trim()) return

    toast({
      title: 'Reply sent',
      description: 'Your reply has been sent successfully.',
    })
    setReplyText('')
  }

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Messages
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedMessage.subject}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedMessage.from}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(selectedMessage.date), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Original Message */}
            <div className="whitespace-pre-wrap text-gray-700">
              {selectedMessage.body}
            </div>

            {/* Replies */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                {selectedMessage.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-700">{reply.from}</span>
                      <span>{format(new Date(reply.date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700">
                      {reply.body}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Box */}
            <div className="border-t pt-4">
              <Label className="mb-2 block">Reply</Label>
              <Textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
              <div className="flex justify-between mt-3">
                <Button variant="outline" size="sm">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach File
                </Button>
                <Button onClick={handleSendReply} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500">Securely communicate with your care team</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={composeRecipient} onValueChange={setComposeRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-wilson">Dr. Sarah Wilson</SelectItem>
                    <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="front-desk">Front Desk</SelectItem>
                    <SelectItem value="billing">Billing Department</SelectItem>
                    <SelectItem value="nursing">Nursing Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Enter subject..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your message..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Button variant="outline" size="sm">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach File
                </Button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search messages..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    message.unread ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${message.unread ? 'text-blue-900' : 'text-gray-900'}`}>
                          {message.from}
                        </p>
                        {message.unread && (
                          <Badge className="bg-blue-500 text-xs">New</Badge>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${message.unread ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {message.body.substring(0, 100)}...
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                      {format(new Date(message.date), 'MMM d')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Messages are typically responded to within 24-48 business hours.
            For urgent medical concerns, please call our office or dial 911.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
