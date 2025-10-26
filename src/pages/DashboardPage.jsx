// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useState } from 'react'
import { addResourceToFirestore } from "../services/resourceService"
import SideBar from '../components/SideBar'
import Card from '../components/Card'
import { PieChart, LineChart } from '../components/Charts'
import data from '../assets/data.json'
import moment from 'moment';


function DashboardPage() {
  const resources = data.resources
  const funding = data.funding
  const tickets = data.tickets

  // Prepare chart data from JSON data
  const resourcesPieData = {
    labels: resources.map(r => r.type.charAt(0).toUpperCase() + r.type.slice(1)),
    datasets: [
      {
        label: 'Current Amount',
        data: resources.map(r => r.amount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // Blue
          'rgba(16, 185, 129, 0.8)',  // Green  
          'rgba(245, 158, 11, 0.8)',  // Yellow
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const targetsPieData = {
    labels: resources.map(r => r.type.charAt(0).toUpperCase() + r.type.slice(1)),
    datasets: [
      {
        label: 'Target Amount',
        data: resources.map(r => r.target),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Red
          'rgba(168, 85, 247, 0.8)',  // Purple
          'rgba(34, 197, 94, 0.8)',   // Green
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const fundingLineData = {
    labels: ['Total Acquired', 'Total Used', 'Remaining'],
    datasets: [
      {
        label: 'Funding ($)',
        data: [funding.totalAcquired, funding.totalUsed, funding.remaining],
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const ticketsPriorityData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        label: 'Tickets by Priority',
        data: [
          tickets.filter(t => t.priority === 'high').length,
          tickets.filter(t => t.priority === 'medium').length,
          tickets.filter(t => t.priority === 'low').length,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Red for high
          'rgba(245, 158, 11, 0.8)',  // Yellow for medium
          'rgba(59, 130, 246, 0.8)',  // Blue for low
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pageContent = (
    <>
      {/* Heading Section */}
      <h1 className="pl-5 pt-5 text-2xl font-bold text-primary mb-4"> Welcome to Frodo! </h1>

      {/* Status Updates (Urgent Tickets) Section */}
      <section className="flex justify-around">
        {/* Incomplete Tickets */}
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
                <button className="btn btn-square btn-ghost">
                  <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Targets */}
        <div className="w-1/3 p-2">
          <div className="card bg-base-100 w-96 shadow-sm">
            <div className="card-body">
              {/* Title 1*/}
              <h2 className="card-title ">Fulfillment Rate</h2>
              <div className="flex justify-around">
                <div className="radial-progress text-primary" style={{ "--value": 60 } /* as React.CSSProperties */}
                  aria-valuenow={60} role="progressbar">60%</div>
                <div className="font-bold">
                  <p>Tickets completed: 700</p>
                  <p>Tickets incompleted: 1000 </p>
                </div>
              </div>

              {/* Title 2*/}
              <div className="bg-primary text-white">
                <h2 className="card-title">Funding Acquired</h2>
                <div className="card-actions justify-end">
                  <h1 className="text-2xl font-bold"> Acquired: $32,500 </h1><br />
                  <h1 className="text-2xl font-bold"> Target: $60,000 </h1>
                </div>
              </div>
              {/* Title 3*/}
              <h2 className="card-title">Current Active Volunteers</h2>
              <div className="card-actions justify-end">
                <h1 className="text-3xl font-bold"> 32,500 </h1>
                <div className="alert alert-success">
                  <span> ^ 17 % </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {/* <div className="w-1/4 p-2">
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
                  <button className="btn btn-square btn-ghost">
                    <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div> */}

      </section>

      {/* Summary Section */}
      <section className="p-5 flex justify-between">
        {resources.map((item, index) => (
          <Card
            key={index}
            cardTitle={item.type}
            cardDesc={item.unit}
            cardButtonText="Click Me"
          />
        ))}
      </section>

      {/* Charts Section */}
      <section className="p-5">
        <h2 className="text-2xl font-bold text-primary mb-4">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resources Charts */}
          <div className="card bg-base-100 shadow-xl p-4">
            <PieChart data={resourcesPieData} title="Current Resources" />
          </div>
          <div className="card bg-base-100 shadow-xl p-4">
            <PieChart data={targetsPieData} title="Resource Targets" />
          </div>

          {/* Funding and Tickets Charts */}
          <div className="card bg-base-100 shadow-xl p-4">
            <LineChart data={fundingLineData} title="Funding Overview" />
          </div>
          <div className="card bg-base-100 shadow-xl p-4">
            <PieChart data={ticketsPriorityData} title="Tickets by Priority" />
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      <section className="p-5">
        <h2 className="text-2xl font-bold text-primary mb-4">Recent Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Event 1: Emergency Shelter Setup */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Emergency Shelter Setup</h3>
              <p className="text-sm opacity-70 mb-2">Shelter for displaced families after flooding</p>
              
              <div className="space-y-3">
                {/* Towels needed */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      <div className="badge badge-secondary mr-2">Towels</div>
                      Need 200 towels
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xl font-bold">75/200</span>
                    <span className="text-xs opacity-60">38% fulfilled</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-secondary h-2 rounded-full" style={{width: '38%'}}></div>
                  </div>
                </div>

                {/* Blankets needed */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      <div className="badge badge-success mr-2">Blankets</div>
                      Need 150 blankets
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xl font-bold">120/150</span>
                    <span className="text-xs opacity-60">80% fulfilled</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-success h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event 2: Food Distribution Center */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Food Distribution Center</h3>
              <p className="text-sm opacity-70 mb-2">Daily meal service for 500 families</p>
              
              <div className="space-y-3">
                {/* Food needed */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      <div className="badge badge-accent mr-2">Food</div>
                      Need 500 meals
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xl font-bold">420/500</span>
                    <span className="text-xs opacity-60">84% fulfilled</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-accent h-2 rounded-full" style={{width: '84%'}}></div>
                  </div>
                </div>

                {/* Water needed */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      <div className="badge badge-info mr-2">Water</div>
                      Need 1000 bottles
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xl font-bold">800/1000</span>
                    <span className="text-xs opacity-60">80% fulfilled</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-info h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    <div className="bg-warning h-2 rounded-full" style={{width: '45%'}}></div>
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
                    <div className="bg-primary h-2 rounded-full" style={{width: '72%'}}></div>
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
