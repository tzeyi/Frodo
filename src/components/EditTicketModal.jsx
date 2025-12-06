import { useState } from 'react'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase' // adjust path to your firebase config

const EditTicketModal = ({ 
  selectedTicket, 
  onClose, 
  masterEvents, 
  userContributions, 
  getEventName, 
  getLocationName, 
  handleTakeTicket,
  onTicketUpdated,
  onTicketDeleted
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTicket, setEditedTicket] = useState(null)

  if (!selectedTicket) return null

  // Start editing
  const handleEditClick = () => {
    setIsEditing(true)
    setEditedTicket({ ...selectedTicket })
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedTicket(null)
  }

  // Save changes to Firestore
  const handleSaveEdit = async () => {
    try {
      const ticketRef = doc(db, 'tickets', selectedTicket.id)
      await updateDoc(ticketRef, {
        title: editedTicket.title,
        description: editedTicket.description,
        amountRequested: Number(editedTicket.amountRequested),
        resourceType: editedTicket.resourceType,
        unit: editedTicket.unit,
        priority: editedTicket.priority,
        status: editedTicket.status,
        locationId: editedTicket.locationId,
      })
      
      setIsEditing(false)
      alert('Ticket updated successfully!')
      if (onTicketUpdated) onTicketUpdated(editedTicket)
    } catch (error) {
      console.error('Error updating ticket:', error)
      alert('Failed to update ticket')
    }
  }

  // Delete ticket from Firestore
  const handleDeleteTicket = async () => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return
    }
    
    try {
      const ticketRef = doc(db, 'tickets', selectedTicket.id)
      await deleteDoc(ticketRef)
      
      alert('Ticket deleted successfully!')
      if (onTicketDeleted) onTicketDeleted(selectedTicket.id)
      onClose()
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert('Failed to delete ticket')
    }
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedTicket(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const currentTicket = isEditing ? editedTicket : selectedTicket

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{isEditing ? 'Edit Ticket' : selectedTicket.title}</h3>
            {isEditing ? (
                <button className="btn btn-ghost" onClick={handleCancelEdit}>
                    Cancel
                </button>
            ) : (
                <button className="btn btn-ghost btn-circle" onClick={handleEditClick} aria-label="Edit Ticket">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4l12-12-4-4L4 16v4z" />
                    </svg>
                </button>
            )}
        </div>

        <div className="py-4">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editedTicket.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  value={editedTicket.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Resource Type</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editedTicket.resourceType}
                    onChange={(e) => handleInputChange('resourceType', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Unit</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editedTicket.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Amount Requested</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={editedTicket.amountRequested}
                  onChange={(e) => handleInputChange('amountRequested', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Priority</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={editedTicket.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Status</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={editedTicket.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <>
              <p className="text-base-content/70 mb-4">{selectedTicket.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Event:</span>
                  <span>{getEventName(selectedTicket)}</span>
                </div>
                {(() => {
                  const event = masterEvents.find(e => String(e.id) === String(selectedTicket.eventId))
                  return event ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Event Start:</span>
                        <span>{new Date(event.startDate).toLocaleString()}</span>
                      </div>
                      {event.endDate && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Event End:</span>
                          <span>{new Date(event.endDate).toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  ) : null
                })()}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Resource:</span>
                  <span className="capitalize">{selectedTicket.resourceType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Requested:</span>
                  <span>{selectedTicket.amountRequested} {selectedTicket.unit}</span>
                </div>
                {(() => {
                  const userContrib = userContributions[selectedTicket.id] || 0
                  const totalContrib = selectedTicket.amountAchieved || 0
                  const remaining = selectedTicket.amountRequested - totalContrib
                  return (
                    <>
                      {userContrib > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">Your Contribution:</span>
                          <span className="text-primary">{userContrib} {selectedTicket.unit}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Total Contributed:</span>
                        <span>{totalContrib} / {selectedTicket.amountRequested} {selectedTicket.unit}</span>
                      </div>
                      {remaining > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-warning">Remaining Needed:</span>
                          <span className="text-warning">{remaining} {selectedTicket.unit}</span>
                        </div>
                      )}
                      {remaining <= 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-success">Status:</span>
                          <span className="text-success">✓ Goal Achieved!</span>
                        </div>
                      )}
                    </>
                  )
                })()}
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Progress:</span>
                    <span>{Math.round(((selectedTicket.amountAchieved || 0) / selectedTicket.amountRequested) * 100)}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={selectedTicket.amountAchieved || 0} 
                    max={selectedTicket.amountRequested}
                  ></progress>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Location:</span>
                  <span>{getLocationName(selectedTicket.locationId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Priority:</span>
                  <span
                    className={`badge badge-outline ${selectedTicket.priority === 'high'
                      ? 'badge-error'
                      : selectedTicket.priority === 'medium'
                        ? 'badge-warning'
                        : 'badge-info'
                      }`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Current Status:</span>
                  <span
                    className={`badge ${selectedTicket.status === 'open'
                      ? 'badge-error'
                      : selectedTicket.status === 'in-progress'
                        ? 'badge-warning'
                        : 'badge-success'
                      }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-action">
          {isEditing ? (
            <>
              <button className="btn btn-success" onClick={handleSaveEdit}>
                Save Changes
              </button>
                <button className="btn btn-outline btn-error" onClick={handleDeleteTicket}>
                Delete
              </button>
            </>
          ) : (
            <>
              {(selectedTicket.status === 'open' || selectedTicket.status === 'in-progress') && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleTakeTicket(selectedTicket)}
                >
                  Contribute
                </button>
              )}
              <button className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}

export default EditTicketModal