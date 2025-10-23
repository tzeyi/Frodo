// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useState } from 'react'
import { addResourceToFirestore } from "../services/resourceService"
import SideBar from '../components/Sidebar'
import Card from '../components/Card'
import { PieChart, LineChart } from '../components/Charts'


function DashboardPage() {
  
  // Resources
  const resources = [
    { type: "water", target: 1000, amount: 500, unit: "bottles" },
    { type: "towels", target: 500, amount: 100, unit: "pieces" },
    { type: "food", target: 750, amount: 450, unit: "meals" }
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
      <section className="p-5 flex">
        <div className="flex-1 w-lg"><PieChart/></div>
        <div className="flex-1 w-lg">
          <LineChart/>
          <LineChart/>
        </div>
      </section>

      {/* Funding Section */}
      <section className="p-5">
        <h2 className="underline font-bold">Fundings</h2>
        Funding Acquired: {funding.totalAcquired} <br/>
        Expenditure: {funding.totalUsed} <br/>
        Remaining: {funding.remaining}
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
