import { useState } from 'react'
import SideBar from '../components/SideBar'
import data from '../assets/data.json'


function ForumPage() {
  const tickets_json = data.tickets
  const [tickets, setTickets] = useState(tickets_json)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [viewMode, setViewMode] = useState('table')

  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ))
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
      <div className="flex justify-between items-center p-5">
        <h1 className="text-3xl font-bold text-primary">Forum</h1>
        
        {/* View Mode Toggle */}
        <div className="tabs tabs-boxed">
          <a 
            className={`tab ${viewMode === 'table' ? 'tab-active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </a>
          <a 
            className={`tab ${viewMode === 'kanban' ? 'tab-active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            Kanban View
          </a>
        </div>
      </div>

      {/* Stats */}
      <section className="p-5">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Open</div>
            <div className="stat-value text-error">{ticketsByStatus['open'].length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-warning">{ticketsByStatus['in-progress'].length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Closed</div>
            <div className="stat-value text-success">{ticketsByStatus['closed'].length}</div>
          </div>
        </div>
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
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td>#{ticket.id}</td>
                    <td>{ticket.title}</td>
                    <td className="capitalize">{ticket.resourceType}</td>
                    <td>{ticket.amountRequested}</td>
                    <td>{ticket.location}</td>
                    <td>
                      <div className={`badge ${
                        ticket.status === 'open' ? 'badge-error' :
                        ticket.status === 'in-progress' ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        {ticket.status}
                      </div>
                    </td>
                    <td>
                      <div className={`badge badge-outline ${
                        ticket.priority === 'high' ? 'badge-error' :
                        ticket.priority === 'medium' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {ticket.priority}
                      </div>
                    </td>
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
            
            {/* Open Column */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-error">Open ({ticketsByStatus['open'].length})</h2>
              <div className="space-y-3">
                {ticketsByStatus['open'].map(ticket => (
                  <div 
                    key={ticket.id}
                    className="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">#{ticket.id}: {ticket.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs capitalize">{ticket.resourceType}</span>
                        <div className={`badge badge-sm badge-outline ${
                          ticket.priority === 'high' ? 'badge-error' :
                          ticket.priority === 'medium' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {ticket.priority}
                        </div>
                      </div>
                      <div className="text-xs text-base-content/60 mt-2">
                        {ticket.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-warning">In Progress ({ticketsByStatus['in-progress'].length})</h2>
              <div className="space-y-3">
                {ticketsByStatus['in-progress'].map(ticket => (
                  <div 
                    key={ticket.id}
                    className="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">#{ticket.id}: {ticket.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs capitalize">{ticket.resourceType}</span>
                        <div className={`badge badge-sm badge-outline ${
                          ticket.priority === 'high' ? 'badge-error' :
                          ticket.priority === 'medium' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {ticket.priority}
                        </div>
                      </div>
                      <div className="text-xs text-base-content/60 mt-2">
                        {ticket.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Closed Column */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4 text-success">Closed ({ticketsByStatus['closed'].length})</h2>
              <div className="space-y-3">
                {ticketsByStatus['closed'].map(ticket => (
                  <div 
                    key={ticket.id}
                    className="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">#{ticket.id}: {ticket.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs capitalize">{ticket.resourceType}</span>
                        <div className={`badge badge-sm badge-outline ${
                          ticket.priority === 'high' ? 'badge-error' :
                          ticket.priority === 'medium' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {ticket.priority}
                        </div>
                      </div>
                      <div className="text-xs text-base-content/60 mt-2">
                        {ticket.location}
                      </div>
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
                  <span className={`badge badge-outline ${
                    selectedTicket.priority === 'high' ? 'badge-error' :
                    selectedTicket.priority === 'medium' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Current Status:</span>
                  <span className={`badge ${
                    selectedTicket.status === 'open' ? 'badge-error' :
                    selectedTicket.status === 'in-progress' ? 'badge-warning' :
                    'badge-success'
                  }`}>
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

              <button
                className="btn btn-ghost"
                onClick={() => setSelectedTicket(null)}
              >
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

export default ForumPage