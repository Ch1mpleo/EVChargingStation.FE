import httpClient from '../api/httpClient'
import type {
    CreateInvoiceFromSessionRequest,
    DeleteInvoiceResponse,
    GetInvoicesQuery,
    GetInvoicesResponse,
    InvoiceResponse,
    PayInvoiceRequest,
    UpdateInvoiceRequest,
} from './types'

export async function getInvoices(
    query: GetInvoicesQuery,
): Promise<GetInvoicesResponse> {
    const { data } = await httpClient.get<GetInvoicesResponse>('/invoices', {
        params: query,
    })
    return data
}

export async function createInvoiceFromSession(
    payload: CreateInvoiceFromSessionRequest,
): Promise<InvoiceResponse> {
    const { data } = await httpClient.post<InvoiceResponse>(
        '/invoices/from-session',
        payload,
    )
    return data
}

export async function updateInvoice(
    payload: UpdateInvoiceRequest,
): Promise<InvoiceResponse> {
    const { data } = await httpClient.put<InvoiceResponse>(
        `/invoices/${payload.id}`,
        {
            periodStart: payload.periodStart,
            periodEnd: payload.periodEnd,
            status: payload.status,
            subtotalAmount: payload.subtotalAmount,
            taxAmount: payload.taxAmount,
            amountPaid: payload.amountPaid,
            dueDate: payload.dueDate,
        },
    )
    return data
}

export async function deleteInvoice(id: string): Promise<DeleteInvoiceResponse> {
    const { data } = await httpClient.delete<DeleteInvoiceResponse>(
        `/invoices/${id}`,
    )
    return data
}

export async function payInvoice(
    payload: PayInvoiceRequest,
): Promise<InvoiceResponse> {
    const { data } = await httpClient.post<InvoiceResponse>(
        `/invoices/${payload.id}/pay`,
        null,
        { params: { amountPaid: payload.amountPaid } },
    )
    return data
}

export async function cancelInvoice(id: string): Promise<InvoiceResponse> {
    const { data } = await httpClient.post<InvoiceResponse>(
        `/invoices/${id}/cancel`,
    )
    return data
}

