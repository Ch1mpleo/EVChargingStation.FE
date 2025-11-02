import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    fetchInvoices,
    createInvoiceFromSessionThunk,
    updateInvoiceThunk,
    deleteInvoiceThunk,
    payInvoiceThunk,
    cancelInvoiceThunk,
} from '../station/invoices/slice'
import { fetchSessions } from '../station/sessions/slice'
import { logoutThunk } from '../station/auth/slice'
import type { Invoice, InvoiceStatus, GetInvoicesQuery } from '../station/invoices/types'
import { Pencil, Trash2, DollarSign, XCircle, Search, ArrowUpDown, X } from 'lucide-react'

const InvoicesPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { items: invoices, page, status } = useAppSelector((s) => s.invoices)
    const { items: sessions } = useAppSelector((s) => s.sessions)
    const { accessToken } = useAppSelector((s) => s.auth)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(5)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sortBy, setSortBy] = useState<string>('')
    const [isDescending, setIsDescending] = useState(false)
    const prevDebouncedSearch = useRef('')
    const prevSortBy = useRef('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
    const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null)
    const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [createFormData, setCreateFormData] = useState({
        sessionId: '',
        taxRate: 10,
        dueDays: 7,
    })
    const [editFormData, setEditFormData] = useState({
        periodStart: '',
        periodEnd: '',
        status: 'Outstanding' as InvoiceStatus,
        subtotalAmount: 0,
        taxAmount: 0,
        amountPaid: 0,
        dueDate: '',
    })

    useEffect(() => {
        if (!accessToken) {
            navigate('/login')
            return
        }

        dispatch(fetchSessions({ page: 1, pageSize: 5 }))
    }, [dispatch, accessToken, navigate])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)

        return () => clearTimeout(timer)
    }, [search])

    // Fetch invoices when dependencies change
    useEffect(() => {
        if (!accessToken) return

        const searchChanged = prevDebouncedSearch.current !== debouncedSearch
        const sortChanged = prevSortBy.current !== sortBy
        const filterChanged = searchChanged || sortChanged

        if (filterChanged && currentPage !== 1) {
            prevDebouncedSearch.current = debouncedSearch
            prevSortBy.current = sortBy
            setCurrentPage(1)
            return // Skip fetch, let the page change trigger a new fetch
        }

        if (searchChanged) prevDebouncedSearch.current = debouncedSearch
        if (sortChanged) prevSortBy.current = sortBy

        const query: GetInvoicesQuery = {
            page: currentPage,
            pageSize,
        }

        if (debouncedSearch.trim()) {
            query.search = debouncedSearch.trim()
        }
        if (sortBy) {
            query.sortBy = sortBy
            query.isDescending = isDescending
        }

        dispatch(fetchInvoices(query))
    }, [dispatch, currentPage, debouncedSearch, sortBy, isDescending, pageSize, accessToken])

    const handleLogout = async () => {
        await dispatch(logoutThunk())
        navigate('/login')
    }

    const handleClearFilters = () => {
        setSearch('')
        setSortBy('')
        setIsDescending(false)
        setCurrentPage(1)
    }

    const hasActiveFilters = search.trim() !== '' || sortBy !== ''

    const handleSortChange = (field: string) => {
        if (sortBy === field) {
            setIsDescending(!isDescending)
        } else {
            setSortBy(field)
            setIsDescending(false)
        }
    }

    const openCreateDialog = () => {
        setCreateFormData({ sessionId: '', taxRate: 10, dueDays: 7 })
        setIsCreateDialogOpen(true)
    }

    const openEditDialog = (invoice: Invoice) => {
        setEditingInvoice(invoice)
        setEditFormData({
            periodStart: invoice.periodStart,
            periodEnd: invoice.periodEnd,
            status: invoice.status,
            subtotalAmount: invoice.subtotalAmount,
            taxAmount: invoice.taxAmount,
            amountPaid: invoice.amountPaid,
            dueDate: invoice.dueDate,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (invoice: Invoice) => {
        setDeletingInvoice(invoice)
        setIsDeleteDialogOpen(true)
    }

    const openPayDialog = (invoice: Invoice) => {
        setPayingInvoice(invoice)
        setPaymentAmount('')
        setIsPayDialogOpen(true)
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await dispatch(createInvoiceFromSessionThunk(createFormData))
        setIsCreateDialogOpen(false)
        // Refresh will be handled by the useEffect
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingInvoice) {
            await dispatch(
                updateInvoiceThunk({ id: editingInvoice.id, ...editFormData }),
            )
            setIsEditDialogOpen(false)
            setEditingInvoice(null)
        }
    }

    const handleDelete = async () => {
        if (deletingInvoice) {
            await dispatch(deleteInvoiceThunk(deletingInvoice.id))
            setIsDeleteDialogOpen(false)
            setDeletingInvoice(null)
        }
    }

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault()
        if (payingInvoice && paymentAmount) {
            await dispatch(
                payInvoiceThunk({
                    id: payingInvoice.id,
                    amountPaid: Number(paymentAmount),
                }),
            )
            setIsPayDialogOpen(false)
            setPayingInvoice(null)
            setPaymentAmount('')
        }
    }

    const handleCancel = async (invoice: Invoice) => {
        if (window.confirm(`Cancel invoice for ${invoice.userFullName}?`)) {
            await dispatch(cancelInvoiceThunk(invoice.id))
        }
    }

    const getStatusColor = (status: InvoiceStatus) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800'
            case 'Outstanding':
                return 'bg-yellow-100 text-yellow-800'
            case 'Overdue':
                return 'bg-red-100 text-red-800'
            case 'Canceled':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <p className="text-gray-600">
                        {page && `Showing ${invoices.length} of ${page.totalCount} invoices`}
                    </p>
                    <button
                        onClick={openCreateDialog}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition shadow-md hover:shadow-lg"
                    >
                        + Create Invoice
                    </button>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1">
                            <label
                                htmlFor="search"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Search
                            </label>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by customer name, email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="md:w-48">
                            <label
                                htmlFor="sortBy"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Sort By
                            </label>
                            <select
                                id="sortBy"
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">None</option>
                                <option value="totalAmount">Total Amount</option>
                                <option value="amountDue">Amount Due</option>
                                <option value="dueDate">Due Date</option>
                                <option value="periodStart">Period Start</option>
                                <option value="createdAt">Created Date</option>
                                <option value="userFullName">Customer Name</option>
                            </select>
                        </div>

                        {/* Sort Direction */}
                        {sortBy && (
                            <div className="md:w-40">
                                <label
                                    htmlFor="sortDirection"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Order
                                </label>
                                <button
                                    onClick={() => setIsDescending(!isDescending)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                >
                                    <ArrowUpDown size={18} className="text-gray-600" />
                                    <span className="text-sm text-gray-700">
                                        {isDescending ? 'Descending' : 'Ascending'}
                                    </span>
                                </button>
                            </div>
                        )}

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <div className="flex items-end">
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                                >
                                    <X size={16} />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {status === 'loading' && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                )}

                {status === 'succeeded' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount Due
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {invoice.userFullName}
                                            </div>
                                            <div className="text-sm text-gray-500">{invoice.userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(invoice.periodStart).toLocaleDateString()} -{' '}
                                            {new Date(invoice.periodEnd).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}
                                            >
                                                {invoice.statusDisplay}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            {formatCurrency(invoice.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            {formatCurrency(invoice.amountDue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-2">
                                                {invoice.status !== 'Canceled' && invoice.status !== 'Paid' && (
                                                    <button
                                                        onClick={() => openPayDialog(invoice)}
                                                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition"
                                                        title="Pay invoice"
                                                    >
                                                        <DollarSign size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditDialog(invoice)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit invoice"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                {invoice.status !== 'Canceled' && (
                                                    <button
                                                        onClick={() => handleCancel(invoice)}
                                                        className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition"
                                                        title="Cancel invoice"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openDeleteDialog(invoice)}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete invoice"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {page && page.totalPages > 1 && (
                    <div className="mt-6 flex justify-center items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={!page.hasPrevious}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {page.currentPage} of {page.totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={!page.hasNext}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            {/* Create Invoice Dialog */}
            {isCreateDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Create Invoice from Session
                        </h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="sessionId"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Session
                                </label>
                                <select
                                    id="sessionId"
                                    value={createFormData.sessionId}
                                    onChange={(e) =>
                                        setCreateFormData({ ...createFormData, sessionId: e.target.value })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Select a session</option>
                                    {sessions
                                        .filter((s) => s.status === 'Stopped')
                                        .map((session) => (
                                            <option key={session.id} value={session.id}>
                                                {session.userFullName} - {session.energyKwh} kWh (
                                                {formatCurrency(session.cost)})
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="taxRate"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Tax Rate (%)
                                </label>
                                <input
                                    id="taxRate"
                                    type="number"
                                    value={createFormData.taxRate}
                                    onChange={(e) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            taxRate: Number(e.target.value),
                                        })
                                    }
                                    required
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="dueDays"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Due Days
                                </label>
                                <input
                                    id="dueDays"
                                    type="number"
                                    value={createFormData.dueDays}
                                    onChange={(e) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            dueDays: Number(e.target.value),
                                        })
                                    }
                                    required
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-md hover:shadow-lg"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Invoice Dialog */}
            {isEditDialogOpen && editingInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Invoice</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Period Start
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editFormData.periodStart.slice(0, 16)}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, periodStart: e.target.value })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Period End
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editFormData.periodEnd.slice(0, 16)}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, periodEnd: e.target.value })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={editFormData.status}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            status: e.target.value as InvoiceStatus,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="Outstanding">Outstanding</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Overdue">Overdue</option>
                                    <option value="Canceled">Canceled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subtotal Amount
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.subtotalAmount}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            subtotalAmount: Number(e.target.value),
                                        })
                                    }
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tax Amount
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.taxAmount}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            taxAmount: Number(e.target.value),
                                        })
                                    }
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount Paid
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.amountPaid}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            amountPaid: Number(e.target.value),
                                        })
                                    }
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editFormData.dueDate.slice(0, 16)}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, dueDate: e.target.value })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-md hover:shadow-lg"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Invoice Dialog */}
            {isPayDialogOpen && payingInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Pay Invoice</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Amount Due: {formatCurrency(payingInvoice.amountDue)}
                                </p>
                            </div>
                        </div>
                        <form onSubmit={handlePay} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Amount
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    required
                                    min="1"
                                    max={payingInvoice.amountDue}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    placeholder="Enter payment amount"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsPayDialogOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-md hover:shadow-lg"
                                >
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Invoice Dialog */}
            {isDeleteDialogOpen && deletingInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Delete Invoice</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to delete invoice for{' '}
                                <span className="font-semibold">{deletingInvoice.userFullName}</span>?
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md hover:shadow-lg"
                            >
                                Delete Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InvoicesPage

