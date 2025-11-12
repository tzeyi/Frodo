import { useState } from 'react'
import SideBar from '../components/SideBar'
import data from '../assets/data.json'


function TicketsPage() {
  const tickets_json = data.tickets
  const [tickets, setTickets] = useState(tickets_json)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [viewMode, setViewMode] = useState('table')
  const [activeEventKey, setActiveEventKey] = useState(null)

  const masterEvents = Array.isArray(data.events) ? data.events : []

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

  const events = (() => {
    const map = new Map()

    masterEvents.forEach((e, idx) => {
      map.set(String(e.id), {
        key: String(e.id),
        name: e.name || 'Unknown Event',
        location: e.location || null,
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
      .filter((ev) => ev.progress < 100)
  })()

  const filteredTickets =
    !activeEventKey
      ? tickets
      : tickets.filter((t) => getEventId(t) === activeEventKey)

  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    )
    setSelectedTicket(null)
  }

  const ticketsByStatus = {
    'open': tickets.filter(t => t.status === 'open'),
    'in-progress': tickets.filter(t => t.status === 'in-progress'),
    'closed': tickets.filter(t => t.status === 'closed')
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

                    <div className="mt-2 text-xs text-base-content/70">
                      {ev.location ? <div>{ev.location}</div> : null}
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

        {/* Open the modal using document.getElementById('ID').showModal() method */}
        {/* TODO: Connect to Firebase, make button be able to POST */}
        <button className="btn mb-2" onClick={() => document.getElementById('my_modal_5').showModal()}>Create Tickets</button>
        <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create New Ticket</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const ticketData = {
                description: formData.get('description'),
                eventId: formData.get('eventId'),
                resourceType: formData.get('resourceType'),
                amountRequested: formData.get('amountRequested'),
                location: formData.get('location'),
                priority: formData.get('priority'),
                status: formData.get('status') || 'open'
              };
              // Handle your form submission here
              console.log(ticketData);
              // Close modal after submission
              document.getElementById('my_modal_5').close();
            }}>
              <div className="space-y-3 py-4">
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
                  <select name="eventId" className="select select-bordered flex-1" required>
                    <option value="">Select an event</option>
                    {/* Add your event options here */}
                    <option value="event1">Event 1</option>
                    <option value="event2">Event 2</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold min-w-[120px]">Resource:</span>
                  <select name="resourceType" className="select select-bordered flex-1" required>
                    <option value="">Select resource type</option>
                    <option value="volunteers">Volunteers</option>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
                    <option value="funding">Funding</option>
                  </select>
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
                  <span className="font-semibold min-w-[120px]">Location:</span>
                  <input
                    type="text"
                    name="location"
                    className="input input-bordered flex-1"
                    placeholder="Enter location"
                    required
                  />
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
      {viewMode === 'table' ? (
        /* Table View */
        <section className="p-5">
          <div className="overflow-x-auto">
            <table className="table table-zebra hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Resource</th>
                  <th>Amount</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th className="hidden md:table-cell">Event</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, idx) => (
                  <tr
                    key={ticket.id ?? idx}
                    className="cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td>#{ticket.id}</td>
                    <td>{ticket.title}</td>
                    <td className="capitalize">{ticket.resourceType}</td>
                    <td>{ticket.amountRequested}</td>
                    <td>{ticket.location}</td>
                    <td>
                      <div
                        className={`badge ${ticket.status === 'open'
                          ? 'badge-error'
                          : ticket.status === 'in-progress'
                            ? 'badge-warning'
                            : 'badge-success'
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* Kanban View */
        <section className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Open */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-error">
                Open ({ticketsByStatus.open.length})
              </h2>
              <div className="space-y-3">
                {ticketsByStatus.open.map((ticket) => (
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
                      <div className="text-xs text-base-content/60 mt-2">{ticket.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-warning">
                In Progress ({ticketsByStatus['in-progress'].length})
              </h2>
              <div className="space-y-3">
                {ticketsByStatus['in-progress'].map((ticket) => (
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
                      <div className="text-xs text-base-content/60 mt-2">{ticket.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Closed */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-success">
                Closed ({ticketsByStatus.closed.length})
              </h2>
              <div className="space-y-3">
                {ticketsByStatus.closed.map((ticket) => (
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
                      <div className="text-xs text-base-content/60 mt-2">{ticket.location}</div>
                    </div>
                  </div>
                ))}
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
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Resource:</span>
                  <span className="capitalize">{selectedTicket.resourceType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Amount Needed:</span>
                  <span>{selectedTicket.amountRequested}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Location:</span>
                  <span>{selectedTicket.location}</span>
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
              {selectedTicket.status === 'open' && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateTicketStatus(selectedTicket.id, 'in-progress')}
                >
                  Take Ticket
                </button>
              )}

              {selectedTicket.status === 'in-progress' && (
                <button
                  className="btn btn-success"
                  onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                >
                  Mark Complete
                </button>
              )}

              {selectedTicket.status === 'closed' && (
                <button
                  className="btn btn-warning"
                  onClick={() => updateTicketStatus(selectedTicket.id, 'open')}
                >
                  Reopen Ticket
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
    </>
  )

  return <SideBar pageContent={pageContent} />
}

export default TicketsPage