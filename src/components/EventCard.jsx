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
                {eventTickets.slice(0, 4).map((ticket, index) => {
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
