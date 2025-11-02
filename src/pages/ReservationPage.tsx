import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    fetchReservations,
    createReservationThunk,
    updateReservationThunk,
    cancelReservationThunk,
} from '../station/reservations/slice'
import { fetchStationsWithConnectors } from '../station/stations/slice'
import { logoutThunk } from '../station/auth/slice'
import type {
    Reservation,
    ReservationStatus,
    GetReservationsQuery,
} from '../station/reservations/types'
import { Pencil, XCircle, Search, X } from 'lucide-react'

const ReservationPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { items: reservations, page, status } = useAppSelector(
        (s) => s.reservations,
    )
    const { stationsWithConnectors } = useAppSelector((s) => s.stations)
    const { accessToken } = useAppSelector((s) => s.auth)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(5)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<ReservationStatus | ''>('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [editingReservation, setEditingReservation] =
        useState<Reservation | null>(null)
    const [cancelingReservation, setCancelingReservation] =
        useState<Reservation | null>(null)
    const [createFormData, setCreateFormData] = useState({
        stationId: '',
        connectorId: '',
        startTime: '',
        endTime: '',
    })
    const [editFormData, setEditFormData] = useState({
        stationId: '',
        connectorId: '',
        startTime: '',
        endTime: '',
        status: 'Pending' as ReservationStatus,
    })

    const prevDebouncedSearch = useRef('')
    const prevFilterStatus = useRef<ReservationStatus | ''>('')

    useEffect(() => {
        if (!accessToken) {
            navigate('/login')
            return
        }

        dispatch(fetchStationsWithConnectors())
    }, [dispatch, accessToken, navigate])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)

        return () => clearTimeout(timer)
    }, [search])

    // Fetch reservations when dependencies change
    useEffect(() => {
        if (!accessToken) return

        // Check if filters actually changed
        const searchChanged =
            prevDebouncedSearch.current !== debouncedSearch
        const statusChanged = prevFilterStatus.current !== filterStatus
        const filterChanged = searchChanged || statusChanged

        // Reset to page 1 when filters change (not when just paginating)
        if (filterChanged && currentPage !== 1) {
            prevDebouncedSearch.current = debouncedSearch
            prevFilterStatus.current = filterStatus
            setCurrentPage(1)
            return // Skip fetch, let the page change trigger a new fetch
        }

        // Update refs after checking
        if (searchChanged) prevDebouncedSearch.current = debouncedSearch
        if (statusChanged) prevFilterStatus.current = filterStatus

        const query: GetReservationsQuery = {
            pageNumber: currentPage,
            pageSize,
        }

        if (debouncedSearch.trim()) {
            query.userId = debouncedSearch.trim()
        }
        if (filterStatus) {
            query.status = filterStatus
        }

        dispatch(fetchReservations(query))
    }, [
        dispatch,
        currentPage,
        debouncedSearch,
        filterStatus,
        pageSize,
        accessToken,
    ])

    const handleLogout = async () => {
        await dispatch(logoutThunk())
        navigate('/login')
    }

    const handleClearFilters = () => {
        setSearch('')
        setFilterStatus('')
        setCurrentPage(1)
    }

    const hasActiveFilters = search.trim() !== '' || filterStatus !== ''

    const openCreateDialog = () => {
        setCreateFormData({
            stationId: '',
            connectorId: '',
            startTime: '',
            endTime: '',
        })
        setIsCreateDialogOpen(true)
    }

    const openEditDialog = (reservation: Reservation) => {
        setEditingReservation(reservation)
        setEditFormData({
            stationId: reservation.station.stationId,
            connectorId: reservation.station.connectors[0]?.connectorId || '',
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            status: reservation.status,
        })
        setIsEditDialogOpen(true)
    }

    const openCancelDialog = (reservation: Reservation) => {
        setCancelingReservation(reservation)
        setIsCancelDialogOpen(true)
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await dispatch(createReservationThunk(createFormData))
        setIsCreateDialogOpen(false)
        // Refresh handled by useEffect
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingReservation) {
            await dispatch(
                updateReservationThunk({
                    id: editingReservation.id,
                    ...editFormData,
                }),
            )
            setIsEditDialogOpen(false)
            setEditingReservation(null)
        }
    }

    const handleCancel = async () => {
        if (cancelingReservation) {
            await dispatch(cancelReservationThunk(cancelingReservation.id))
            setIsCancelDialogOpen(false)
            setCancelingReservation(null)
        }
    }

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-green-100 text-green-800'
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'Cancelled':
                return 'bg-gray-100 text-gray-800'
            case 'Completed':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const selectedStationConnectors =
        stationsWithConnectors.find(
            (s) => s.stationId === createFormData.stationId,
        )?.connectors || []

    const selectedStationConnectorsEdit =
        stationsWithConnectors.find(
            (s) => s.stationId === editFormData.stationId,
        )?.connectors || []

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Reservations
                    </h1>
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
                        {page &&
                            `Showing ${reservations.length} of ${page.totalCount} reservations`}
                    </p>
                    <button
                        onClick={openCreateDialog}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition shadow-md hover:shadow-lg"
                    >
                        + Create Reservation
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
                                Search by User ID
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
                                    placeholder="Enter user ID..."
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

                        {/* Status Filter */}
                        <div className="md:w-48">
                            <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Status
                            </label>
                            <select
                                id="status"
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(
                                        e.target.value as ReservationStatus | '',
                                    )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

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
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Station
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservations.map((reservation) => (
                                    <tr
                                        key={reservation.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {reservation.user}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {reservation.station.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {reservation.station.connectors
                                                    .map((c) => c.connectorType)
                                                    .join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(
                                                reservation.startTime,
                                            ).toLocaleString()} -{' '}
                                            {new Date(
                                                reservation.endTime,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}
                                            >
                                                {reservation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(
                                                reservation.createdAt,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-2">
                                                {reservation.status !==
                                                    'Cancelled' && (
                                                    <button
                                                        onClick={() =>
                                                            openEditDialog(
                                                                reservation,
                                                            )
                                                        }
                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit reservation"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                )}
                                                {reservation.status !==
                                                    'Cancelled' && (
                                                    <button
                                                        onClick={() =>
                                                            openCancelDialog(
                                                                reservation,
                                                            )
                                                        }
                                                        className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition"
                                                        title="Cancel reservation"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
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
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
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

            {/* Create Reservation Dialog */}
            {isCreateDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Create Reservation
                        </h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="stationId"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Station
                                </label>
                                <select
                                    id="stationId"
                                    value={createFormData.stationId}
                                    onChange={(e) => {
                                        setCreateFormData({
                                            ...createFormData,
                                            stationId: e.target.value,
                                            connectorId: '',
                                        })
                                    }}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Select a station</option>
                                    {stationsWithConnectors.map((station) => (
                                        <option
                                            key={station.stationId}
                                            value={station.stationId}
                                        >
                                            {station.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="connectorId"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Connector
                                </label>
                                <select
                                    id="connectorId"
                                    value={createFormData.connectorId}
                                    onChange={(e) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            connectorId: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={!createFormData.stationId}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {createFormData.stationId
                                            ? 'Select a connector'
                                            : 'Select station first'}
                                    </option>
                                    {selectedStationConnectors.map(
                                        (connector) => (
                                            <option
                                                key={connector.connectorId}
                                                value={connector.connectorId}
                                            >
                                                {connector.connectorType} -{' '}
                                                {connector.powerKw} kW
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="startTime"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Start Time
                                </label>
                                <input
                                    id="startTime"
                                    type="datetime-local"
                                    value={createFormData.startTime}
                                    onChange={(e) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            startTime: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="endTime"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    End Time
                                </label>
                                <input
                                    id="endTime"
                                    type="datetime-local"
                                    value={createFormData.endTime}
                                    onChange={(e) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            endTime: e.target.value,
                                        })
                                    }
                                    required
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

            {/* Edit Reservation Dialog */}
            {isEditDialogOpen && editingReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Edit Reservation
                        </h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="editStationId"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Station
                                </label>
                                <select
                                    id="editStationId"
                                    value={editFormData.stationId}
                                    onChange={(e) => {
                                        setEditFormData({
                                            ...editFormData,
                                            stationId: e.target.value,
                                            connectorId: '',
                                        })
                                    }}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Select a station</option>
                                    {stationsWithConnectors.map((station) => (
                                        <option
                                            key={station.stationId}
                                            value={station.stationId}
                                        >
                                            {station.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="editConnectorId"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Connector
                                </label>
                                <select
                                    id="editConnectorId"
                                    value={editFormData.connectorId}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            connectorId: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={!editFormData.stationId}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {editFormData.stationId
                                            ? 'Select a connector'
                                            : 'Select station first'}
                                    </option>
                                    {selectedStationConnectorsEdit.map(
                                        (connector) => (
                                            <option
                                                key={connector.connectorId}
                                                value={connector.connectorId}
                                            >
                                                {connector.connectorType} -{' '}
                                                {connector.powerKw} kW
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="editStartTime"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Start Time
                                </label>
                                <input
                                    id="editStartTime"
                                    type="datetime-local"
                                    value={editFormData.startTime.slice(0, 16)}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            startTime: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="editEndTime"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    End Time
                                </label>
                                <input
                                    id="editEndTime"
                                    type="datetime-local"
                                    value={editFormData.endTime.slice(0, 16)}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            endTime: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="editStatus"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Status
                                </label>
                                <select
                                    id="editStatus"
                                    value={editFormData.status}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            status: e.target.value as ReservationStatus,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Completed">Completed</option>
                                </select>
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

            {/* Cancel Reservation Dialog */}
            {isCancelDialogOpen && cancelingReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <XCircle className="text-orange-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Cancel Reservation
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to cancel reservation for{' '}
                                <span className="font-semibold">
                                    {cancelingReservation.user}
                                </span>{' '}
                                at{' '}
                                <span className="font-semibold">
                                    {cancelingReservation.station.name}
                                </span>
                                ?
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsCancelDialogOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-md hover:shadow-lg"
                            >
                                Cancel Reservation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReservationPage
