import { NextRequest } from 'next/server'
import { apiResponse, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'

const hasValidApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10

const openai = hasValidApiKey ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'X-Title': 'Healthcare Practice AI',
  },
}) : null

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'

// System prompt for chatbot
const SYSTEM_PROMPT = `You are a helpful healthcare practice assistant. You can help patients with:
1. Booking appointments - ask about preferred date, time, and reason for visit
2. Answering common questions about the practice (hours, location, services)
3. General health information (not medical advice)
4. Directing patients to appropriate resources

Important guidelines:
- Be friendly and professional
- Never provide specific medical diagnoses or treatment advice
- If the patient describes an emergency, tell them to call 911 or go to the ER immediately
- For complex issues, suggest speaking with a staff member
- Collect necessary information to help schedule appointments

When booking appointments, collect:
- Patient name
- Date of birth
- Phone number
- Preferred date/time
- Reason for visit

Always respond in a concise, helpful manner.`

// Public chatbot endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, message, practiceId } = body

    if (!message) {
      return apiError('Message is required', 400)
    }

    // Get or create conversation
    let conversation = sessionId
      ? await prisma.chatbotConversation.findUnique({
        where: { sessionId }
      })
      : null

    if (!conversation) {
      conversation = await prisma.chatbotConversation.create({
        data: {
          sessionId: sessionId || nanoid(16),
          channel: 'WEB',
          status: 'ACTIVE',
          messages: [],
          messagesCount: 0,
          startedAt: new Date()
        }
      })
    }

    // Get existing messages
    const messages = (conversation.messages as Array<{ role: string; content: string }>) || []

    // Add user message
    messages.push({
      role: 'user',
      content: message
    })

    // Detect intent
    const intent = detectIntent(message)

    // Check for emergency keywords
    if (isEmergency(message)) {
      const emergencyResponse = 'If this is a medical emergency, please call 911 immediately or go to your nearest emergency room. For urgent but non-emergency concerns, please call our office directly.'

      messages.push({
        role: 'assistant',
        content: emergencyResponse
      })

      await prisma.chatbotConversation.update({
        where: { id: conversation.id },
        data: {
          messages,
          messagesCount: messages.length,
          intent: 'EMERGENCY',
          handedOffToHuman: true,
          handoffReason: 'Emergency detected',
          handoffAt: new Date()
        }
      })

      return apiResponse({
        sessionId: conversation.sessionId,
        response: emergencyResponse,
        intent: 'EMERGENCY',
        requiresAction: true,
        action: 'CALL_911'
      })
    }

    // Generate response
    let response: string

    if (openai) {
      try {
        const chatResponse = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 500
        })

        response = chatResponse.choices[0]?.message?.content || 'I apologize, but I was unable to process your request. Please try again or call our office for assistance.'
      } catch (error) {
        console.error('AI chat error:', error)
        response = generateFallbackResponse(message, intent)
      }
    } else {
      response = generateFallbackResponse(message, intent)
    }

    // Add assistant response
    messages.push({
      role: 'assistant',
      content: response
    })

    // Update conversation
    await prisma.chatbotConversation.update({
      where: { id: conversation.id },
      data: {
        messages,
        messagesCount: messages.length,
        intent: intent || conversation.intent
      }
    })

    // Extract structured data if booking
    const bookingData = intent === 'BOOKING' ? extractBookingInfo(messages) : null

    return apiResponse({
      sessionId: conversation.sessionId,
      response,
      intent,
      bookingData,
      suggestedActions: getSuggestedActions(intent, bookingData)
    })
  } catch (error) {
    console.error('Chatbot error:', error)
    return apiError('Chat service error', 500)
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return apiError('Session ID required', 400)
    }

    const conversation = await prisma.chatbotConversation.findUnique({
      where: { sessionId }
    })

    if (!conversation) {
      return apiError('Conversation not found', 404)
    }

    return apiResponse({
      sessionId: conversation.sessionId,
      messages: conversation.messages,
      status: conversation.status,
      intent: conversation.intent
    })
  } catch (error) {
    console.error('Failed to get conversation:', error)
    return apiError('Failed to get conversation', 500)
  }
}

// Detect user intent
function detectIntent(message: string): string | null {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('appointment') ||
    lowerMessage.includes('schedule') ||
    lowerMessage.includes('book') ||
    lowerMessage.includes('available') ||
    lowerMessage.includes('see the doctor')) {
    return 'BOOKING'
  }

  if (lowerMessage.includes('hours') ||
    lowerMessage.includes('open') ||
    lowerMessage.includes('close') ||
    lowerMessage.includes('location') ||
    lowerMessage.includes('address') ||
    lowerMessage.includes('where')) {
    return 'FAQ'
  }

  if (lowerMessage.includes('pain') ||
    lowerMessage.includes('symptoms') ||
    lowerMessage.includes('sick') ||
    lowerMessage.includes('feeling') ||
    lowerMessage.includes('hurts')) {
    return 'SYMPTOMS'
  }

  if (lowerMessage.includes('bill') ||
    lowerMessage.includes('payment') ||
    lowerMessage.includes('insurance') ||
    lowerMessage.includes('cost') ||
    lowerMessage.includes('charge')) {
    return 'BILLING'
  }

  if (lowerMessage.includes('cancel') ||
    lowerMessage.includes('reschedule') ||
    lowerMessage.includes('change appointment')) {
    return 'MODIFY_APPOINTMENT'
  }

  return 'OTHER'
}

// Check for emergency keywords
function isEmergency(message: string): boolean {
  const emergencyKeywords = [
    'emergency',
    'chest pain',
    'can\'t breathe',
    'difficulty breathing',
    'stroke',
    'heart attack',
    'unconscious',
    'severe bleeding',
    'suicidal',
    'kill myself',
    'want to die',
    'overdose',
    '911'
  ]

  const lowerMessage = message.toLowerCase()
  return emergencyKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Generate fallback response without AI
function generateFallbackResponse(message: string, intent: string | null): string {
  switch (intent) {
    case 'BOOKING':
      return 'I\'d be happy to help you schedule an appointment. Could you please provide your preferred date and time, and the reason for your visit? You can also book online at our patient portal.'

    case 'FAQ':
      return 'Our office is typically open Monday through Friday, 8 AM to 5 PM. For specific hours, location details, or other information, please visit our website or call our front desk.'

    case 'SYMPTOMS':
      return 'I understand you\'re not feeling well. While I can\'t provide medical advice, I recommend scheduling an appointment with one of our providers who can properly evaluate your symptoms. Would you like to book an appointment?'

    case 'BILLING':
      return 'For billing questions, our billing department can best assist you. Please call our office and ask to speak with billing, or send a message through our patient portal.'

    case 'MODIFY_APPOINTMENT':
      return 'To cancel or reschedule an appointment, please call our office at least 24 hours in advance. You may also be able to make changes through our patient portal.'

    default:
      return 'Thank you for your message. How can I help you today? I can assist with scheduling appointments, answering questions about our practice, or directing you to the right resource.'
  }
}

// Extract booking information from conversation
function extractBookingInfo(
  messages: Array<{ role: string; content: string }>
): Record<string, string> | null {
  const allText = messages.map(m => m.content).join(' ')

  const info: Record<string, string> = {}

  // Simple extraction patterns
  const phoneMatch = allText.match(/\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/)
  if (phoneMatch) {
    info.phone = phoneMatch[0]
  }

  const dateMatch = allText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/)
  if (dateMatch) {
    info.requestedDate = dateMatch[0]
  }

  const timeMatch = allText.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/)
  if (timeMatch) {
    info.requestedTime = timeMatch[0]
  }

  return Object.keys(info).length > 0 ? info : null
}

// Get suggested actions based on context
function getSuggestedActions(
  intent: string | null,
  bookingData: Record<string, string> | null
): Array<{ action: string; label: string }> {
  const actions: Array<{ action: string; label: string }> = []

  if (intent === 'BOOKING') {
    actions.push({ action: 'OPEN_BOOKING', label: 'Book Online' })
    actions.push({ action: 'CALL_OFFICE', label: 'Call to Schedule' })
  }

  if (intent === 'FAQ') {
    actions.push({ action: 'VIEW_HOURS', label: 'View Hours' })
    actions.push({ action: 'VIEW_LOCATION', label: 'Get Directions' })
  }

  if (intent === 'SYMPTOMS') {
    actions.push({ action: 'OPEN_BOOKING', label: 'Schedule Appointment' })
    actions.push({ action: 'CALL_OFFICE', label: 'Speak to Nurse' })
  }

  if (intent === 'BILLING') {
    actions.push({ action: 'CALL_BILLING', label: 'Call Billing' })
    actions.push({ action: 'VIEW_PORTAL', label: 'Patient Portal' })
  }

  return actions
}
