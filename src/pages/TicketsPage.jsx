import { useState, useEffect } from 'react'
import SideBar from '../components/SideBar'
import { auth } from '../firebase'
import { 
  getAllTickets, 
  createTicket, 
  updateTicketStatus as updateTicketStatusService,
  getResourceTypes,
  getUnitsForResourceType,
  createEvent,
  getAllEvents,
  createContribution,
  getUserContributionForTicket,
  getUserContributions
} from '../services/resourceService'
import { getAllLocations, getAllOrganizations } from '../services/seedFirestore'
import Toast from '../components/Toast'


function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [masterEvents, setMasterEvents] = useState([])
  const [locations, setLocations] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [resourceTypes, setResourceTypes] = useState([])
  const [selectedResourceType, setSelectedResourceType] = useState('')
  const [availableUnits, setAvailableUnits] = useState([])
  const [customUnit, setCustomUnit] = useState('')
  const [customResourceType, setCustomResourceType] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [viewMode, setViewMode] = useState('table')
  const [activeEventKey, setActiveEventKey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [user, setUser] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEventForTicket, setSelectedEventForTicket] = useState(null)
  const [contributionAmount, setContributionAmount] = useState('')
  const [showContributionModal, setShowContributionModal] = useState(false)
  const [ticketToTake, setTicketToTake] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [userContributions, setUserContributions] = useState({})
  const [myContributions, setMyContributions] = useState([])
  const [contributionsPage, setContributionsPage] = useState(1)
  const [contributionsPerPage, setContributionsPerPage] = useState(5)

  // Load user contributions for all tickets
  const loadUserContributions = async (ticketsData, userId) => {
    if (!userId || !ticketsData || ticketsData.length === 0) return
    
    try {
      const contributionsMap = {}
      await Promise.all(
        ticketsData.map(async (ticket) => {
          const userContrib = await getUserContributionForTicket(ticket.id, userId)
          contributionsMap[ticket.id] = userContrib.amount
        })
      )
      setUserContributions(contributionsMap)
    } catch (error) {
      console.error('Error loading user contributions:', error)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const currentUser = auth.currentUser
        setUser(currentUser)

        // Fetch tickets, locations, organizations, and events from Firestore
        const [ticketsData, locationsData, orgsData, eventsData] = await Promise.all([
          getAllTickets(),
          getAllLocations(),
          getAllOrganizations(),
          getAllEvents()
        ])

        setTickets(ticketsData)
        setLocations(locationsData)
        setOrganizations(orgsData)
        setMasterEvents(eventsData)
        
        // Load resource types from config
        setResourceTypes(getResourceTypes())
        
        // Load user contributions
        if (currentUser) {
          await loadUserContributions(ticketsData, currentUser.uid)
          
          // Load all contributions made by user
          const allUserContributions = await getUserContributions(currentUser.uid)
          setMyContributions(allUserContributions)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        showToast('Failed to load tickets', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleResourceTypeChange = (resourceTypeId) => {
    setSelectedResourceType(resourceTypeId)
    const units = getUnitsForResourceType(resourceTypeId)
    setAvailableUnits(units)
    setCustomUnit('')
    setCustomResourceType('')
  }

  const handleEventSelection = (eventId) => {
    const event = masterEvents.find(e => String(e.id) === String(eventId))
    setSelectedEventForTicket(event)
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const eventData = {
        name: formData.get('eventName'),
        description: formData.get('eventDescription'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate') || null,
        locationId: formData.get('eventLocationId'),
        organizationId: formData.get('eventOrganizationId') || user?.organizationId || null,
        status: 'active'
      }
      
      const newEvent = await createEvent(eventData)
      setMasterEvents(prev => [...prev, newEvent])
      showToast('Event created successfully!', 'success')
      setShowEventModal(false)
      e.target.reset()
    } catch (error) {
      console.error('Error creating event:', error)
      showToast('Failed to create event', 'error')
    }
  }

  const handleTakeTicket = (ticket) => {
    setTicketToTake(ticket)
    setContributionAmount('')
    setShowContributionModal(true)
  }

  const handleSubmitContribution = async () => {
    if (!contributionAmount || parseInt(contributionAmount) <= 0) {
      showToast('Please enter a valid contribution amount', 'error')
      return
    }

    const amount = parseInt(contributionAmount)
    const currentAchieved = ticketToTake.amountAchieved || 0
    const remaining = ticketToTake.amountRequested - currentAchieved

    if (amount > remaining) {
      showToast(`Contribution exceeds remaining amount (${remaining} ${ticketToTake.unit})`, 'error')
      return
    }

    setSubmitting(true)
    try {
      // Create contribution document
      await createContribution({
        ticketId: ticketToTake.id,
        userId: user.uid,
        userName: user.displayName || user.email,
        amount: amount,
        unit: ticketToTake.unit,
        contributedAt: new Date().toISOString()
      })
      
      // Refresh tickets to get updated amounts
      const ticketsData = await getAllTickets()
      setTickets(ticketsData)
      
      // Reload user contributions
      await loadUserContributions(ticketsData, user.uid)
      
      // Reload all user contributions
      const allUserContributions = await getUserContributions(user.uid)
      setMyContributions(allUserContributions)
      
      showToast(`Successfully contributed ${amount} ${ticketToTake.unit}!`, 'success')
      setShowContributionModal(false)
      setTicketToTake(null)
      setContributionAmount('')
      setSelectedTicket(null)
    } catch (error) {
      console.error('Error submitting contribution:', error)
      showToast('Failed to submit contribution', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getEventId = (t) => (t?.eventId ? String(t.eventId) : 'none')

  const getEventFromMaster = (id) =>
    masterEvents.find((e) => String(e.id) === String(id))
  3
  const getEventName = (t) => {
    const id = getEventId(t)
    if (id === 'none') return 'None'
    const e = getEventFromMaster(id)
    return e?.name || 'Unknown Event'
  }

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId)
    return location?.name || locationId || 'Unknown'
  }

  const events = (() => {
    const map = new Map()

    masterEvents.forEach((e, idx) => {
      map.set(String(e.id), {
        key: String(e.id),
        name: e.name || 'Unknown Event',
        location: e.location || null,
        startDate: e.startDate || null,
        endDate: e.endDate || null,
        total: 0,
        closed: 0,
      })
    })

    tickets.forEach((t, idx) => {
      const id = getEventId(t)
      if (!map.has(id)) {
        const e = getEventFromMaster(id)
        map.set(id, {
          key: id,
          name: e?.name || (id === 'none' ? 'None' : 'Unknown Event'),
          location: e?.location || (t.location ?? null),
          startDate: e?.startDate || null,
          endDate: e?.endDate || null,
          total: 0,
          closed: 0,
        })
      }
      const ev = map.get(id)
      ev.total += 1
      if (t.status === 'closed') ev.closed += 1
    })

    return Array.from(map.values())
      .map((ev) => ({
        ...ev,
        progress: ev.total ? Math.round((ev.closed / ev.total) * 100) : 0,
      }))
  })()

  const filteredTickets =
    !activeEventKey
      ? tickets
      : tickets.filter((t) => getEventId(t) === activeEventKey)

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await updateTicketStatusService(ticketId, newStatus)
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      )
      setSelectedTicket(null)
      showToast(`Ticket status updated to ${newStatus}`, 'success')
    } catch (error) {
      console.error('Error updating ticket:', error)
      showToast('Failed to update ticket status', 'error')
    }
  }

  const ticketsByStatus = {
    // Change 'tickets' to 'filteredTickets' here
    'open': filteredTickets.filter(t => t.status === 'open'),
    'in-progress': filteredTickets.filter(t => t.status === 'in-progress'),
    'closed': filteredTickets.filter(t => t.status === 'closed')
  }

  const pageContent = (
    <>
      {/* Header with View Toggle */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center p-5">
        <h1 className="text-3xl font-bold text-primary">Tickets</h1>

        <div className="tabs tabs-boxed w-fit">
          <button
            className={`tab ${viewMode === 'table' ? 'tab-active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button
            className={`tab ${viewMode === 'kanban' ? 'tab-active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            Kanban View
          </button>
        </div>
      </div>

      {/* MY CONTRIBUTIONS SECTION */}
      {myContributions.length > 0 && (
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">My Contributions</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-base-content/70">Rows per page:</label>
              <select 
                className="select select-sm select-bordered"
                value={contributionsPerPage}
                onChange={(e) => {
                  setContributionsPerPage(Number(e.target.value))
                  setContributionsPage(1)
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          <div className="bg-base-200 rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Amount</th>
                    <th>Contributed At</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const startIndex = (contributionsPage - 1) * contributionsPerPage
                    const endIndex = startIndex + contributionsPerPage
                    const paginatedContributions = myContributions.slice(startIndex, endIndex)
                    
                    return paginatedContributions.map((contrib) => {
                      const ticket = tickets.find(t => Number(t.id) === Number(contrib.ticketId))
                      return (
                        <tr 
                          key={contrib.id} 
                          className="hover cursor-pointer"
                          onClick={() => ticket && setSelectedTicket(ticket)}
                        >
                          <td>
                            <div className="font-semibold text-primary">{ticket?.title || `Ticket #${contrib.ticketId}`}</div>
                            {ticket && (
                              <div className="text-xs text-base-content/70 capitalize">{ticket.resourceType}</div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-primary badge-lg">
                              {contrib.amount} {ticket?.unit || contrib.unit}
                            </span>
                          </td>
                          <td className="text-sm">
                            {new Date(contrib.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-base-content/70">
                Total tickets contributed to: <span className="font-semibold text-primary">{myContributions.length}</span>
                {myContributions.length > contributionsPerPage && (
                  <span className="ml-2">
                    (Showing {((contributionsPage - 1) * contributionsPerPage) + 1} - {Math.min(contributionsPage * contributionsPerPage, myContributions.length)})
                  </span>
                )}
              </div>
              {myContributions.length > contributionsPerPage && (
                <div className="join">
                  <button 
                    className="join-item btn btn-sm"
                    onClick={() => setContributionsPage(p => Math.max(1, p - 1))}
                    disabled={contributionsPage === 1}
                  >
                    «
                  </button>
                  <button className="join-item btn btn-sm">
                    Page {contributionsPage} of {Math.ceil(myContributions.length / contributionsPerPage)}
                  </button>
                  <button 
                    className="join-item btn btn-sm"
                    onClick={() => setContributionsPage(p => Math.min(Math.ceil(myContributions.length / contributionsPerPage), p + 1))}
                    disabled={contributionsPage >= Math.ceil(myContributions.length / contributionsPerPage)}
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* EVENTS CAROUSEL */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Events</h2>
          {activeEventKey ? (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setActiveEventKey(null)}
              title="Clear event filter"
            >
              Clear filter
            </button>
          ) : null}
        </div>

        <div className="carousel carousel-end rounded-box w-full space-x-4 p-2 bg-base-200">
          {events.length === 0 ? (
            <div className="p-6 text-sm opacity-70">No events yet.</div>
          ) : (
            events.map((ev, idx) => (
              <div key={ev.key} className="carousel-item">
                <div
                  className={`card w-72 bg-base-100 shadow hover:shadow-md transition-shadow cursor-pointer ${activeEventKey === ev.key ? 'ring-2 ring-primary' : ''
                    }`}
                  onClick={() =>
                    setActiveEventKey((k) => (k === ev.key ? null : ev.key))
                  }
                >

                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="card-title text-sm">{ev.name}</h3>
                      <div
                        className="radial-progress text-primary"
                        style={{
                          '--value': ev.progress,
                          '--size': '4.5rem',
                          '--thickness': '6px',
                        }}
                        role="progressbar"
                        aria-valuenow={ev.progress}
                      >
                        <span className="text-xs font-bold">{ev.progress}%</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-base-content/70 space-y-1">
                      {ev.location ? <div>📍 {ev.location}</div> : null}
                      {ev.startDate && (
                        <div>🗓️ Start: {new Date(ev.startDate).toLocaleDateString()}</div>
                      )}
                      {ev.endDate && (
                        <div>🏁 End: {new Date(ev.endDate).toLocaleDateString()}</div>
                      )}
                      <div>
                        {ev.closed}/{ev.total} tickets done
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="p-5 flex justify-between items-end">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Open</div>
            <div className="stat-value text-error">{ticketsByStatus.open.length}</div>
            <div className="stat-desc">filtered by event if selected</div>
          </div>
          <div className="stat">
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-warning">{ticketsByStatus['in-progress'].length}</div>
            <div className="stat-desc">filtered by event if selected</div>
          </div>
          <div className="stat">
            <div className="stat-title">Closed</div>
            <div className="stat-value text-success">{ticketsByStatus.closed.length}</div>
            <div className="stat-desc">filtered by event if selected</div>
          </div>
        </div>

        {/* Create Ticket and Event Buttons */}
        <div className="flex gap-2">
          <button className="btn btn-primary mb-2" onClick={() => document.getElementById('my_modal_5').showModal()}>Create Ticket</button>
          <button className="btn btn-secondary mb-2" onClick={() => setShowEventModal(true)}>Create Event</button>
        </div>

        {/* Create Ticket Modal */}
        <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">Create New Ticket</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              
              try {
                // Get resource type and unit
                const isCustomResource = formData.get('resourceType') === 'other'
                const resourceType = isCustomResource ? customResourceType : formData.get('resourceType')
                
                const selectedUnit = formData.get('unit')
                const unit = selectedUnit === 'other' ? customUnit : selectedUnit
                
                const ticketData = {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  eventId: formData.get('eventId'),
                  organizationId: user?.organizationId || null,
                  resourceType: resourceType,
                  amountRequested: parseInt(formData.get('amountRequested')),
                  unit: unit,
                  locationId: selectedEventForTicket?.locationId || null,
                  priority: formData.get('priority'),
                  status: formData.get('status') || 'open',
                  createdBy: user?.uid || null
                };
                
                const newTicket = await createTicket(ticketData);
                setTickets(prev => [...prev, newTicket]);
                showToast('Ticket created successfully!', 'success');
                document.getElementById('my_modal_5').close();
                e.target.reset();
                setSelectedResourceType('')
                setCustomUnit('')
                setCustomResourceType('')
              } catch (error) {
                console.error('Error creating ticket:', error);
                showToast('Failed to create ticket', 'error');
              }
            }}>
              <div className="space-y-3 py-4">
                <div className="flex items-start gap-4">
                  <span className="font-semibold min-w-[120px] pt-3">Title:</span>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered flex-1"
                    placeholder="Enter ticket title"
                    required
                  />
                </div>

                <div className="flex items-start gap-4">
                  <span className="font-semibold min-w-[120px] pt-3">Description:</span>
                  <textarea
                    name="description"
                    className="textarea textarea-bordered flex-1"
                    placeholder="Enter ticket description"
                    rows="3"
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold min-w-[120px]">Event:</span>
                  <div className="flex-1 space-y-2">
                    <select 
                      name="eventId" 
                      className="select select-bordered w-full" 
                      required
                      onChange={(e) => handleEventSelection(e.target.value)}
                    >
                      <option value="">Select an event</option>
                      {masterEvents.map((event) => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                      ))}
                    </select>
                    {selectedEventForTicket && (
                      <div className="text-sm bg-base-200 p-2 rounded space-y-1">
                        <div><span className="font-semibold">Location:</span> {getLocationName(selectedEventForTicket.locationId)}</div>
                        <div><span className="font-semibold">Start:</span> {new Date(selectedEventForTicket.startDate).toLocaleString()}</div>
                        {selectedEventForTicket.endDate && (
                          <div><span className="font-semibold">End:</span> {new Date(selectedEventForTicket.endDate).toLocaleString()}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold min-w-[120px]">Resource:</span>
                  <div className="flex-1 space-y-2">
                    <select 
                      name="resourceType" 
                      className="select select-bordered w-full" 
                      required
                      value={selectedResourceType}
                      onChange={(e) => handleResourceTypeChange(e.target.value)}
                    >
                      <option value="">Select resource type</option>
                      {resourceTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>{rt.name}</option>
                      ))}
                    </select>
                    {selectedResourceType === 'other' && (
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Specify resource type"
                        value={customResourceType}
                        onChange={(e) => setCustomResourceType(e.target.value)}
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold min-w-[120px]">Amount:</span>
                  <input
                    type="number"
                    name="amountRequested"
                    className="input input-bordered flex-1"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold min-w-[120px]">Unit:</span>
                  <div className="flex-1 space-y-2">
                    <select 
                      name="unit" 
                      className="select select-bordered w-full" 
                      required
                      disabled={!selectedResourceType}
                      onChange={(e) => {
                        if (e.target.value !== 'other') {
                          setCustomUnit('')
                        }
                      }}
                    >
                      <option value="">Select unit</option>
                      {availableUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    {availableUnits.includes('other') && (
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Specify custom unit"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold min-w-[120px]">Priority:</span>
                  <select name="priority" className="select select-bordered flex-1" required>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold min-w-[120px]">Status:</span>
                  <select name="status" className="select select-bordered flex-1" defaultValue="open">
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Create Ticket</button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => document.getElementById('my_modal_5').close()}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </section>

      {/* Conditional Based on View Mode */}
      <section className="px-5">
        <h2 className="text-xl font-semibold mb-3">Tickets</h2>
      </section>
      
      {viewMode === 'table' ? (
        /* Table View */
        <section className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="table table-zebra hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Resource</th>
                  <th>Amount</th>
                  <th>Progress</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th className="hidden md:table-cell">Event</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, idx) => {
                  const userContrib = userContributions[ticket.id] || 0
                  const totalContrib = ticket.amountAchieved || 0
                  const remaining = ticket.amountRequested - totalContrib
                  
                  return (
                    <tr
                      key={ticket.id ?? idx}
                      className="cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td>#{ticket.id}</td>
                      <td className="whitespace-normal min-w-[150px] max-w-[200px] md:max-w-md break-words">
                        {ticket.title}
                      </td>
                      <td className="capitalize">{ticket.resourceType}</td>
                      <td>{ticket.amountRequested} {ticket.unit}</td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-semibold">
                            {Math.round((totalContrib / ticket.amountRequested) * 100)}%
                          </div>
                          <progress 
                            className="progress progress-primary w-20" 
                            value={totalContrib} 
                            max={ticket.amountRequested}
                          ></progress>
                          {userContrib > 0 && (
                            <div className="text-xs text-primary">
                              You: {userContrib}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{getLocationName(ticket.locationId)}</td>
                      <td>
                        <div
                          className={`badge whitespace-nowrap ${ticket.status === 'open' /* Added whitespace-nowrap */
                            ? 'badge-success'
                            : ticket.status === 'in-progress'
                            ? 'badge-warning'
                            : 'badge-error'
                          }`}
                        >
                          {ticket.status}
                        </div>
                      </td>
                    <td>
                      <div
                        className={`badge badge-outline ${ticket.priority === 'high'
                          ? 'badge-error'
                          : ticket.priority === 'medium'
                            ? 'badge-warning'
                            : 'badge-info'
                          }`}
                      >
                        {ticket.priority}
                      </div>
                    </td>
                    <td className="hidden md:table-cell">{getEventName(ticket)}</td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* Kanban View */
        <section className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Open */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-error">
                Open ({ticketsByStatus.open.length})
              </h2>
              <div className="space-y-3">
                {ticketsByStatus.open.map((ticket) => {
                  const userContrib = userContributions[ticket.id] || 0
                  const totalContrib = ticket.amountAchieved || 0
                  const remaining = ticket.amountRequested - totalContrib
                  
                  return (
                    <div
                      key={ticket.id}
                      className="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="card-title text-sm">
                            #{ticket.id}: {ticket.title}
                          </h3>
                          <span className="badge badge-ghost text-xs">{getEventName(ticket)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs capitalize">{ticket.resourceType}</span>
                          <div
                            className={`badge badge-sm badge-outline ${ticket.priority === 'high'
                              ? 'badge-error'
                              : ticket.priority === 'medium'
                                ? 'badge-warning'
                                : 'badge-info'
                              }`}
                          >
                            {ticket.priority}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold">{Math.round((totalContrib / ticket.amountRequested) * 100)}%</span>
                            {userContrib > 0 && (
                              <span className="text-xs text-primary">You: {userContrib}</span>
                            )}
                          </div>
                          <progress 
                            className="progress progress-primary w-full" 
                            value={totalContrib} 
                            max={ticket.amountRequested}
                          ></progress>
                        </div>
                        <div className="text-xs text-base-content/60 mt-2">{getLocationName(ticket.locationId)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-warning">
                In Progress ({ticketsByStatus['in-progress'].length})
              </h2>
              <div className="space-y-3">
                {ticketsByStatus['in-progress'].map((ticket) => {
                  const userContrib = userContributions[ticket.id] || 0
                  const totalContrib = ticket.amountAchieved || 0
                  const remaining = ticket.amountRequested - totalContrib
                  
                  return (
                    <div
                      key={ticket.id}
                      className="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="card-title text-sm">
                            #{ticket.id}: {ticket.title}
                          </h3>
                          <span className="badge badge-ghost text-xs">{getEventName(ticket)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs capitalize">{ticket.resourceType}</span>
                          <div
                            className={`badge badge-sm badge-outline ${ticket.priority === 'high'
                              ? 'badge-error'
                              : ticket.priority === 'medium'
                                ? 'badge-warning'
                                : 'badge-info'
                              }`}
                          >
                            {ticket.priority}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold">{Math.round((totalContrib / ticket.amountRequested) * 100)}%</span>
                            {userContrib > 0 && (
                              <span className="text-xs text-primary">You: {userContrib}</span>
                            )}
                          </div>
                          <progress 
                            className="progress progress-primary w-full" 
                            value={totalContrib} 
                            max={ticket.amountRequested}
                          ></progress>
                        </div>
                        <div className="text-xs text-base-content/60 mt-2">{getLocationName(ticket.locationId)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Closed */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-success">
                Closed ({ticketsByStatus.closed.length})
              </h2>
              <div className="space-y-3">
                {ticketsByStatus.closed.map((ticket) => {
                  const userContrib = userContributions[ticket.id] || 0
                  const totalContrib = ticket.amountAchieved || 0
                  
                  return (
                    <div
                      key={ticket.id}
                      className="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="card-title text-sm">
                            #{ticket.id}: {ticket.title}
                          </h3>
                          <span className="badge badge-ghost text-xs">{getEventName(ticket)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs capitalize">{ticket.resourceType}</span>
                          <div
                            className={`badge badge-sm badge-outline ${ticket.priority === 'high'
                              ? 'badge-error'
                              : ticket.priority === 'medium'
                                ? 'badge-warning'
                                : 'badge-info'
                              }`}
                          >
                            {ticket.priority}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-success">✓ 100%</span>
                            {userContrib > 0 && (
                              <span className="text-xs text-primary">You: {userContrib}</span>
                            )}
                          </div>
                          <progress 
                            className="progress progress-success w-full" 
                            value={totalContrib} 
                            max={ticket.amountRequested}
                          ></progress>
                        </div>
                        <div className="text-xs text-base-content/60 mt-2">{getLocationName(ticket.locationId)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pop-up Modal */}
      {selectedTicket && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{selectedTicket.title}</h3>

            <div className="py-4">
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
            </div>

            <div className="modal-action">
              {(selectedTicket.status === 'open' || selectedTicket.status === 'in-progress') && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleTakeTicket(selectedTicket)}
                >
                  Contribute
                </button>
              )}

              <button className="btn btn-ghost" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>

          {/* Click outside to close */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedTicket(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Create New Event</h3>
            <form onSubmit={handleCreateEvent}>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Event Name *</span>
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    className="input input-bordered w-full"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Description *</span>
                  </label>
                  <textarea
                    name="eventDescription"
                    className="textarea textarea-bordered w-full"
                    placeholder="Enter event description"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Start Date *</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">End Date</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Location *</span>
                  </label>
                  <select name="eventLocationId" className="select select-bordered w-full" required>
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Organization</span>
                  </label>
                  <select name="eventOrganizationId" className="select select-bordered w-full">
                    <option value="">Select organization (optional)</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Create Event</button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Click outside to close */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowEventModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Contribution Modal */}
      {showContributionModal && ticketToTake && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-2xl mb-6">
              {userContributions[ticketToTake.id] > 0 ? 'Update Your Contribution' : 'Contribute to Ticket'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Ticket</p>
                <p className="font-semibold text-lg">{ticketToTake.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Requested</p>
                  <p className="font-semibold">{ticketToTake.amountRequested} {ticketToTake.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Contributed</p>
                  <p className="font-semibold">{ticketToTake.amountAchieved || 0} {ticketToTake.unit}</p>
                </div>
              </div>
              
              {(() => {
                const userContrib = userContributions[ticketToTake.id] || 0
                return userContrib > 0 ? (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm text-primary/70">Your Current Contribution</p>
                    <p className="font-semibold text-primary text-lg">{userContrib} {ticketToTake.unit}</p>
                  </div>
                ) : null
              })()}
              
              <div>
                <p className="text-sm text-gray-500">Remaining Needed</p>
                <p className="font-semibold text-warning">
                  {ticketToTake.amountRequested - (ticketToTake.amountAchieved || 0)} {ticketToTake.unit}
                </p>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    {userContributions[ticketToTake.id] > 0 
                      ? 'New contribution amount *' 
                      : 'How much can you contribute? *'}
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder={`Enter amount in ${ticketToTake.unit}`}
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  min="1"
                  max={ticketToTake.amountRequested - (ticketToTake.amountAchieved || 0) + (userContributions[ticketToTake.id] || 0)}
                  required
                />
                {userContributions[ticketToTake.id] > 0 && (
                  <label className="label">
                    <span className="label-text-alt text-info">This will replace your current contribution</span>
                  </label>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitContribution}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {userContributions[ticketToTake.id] > 0 ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  userContributions[ticketToTake.id] > 0 ? 'Update Contribution' : 'Submit Contribution'
                )}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowContributionModal(false);
                  setTicketToTake(null);
                  setContributionAmount('');
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Click outside to close */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setShowContributionModal(false);
              setTicketToTake(null);
              setContributionAmount('');
            }}>close</button>
          </form>
        </dialog>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}
    </>
  )

  return <SideBar pageContent={pageContent} />
}

export default TicketsPage