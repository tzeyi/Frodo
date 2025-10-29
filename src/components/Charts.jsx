// For examples: https://react-chartjs-2.js.org/examples

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement
)


// Pie Chart
const PieChart = ({ data: chartData, title}) => {
    return (
        <div className="w-full">
            <h3 className="text-center font-semibold mb-2">{title}</h3>
            <Pie data={chartData}/>
        </div>
    )
}

// Line Chart
const LineChart = ({ data: chartData, title}) => {
    return (
        <div className="w-full mb-4">
            <h3 className="text-center font-semibold mb-2">{title}</h3>
            <Line data={chartData}/>
        </div>
    )
}

// Bar Chart
const BarChart = ({ data: chartData, title}) => {
    return (
        <div className="w-full mb-4">
            <h3 className="text-center font-semibold mb-2">{title}</h3>
            <Bar data={chartData} />
        </div>
    )
}


export { PieChart, LineChart, BarChart }