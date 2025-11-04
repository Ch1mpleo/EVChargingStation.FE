import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchVehicles, createVehicleThunk, updateVehicleThunk, deleteVehicleThunk } from '../station/vehicles/slice'
import { logoutThunk } from '../station/auth/slice'
import type { Vehicle, ConnectorType } from '../station/vehicles/types'
import { Pencil, Trash2 } from 'lucide-react'

const VehiclesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items: vehicles, page, status } = useAppSelector((s) => s.vehicles)
  const { accessToken } = useAppSelector((s) => s.auth)

  const [currentPage, setCurrentPage] = useState(1)
  const [model, setModel] = useState('')
  const [brand, setBrand] = useState('')
  const [debouncedModel, setDebouncedModel] = useState('')
  const [debouncedBrand, setDebouncedBrand] = useState('')
  const [connectorFilter, setConnectorFilter] = useState<'' | ConnectorType>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    connectorType: 'CCS' as ConnectorType,
  })

  useEffect(() => {
    if (!accessToken) {
      navigate('/login')
      return
    }
    dispatch(fetchVehicles({ page: currentPage, pageSize: 10 }))
  }, [dispatch, currentPage, accessToken, navigate])

  // Debounce filters
  useEffect(() => {
    const t1 = setTimeout(() => setDebouncedModel(model), 400)
    const t2 = setTimeout(() => setDebouncedBrand(brand), 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [model, brand])

  // Refetch when filters change
  useEffect(() => {
    if (!accessToken) return
    const query: { page: number; pageSize: number; model?: string; brand?: string; connectorType?: ConnectorType } = {
      page: currentPage,
      pageSize: 10,
    }
    if (debouncedModel.trim()) query.model = debouncedModel.trim()
    if (debouncedBrand.trim()) query.brand = debouncedBrand.trim()
    if (connectorFilter) query.connectorType = connectorFilter
    dispatch(fetchVehicles(query))
  }, [dispatch, currentPage, debouncedModel, debouncedBrand, connectorFilter, accessToken])

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate('/login')
  }

  const openCreateDialog = () => {
    setEditingVehicle(null)
    setFormData({ make: '', model: '', year: new Date().getFullYear(), licensePlate: '', connectorType: 'CCS' })
    setIsDialogOpen(true)
  }

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({ make: vehicle.make, model: vehicle.model, year: vehicle.year, licensePlate: vehicle.licensePlate, connectorType: vehicle.connectorType })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingVehicle(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingVehicle) {
      await dispatch(updateVehicleThunk({ guid: editingVehicle.huyPDID, ...formData }))
    } else {
      await dispatch(createVehicleThunk(formData))
    }
    closeDialog()
    dispatch(fetchVehicles({ page: currentPage, pageSize: 10 }))
  }

  const openDeleteDialog = (vehicle: Vehicle) => {
    setDeletingVehicle(vehicle)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setDeletingVehicle(null)
  }

  const handleDelete = async () => {
    if (deletingVehicle) {
      await dispatch(deleteVehicleThunk(deletingVehicle.huyPDID))
      closeDeleteDialog()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
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
            {page && `Showing ${vehicles.length} of ${page.totalCount} vehicles`}
          </p>
          <button
            onClick={openCreateDialog}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition shadow-md hover:shadow-lg"
          >
            + Add Vehicle
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="modelFilter" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                id="modelFilter"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="brandFilter" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                id="brandFilter"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All</option>
                <option value="VinFast">VinFast</option>
                <option value="Tesla">Tesla</option>
                <option value="BMW">BMW</option>
                <option value="Audi">Audi</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Kia">Kia</option>
                <option value="Nissan">Nissan</option>
                <option value="Mitsubishi">Mitsubishi</option>
                <option value="Porsche">Porsche</option>
                <option value="BYD">BYD</option>
              </select>
            </div>
            <div className="md:w-48">
              <label htmlFor="connectorFilter" className="block text-sm font-medium text-gray-700 mb-1">Connector</label>
              <select
                id="connectorFilter"
                value={connectorFilter}
                onChange={(e) => setConnectorFilter(e.target.value as '' | ConnectorType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All</option>
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="AC">AC</option>
              </select>
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connector</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((v) => (
                  <tr key={v.huyPDID} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.make}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{v.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{v.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{v.licensePlate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{v.connectorType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openEditDialog(v)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                          title="Edit vehicle"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(v)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                          title="Delete vehicle"
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

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  required
                  min={1980}
                  max={2100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Connector Type</label>
                <select
                  value={formData.connectorType}
                  onChange={(e) => setFormData({ ...formData, connectorType: e.target.value as ConnectorType })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="CCS">CCS</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="AC">AC</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-md hover:shadow-lg"
                >
                  {editingVehicle ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && deletingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Vehicle</h2>
                <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{deletingVehicle.make} {deletingVehicle.model}</span>?
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md hover:shadow-lg"
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VehiclesPage

