export type ApiEnvelope<T> = {
  isSuccess: boolean
  value: {
    code: string
    message: string
    data: T
  }
  error: unknown | null
}

export type InvoiceStatus = 'Outstanding' | 'Paid' | 'Overdue' | 'Canceled'

export type Invoice = {
  id: string
  userId: string
  userEmail: string
  userFullName: string
  sessionId: string
  periodStart: string
  periodEnd: string
  status: InvoiceStatus
  statusDisplay: string
  subtotalAmount: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  amountDue: number
  dueDate: string
  issuedAt: string
  isOverdue: boolean
  createdAt: string
  updatedAt: string
}

export type Paged<T> = {
  items: T[]
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  hasPrevious: boolean
  hasNext: boolean
}

// Status that can be used for filtering (server supports a subset)
export type InvoiceFilterStatus = 'Outstanding' | 'Paid' | 'Canceled'

export type GetInvoicesQuery = {
  search?: string
  sortBy?: string
  isDescending?: boolean
  page?: number
  pageSize?: number
  status?: InvoiceFilterStatus
}

export type CreateInvoiceFromSessionRequest = {
  sessionId: string
  taxRate: number
  dueDays: number
}

export type UpdateInvoiceRequest = {
  id: string
  periodStart: string
  periodEnd: string
  status: InvoiceStatus
  subtotalAmount: number
  taxAmount: number
  amountPaid: number
  dueDate: string
}

export type PayInvoiceRequest = {
  id: string
  amountPaid: number
}

export type GetInvoicesResponse = ApiEnvelope<Paged<Invoice>>
export type InvoiceResponse = ApiEnvelope<Invoice>
export type DeleteInvoiceResponse = ApiEnvelope<boolean>

