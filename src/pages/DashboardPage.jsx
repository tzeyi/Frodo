// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '../components/SideBar'
import { PieChart, LineChart, BarChart } from '../components/Charts'
import data from '../assets/data.json'
import moment from 'moment';
import EventCard from '../components/EventCard'
import { fetchResources, fetchFunding, fetchEvents, fetchTickets } from '../services/resourceService'


function DashboardPage() {
  const navigate = useNavigate()

  const [resourceLoading, setResourceLoading] = useState(true) // Loading state for data fetching
  const [fundingLoading, setFundingLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [ticketsLoading, setTicketsLoading] = useState(true)

  const [resources, setResources] = useState(null)
  const [funding, setFunding] = useState(null)
  const [events, setEvents] = useState(null)
  const [tickets, setTickets] = useState(null)

  // const resources = data.resources
  // const funding = data.funding
  // const events = data.events
  // const tickets = data.tickets

  useEffect(() => {
    fetchResources(setResources, setResourceLoading)
    fetchFunding(setFunding, setFundingLoading)
    fetchEvents(setEvents, setEventsLoading)
    fetchTickets(setTickets, setTicketsLoading)
  }, []);


  // Show loading page if API data not fetch yet
  if (resourceLoading || fundingLoading || eventsLoading || ticketsLoading) {
    return <div>Loading...</div>;
  }

  // Prepare chart data from JSON data
  const barChartData = {
        labels: resources.map(r => r.type.charAt(0).toUpperCase() + r.type.slice(1)),
        datasets: [
        {
            label: 'Current Amount',
            data: resources.map(r => r.amount),
            backgroundColor: '#9523e0ff',
            barThickness: 30,
        },
        {
            label: 'Target Amount',
            data: resources.map(r => r.target - r.amount),
            backgroundColor: '#20deffff',
            barThickness: 30,
        }
        ]
    };

  const fundingLineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Funding ($)',
        data: [funding.totalAcquired/6, funding.totalAcquired/5, funding.totalAcquired/4, funding.totalAcquired/3, funding.totalAcquired/2],
        borderColor: 'rgba(51, 234, 91, 1)',
        backgroundColor: 'rgba(73, 240, 39, 1)',
      },
      {
        label: 'Expenditure ($)',
        data: [funding.totalAcquired/4, funding.totalAcquired/3, funding.totalAcquired/4, funding.totalAcquired/4, funding.totalAcquired/3],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ]
  };
  
  const pageContent = (
    <>
      {/* Heading Section */}
      <h1 className="pl-5 pt-5 text-2xl font-bold text-primary mb-4"> Welcome to Frodo! </h1>
      {console.log("resources: ")}
      {console.log(resources[0].type)}

      <section className="flex justify-around">
        {/* ProjectTargets */}
        <div className="w-1/3 p-2">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="text-xs font-semibold uppercase tracking-wide opacity-80">2025's Targets</h2>
              {/* Tickets completed */}
              <div className="flex items-center gap-12">
                <div
                  className="radial-progress text-primary"
                  style={{ "--value": 70, "--size": "5rem", "--thickness": "6px" }}
                  role="progressbar"
                  aria-valuenow={70}
                >
                  <span className="text-lg font-bold">70%</span>
                </div>
                <div className="text-sm space-y-1.5">
                  <h2 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">Tickets Completed</h2>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    Completed: <span className="font-semibold">700</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                    Incomplete: <span className="font-semibold">1,000</span>
                  </p>
                </div>
              </div>

              <div className="divider my-0"></div>

              {/* Total Active Volunteers */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide opacity-60">Active Volunteers</h2>
                  <div className="badge badge-success gap-1 font-medium">↑ 17 </div>
                </div>

                <h1 className="text-2xl font-bold pt-3">32,500</h1>
              </div>

              <div className="divider my-0"></div>

              {/* Funding Acquired */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">Funding Acquired</h2>
                <div className="space-y-2">
                  <progress
                    className="progress progress-primary"
                    value="54"
                    max="100"
                  ></progress>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Acquired: <span className="font-semibold text-base-content"> 
                      ${funding.totalAcquired}
                    </span></span>
                    <span className="opacity-70">Target: <span className="font-semibold text-base-content">
                      ${funding.target}
                      {/* 60,000 */}
                      </span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Updates (Urgent Incomplete Tickets) Section */}
        <div className="w-1/3 p-2">
          <ul className="list bg-base-100 rounded-box shadow-md">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide"> Urgent Incomplete Tickets </li>
            {tickets.map((ticket, index) => (
              <li key={index} className="list-row">
                <div>
                  <div> {ticket.title} </div>
                  <div className="text-xs uppercase font-semibold opacity-60"> {moment(ticket.timeOpened).fromNow()} </div>
                </div>

                <div className={`badge badge-outline ${ticket.priority === 'high' ? 'badge-error' :
                  ticket.priority === 'medium' ? 'badge-warning' :
                    'badge-info'
                  }`}> {ticket.priority}
                </div>
                <button className="btn btn-square btn-ghost" onClick={() => navigate("/tickets")}>
                  <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></g></svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Status Updates (Your Tickets) Section */}
        <div className="w-1/3 p-2">
          <ul className="list bg-base-100 rounded-box shadow-md">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide"> Your Tickets </li>
            {tickets.map((ticket, index) => (
              <li key={index} className="list-row">
                <div>
                  <div> {ticket.title} </div>
                  <div className="text-xs uppercase font-semibold opacity-60"> {moment(ticket.timeOpened).fromNow()} </div>
                </div>

                <div className={`badge badge-outline ${ticket.priority === 'high' ? 'badge-error' :
                  ticket.priority === 'medium' ? 'badge-warning' :
                    'badge-info'
                  }`}> {ticket.priority}
                </div>
                <button className="btn btn-square btn-ghost" onClick={() => navigate("/tickets")}>
                  <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></g></svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Charts Section */}
      <section className="p-5">
        <h2 className="text-2xl font-bold text-primary mb-4">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funding and Tickets Chart */}
          <div className="card bg-base-100 shadow-xl p-4">
            <LineChart data={fundingLineData} title="Funding & Expenditure Overview" />
          </div>

          {/* Resource Progress Chart */}
          <div className="card bg-base-100 shadow-xl p-4">
            <BarChart data={barChartData} title="Resource Progress"/>
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      <section className="p-5">
        <h2 className="text-2xl font-bold text-primary mb-4">Recent Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Event 1: Emergency Shelter Setup */}
          {events.map((event, index) => 
            <EventCard key={index} eventTitle={event.name} eventDesc={event.description} eventTickets={tickets}/>
          )}
          
          {/* Event 3: Medical Aid Station */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Medical Aid Station</h3>
              <p className="text-sm opacity-70 mb-2">Emergency medical response setup</p>

              <div className="space-y-3">
                {/* Medical supplies needed */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      <div className="badge badge-warning mr-2">Medical</div>
                      Need 100 first aid kits
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xl font-bold">45/100</span>
                    <span className="text-xs opacity-60">45% fulfilled</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-warning h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                {/* Volunteers needed */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      <div className="badge badge-primary mr-2">Labor</div>
                      Need 25 volunteers
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xl font-bold">18/25</span>
                    <span className="text-xs opacity-60">72% fulfilled</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </>
  )

  return (
    <>
      <SideBar
        pageContent={pageContent}
      />
    </>
  )
}

export default DashboardPage
