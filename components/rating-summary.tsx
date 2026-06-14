export const RatingSummary = () => {
  return (
    <div className="rating-summary">
      <div className="score">
        <div id="avgValue" className="value">4.6</div>
        <div id="avgStars" className="stars">
          <span className="star"></span>
          <span className="star"></span>
          <span className="star"></span>
          <span className="star partial-star" style={{ "--w": "45%" } as React.CSSProperties} />
          <span className="star empty-star"></span>
        </div>
        <div id="count" className="muted">120K Ratings</div>
      </div>
      <div id="bars" className="bars">
        <div className="bar">
          <span className="bar-stars">★★★★★</span>
          <div className="track"><div className="fill" style={{ width: "70%" }}></div></div>
        </div>
        <div className="bar">
          <span className="bar-stars">★★★★☆</span>
          <div className="track"><div className="fill" style={{ width: "20%" }}></div></div>
        </div>
        <div className="bar">
          <span className="bar-stars">★★★☆☆</span>
          <div className="track"><div className="fill" style={{ width: "6%" }}></div></div>
        </div>
        <div className="bar">
          <span className="bar-stars">★★☆☆☆</span>
          <div className="track"><div className="fill" style={{ width: "2%" }}></div></div>
        </div>
        <div className="bar">
          <span className="bar-stars">★☆☆☆☆</span>
          <div className="track"><div className="fill" style={{ width: "2%" }}></div></div>
        </div>
      </div>
    </div>
  )
}