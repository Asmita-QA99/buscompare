import { useState } from "react";
import "./App.css";

function App() {
  const [from, setFrom] = useState("Pune");
  const [to, setTo] = useState("Mumbai");
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");

  const searchBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://buscompare-backend.onrender.com/search?from=${from}&to=${to}`
      );
      const data = await res.json();
      setBuses(data.buses);
    } catch (err) {
      alert("Cannot connect to server!");
    }
    setLoading(false);
  };

  const getLowestPrice = (sites) =>
    Math.min(...sites.map((s) => s.price - s.saving));

  const getBestSite = (sites) =>
    sites.reduce((best, s) =>
      s.price - s.saving < best.price - best.saving ? s : best
    );

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🚌 BusCompare</h1>
        <p>Compare bus prices across all sites · Find the best coupon code</p>
      </div>

      <div className="search-box">
        <div className="search-row">
          <div className="field">
            <label>From</label>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <div className="field">
            <label>To</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <button className="search-btn" onClick={searchBuses}>
            {loading ? "Searching..." : "Search 🔍"}
          </button>
        </div>
      </div>

      {buses.map((bus) => {
        const best = getBestSite(bus.sites);
        const lowestPrice = getLowestPrice(bus.sites);
        return (
          <div key={bus.id} className="bus-card">
            <div className="bus-header">
              <div>
                <div className="bus-name">
                  {bus.name}
                  <span className="type-badge">{bus.type}</span>
                </div>
                <div className="bus-info">
                  🕐 {bus.departure} → {bus.arrival} &nbsp;·&nbsp; ⏱ {bus.duration}
                </div>
              </div>
              <div>
                <div className="bus-rating">{"★".repeat(Math.floor(bus.rating))} {bus.rating}</div>
                <div className="bus-from">From ₹{lowestPrice}</div>
              </div>
            </div>

            <div className="best-deal">
              <div>
                <div className="best-label">🏆 BEST DEAL</div>
                <div className="best-price">₹{best.price - best.saving}</div>
                <div className="best-site-name">on {best.name} · save ₹{best.saving}</div>
              </div>
              <button
                className={`coupon-btn ${copied === best.coupon ? "copied" : ""}`}
                onClick={() => copyCoupon(best.coupon)}
              >
                {copied === best.coupon ? "✅ Copied!" : `${best.coupon} 📋`}
              </button>
            </div>

            <table className="compare-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Original Price</th>
                  <th>After Coupon</th>
                  <th>Coupon Code</th>
                  <th>You Save</th>
                </tr>
              </thead>
              <tbody>
                {bus.sites.map((site, i) => {
                  const finalPrice = site.price - site.saving;
                  const isLowest = finalPrice === lowestPrice;
                  return (
                    <tr key={i} className={isLowest ? "lowest" : ""}>
                      <td className="site-name">
                        {isLowest && <span className="medal">🥇</span>}
                        {site.name}
                      </td>
                      <td className="original-price">₹{site.price}</td>
                      <td className={`final-price ${isLowest ? "green" : ""}`}>
                        ₹{finalPrice}
                      </td>
                      <td>
                        <button
                          className={`code-btn ${copied === site.coupon ? "copied" : ""}`}
                          onClick={() => copyCoupon(site.coupon)}
                        >
                          {copied === site.coupon ? "✅ Copied!" : `${site.coupon} 📋`}
                        </button>
                      </td>
                      <td className="saving-text">₹{site.saving}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {buses.length === 0 && !loading && (
        <div className="empty">
          <div className="empty-icon">🚌</div>
          <p>Enter cities above and click Search to compare prices!</p>
        </div>
      )}
    </div>
  );
}

export default App;