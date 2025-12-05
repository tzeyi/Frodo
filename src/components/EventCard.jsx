const EventCard = ({eventTitle, eventDesc, eventTickets}) => {
    const badgeColors = ['badge-secondary', 'badge-success', 'badge-primary', 'badge-accent', 'badge-warning', 'badge-info'];
    const progressColors = ['bg-secondary', 'bg-success', 'bg-primary', 'bg-accent', 'bg-warning', 'bg-info'];

    return (
        <>
          <div className="card bg-base-100 shadow-xl self-start">
            <div className="card-body">
              <h3 className="card-title text-lg"> {eventTitle} </h3>
              <p className="text-sm opacity-70 mb-2"> {eventDesc} </p>

              <div className="space-y-3">
                {eventTickets.slice(0, 3).map((ticket, index) => {
                  const percentage = parseInt(ticket.amountAchieved / ticket.amountRequested * 100)
                  const colorIndex = index % badgeColors.length;
                  
                  return (
                    <div key={ticket.id || index}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          <div className={`badge ${badgeColors[colorIndex]} mr-2`}>
                            {ticket.resourceType}
                          </div>
                          {ticket.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xl font-bold">
                          {ticket.amountAchieved} / {ticket.amountRequested}
                        </span>
                        <span className="text-xs opacity-60">
                          {percentage}% fulfilled
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`${progressColors[colorIndex]} h-2 rounded-full`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
    )
}

export default EventCard;


// const EventCard = ({eventTitle, eventDesc, eventTickets}) => {
//     const percentage1 = eventTickets[0].amountAchieved / eventTickets[0].amountRequested * 100
//     const percentage2 = eventTickets[1].amountAchieved / eventTickets[1].amountRequested * 100

//     return (
//         <>
//           {/* Event 1: Emergency Shelter Setup */}
//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <h3 className="card-title text-lg"> {eventTitle} </h3>
//               <p className="text-sm opacity-70 mb-2"> {eventDesc} </p>

//               <div className="space-y-3">
//                 {/* Towels needed */}
//                 <div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm font-medium">
//                       <div className="badge badge-secondary mr-2">{eventTickets[0].resourceType}</div>
//                         {eventTickets[0].title}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between mt-1">
//                     <span className="text-xl font-bold"> {eventTickets[0].amountAchieved} / {eventTickets[0].amountRequested} </span>
//                     <span className="text-xs opacity-60"> {percentage1}% fulfilled </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//                     <div className="bg-secondary h-2 rounded-full" style={{ width: `${percentage1}%` }}></div>
//                   </div>
//                 </div>

//                 {/* Blankets needed */}
//                 <div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm font-medium">
//                       <div className="badge badge-success mr-2">{eventTickets[1].resourceType}</div>
//                         {eventTickets[1].title}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between mt-1">
//                     <span className="text-xl font-bold"> {eventTickets[1].amountAchieved} / {eventTickets[1].amountRequested} </span>
//                     <span className="text-xs opacity-60"> {percentage2}% fulfilled </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//                     <div className="bg-success h-2 rounded-full" style={{ width: `${percentage2}%` }}></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//     )
// }

// export default EventCard;