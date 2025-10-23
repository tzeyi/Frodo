const Card = ({cardTitle, cardDesc, cardButtonText}) => {
    return (
        <>
            <div className="card card-border bg-base-100 w-96">
                <div className="card-body">
                    <h2 className="card-title"> {cardTitle} </h2>
                    <p> {cardDesc} </p>
                    <div className="card-actions justify-end">
                    <button className="btn btn-primary"> {cardButtonText} </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Card;