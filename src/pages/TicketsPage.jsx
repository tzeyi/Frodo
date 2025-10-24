import { useState } from 'react'
import SideBar from '../components/SideBar'

function TicketsPage() {
  const [tickets] = useState([
    {
      id: 1,
      title: "Urgent water shortage",
      resourceType: "water",
      amountRequested: 200,
      status: "open",
      priority: "high",
      location: "North District",
    },
    {
      id: 2,
      title: "Food supplies needed",
      resourceType: "food",
      amountRequested: 100,
      status: "in-progress",
      priority: "medium",
      location: "South District",
    },
    {
      id: 3,
      title: "Blankets for shelter",
      resourceType: "towels",
      amountRequested: 50,
      status: "closed",
      priority: "low",
      location: "East District",
    }
  ])

  const pageContent = (
    <>
      {/* Header */}
      <h1 className="p-5 text-purple-700 font-bold text-3xl">Tickets</h1>
      
      {/* Simple Stats */}
      <section className="p-5 flex gap-4">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Open</div>
          <div className="stat-value">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">In Progress</div>
          <div className="stat-value">{tickets.filter(t => t.status === 'in-progress').length}</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Closed</div>
          <div className="stat-value">{tickets.filter(t => t.status === 'closed').length}</div>
        </div>
      </section>

      {/* Tickets Table */}
      <section className="p-5">
        <div className="overflow-x-auto">
          <table className="table">
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
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.resourceType}</td>
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
    </>
  )

  return <SideBar pageContent={pageContent} />
}

export default TicketsPage