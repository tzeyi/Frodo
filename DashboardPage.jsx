// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useState } from 'react'
import { addResourceToFirestore } from "../services/resourceService"
import SideBar from '../components/SideBar'
import Card from '../components/Card'
import { PieChart, LineChart } from '../components/Charts'
import StatCard from '../components/StatCard'
import StatusFeed from '../components/StatusFeed'


function DashboardPage() {
  // Resources
  const resources = [
    { type: "Water", target: 1000, amount: 500, unit: "Bottles" },
    { type: "Towels", target: 500, amount: 100, unit: "Pieces" },
    { type: "Food", target: 750, amount: 450, unit: "Meals" },
    { type: "Beds", target: 450, amount: 200, unit: "Beds"},
  ]

  // Tickets
  const tickets = [
    {
      id: 1,
      title: "Urgent water shortage",
      resourceType: "water",
      amountRequested: 200,
      status: "open",
      priority: "high",
      createdAt: "2024-01-12",
      closedAt: null,
      location: "North District",
      description: "Running low on clean water for flood victims"
    },
    {
      id: 2,
      title: "Food supplies needed", 
      resourceType: "food",
      amountRequested: 100,
      status: "closed",
      priority: "medium",
      createdAt: "2024-01-10",
      closedAt: "2024-01-11",
      location: "South District",
      description: "Weekly meal program running short"
    }
  ]

  // Funding
  const funding = {
    totalAcquired: 25000,
    totalUsed: 18000,
    remaining: 7000
  }

  const pageContent = (
    <>
      {/* Heading Section */}
      <h1 className="p-5 text-purple-700 font-bold"> Welcome to Frodo! </h1>

      {/* Cards Section */}
      <section className="p-5 flex justify-between">
        {resources.map((item, index) => (
          <Card
            key = {index}
            cardTitle = {item.type}
            cardDesc = {item.unit}
            cardButtonText = "Click Me"
          />
        ))}
      </section>

      {/* Charts Section */}
  <section className="p-5 flex gap-4"> {/* Added gap-4 for spacing */}
    <div className="flex-1 w-lg"><PieChart/></div>
    <div className="flex-1 w-lg">
      <LineChart/>
      <LineChart/>
    </div>
  </section>

  {/* New Status Feed Section */}
  <section className="p-5 flex gap-4">
    {/* And our new StatusFeed component here */}
    <div className="flex-1 w-lg">
      <StatusFeed tickets={tickets} />
    </div>
  </section>

     {/* Funding Section */}
      <section className="p-5">
        <h2 className="text-xl font-bold mb-4">Funding</h2>
        <div className="flex gap-4"> {/* This flex container will line them up */}
          <StatCard 
            title="Funding Acquired" 
            value={`$${funding.totalAcquired}`} 
          />
          <StatCard 
            title="Expenditure" 
            value={`$${funding.totalUsed}`} 
          />
          <StatCard 
            title="Remaining" 
            value={`$${funding.remaining}`} 
          />
        </div>
      </section>
    </>
  )
  

  return (
    <>
      <SideBar
        pageContent = {pageContent}
      />
    </>
  )
}

export default DashboardPage
