import React from 'react';

// This helper function returns a DaisyUI badge color based on priority
const getPriorityClass = (priority) => {
  if (priority === 'high') return 'badge-error'; // Red
  if (priority === 'medium') return 'badge-warning'; // Yellow
  return 'badge-info'; // Blue
};

function StatusFeed({ tickets }) {
  // Get all tickets with "open" status
  const openTickets = tickets.filter(ticket => ticket.status === 'open');

  return (
    // Use bg-slate-800 to match the theme. h-full makes it fill the grid space
    <div className="p-6 bg-slate-800 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-bold text-white mb-4">
        Urgent Status Updates
      </h2>
      
      {/* Container for the list of updates */}
      <div className="space-y-4">
        {openTickets.length > 0 ? (
          openTickets.map(ticket => (
            // Each update is its own dark card
            <div key={ticket.id} className="p-4 bg-slate-700 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{ticket.title}</span>
                {/* Use the DaisyUI badge */}
                <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{ticket.location}</p>
              <p className="text-sm text-gray-300 mt-2">{ticket.description}</p>
            </div>
          ))
        ) : (
          // Show this message if there are no open tickets
          <p className="text-gray-400">No open tickets at this time.</p>
        )}
      </div>
    </div>
  );
}

export default StatusFeed;