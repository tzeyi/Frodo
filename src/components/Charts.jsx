// For examples: https://react-chartjs-2.js.org/examples

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
)


// Pie Chart - Now accepts data as props
const PieChart = ({ data: chartData, title = "Distribution" }) => {
    const defaultData = {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [
            {
                label: '# of Votes',
                data: [12, 19, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="w-full">
            <h3 className="text-center font-semibold mb-2">{title}</h3>
            <Pie data={chartData || defaultData}/>
        </div>
    )
}

// Line Chart - Now accepts data as props
const LineChart = ({ data: chartData, title = "Trend" }) => {
    const defaultData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Sales',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4 // Makes the line curved
            }
        ]
    };

    return (
        <div className="w-full mb-4">
            <h3 className="text-center font-semibold mb-2">{title}</h3>
            <Line data={chartData || defaultData}/>
        </div>
    )
}


export { PieChart, LineChart }