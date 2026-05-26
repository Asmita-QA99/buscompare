import { useState } from "react";
import "./App.css";

const API = "https://buscompare-backend.onrender.com";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [from, setFrom] = useState("Pune");
  const [to, setTo] = useState("Mumbai");
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const searchBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/search?from=${from}&to=${to}&userId=${user?.userId || ""}`);
      const data = await res.json();
      setBuses(data.buses);
    } catch (err) {
      alert("Cannot connect to server!");
    }
    setLoading(false);
  };

  const register = async () => {
    if(!name || !email || !password) {
      setMessage("Please fill all fields!");
      return;
    }
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data);
        setMessage("");
        setPage("home");
        setName(""); setEmail(""); setPassword("");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Error connecting to server!");
    }
  };

  const login = async () => {
    if(!email || !password) {
      setMessage("Please fill all fields!");
      return;
    }
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data);
        setMessage("");
        setPage("home");
        setEmail(""); setPassword("");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Error connecting to server!");
    }
  };

  const logout = () => {
    setUser(null);
    setBuses([]);
    setPage("home");
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

  // Login Page
  if (page === "login") {
    return (
      <div className="app">
        <div className="header">
          <h1>🚌 BusCompare</h1>
        </div>
        <div className="auth-box">
          <h2>Login</h2>
          {message && <div className="error-msg">{message}</div>}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button className="search-btn"
            style={{width:"100%", marginTop:10}}
            onClick={login}>
            Login
          </button>
          <p style={{textAlign:"center", marginTop:14, fontSize:13, color:"#666"}}>
            Don't have an account?{" "}
            <span
              style={{color:"#1D9E75", cursor:"pointer", fontWeight:"600"}}
              onClick={() => { setPage("register"); setMessage(""); setShowPassword(false); }}>
              Register here
            </span>
          </p>
          <p style={{textAlign:"center", marginTop:8, fontSize:13}}>
            <span
              style={{color:"#1D9E75", cursor:"pointer"}}
              onClick={() => { setPage("home"); setMessage(""); }}>
              ← Back to home
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Register Page
  if (page === "register") {
    return (
      <div className="app">
        <div className="header">
          <h1>🚌 BusCompare</h1>
        </div>
        <div className="auth-box">
          <h2>Create Account</h2>
          {message && <div className="error-msg">{message}</div>}
          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
              <button
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button className="search-btn"
            style={{width:"100%", marginTop:10}}
            onClick={register}>
            Create Account
          </button>
          <p style={{textAlign:"center", marginTop:14, fontSize:13, color:"#666"}}>
            Already have an account?{" "}
            <span
              style={{color:"#1D9E75", cursor:"pointer", fontWeight:"600"}}
              onClick={() => { setPage("login"); setMessage(""); setShowPassword(false); }}>
              Login here
            </span>
          </p>
          <p style={{textAlign:"center", marginTop:8, fontSize:13}}>
            <span
              style={{color:"#1D9E75", cursor:"pointer"}}
              onClick={() => { setPage("home"); setMessage(""); }}>
              ← Back to home
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Home Page
  return (
    <div className="app">
      <div className="header">
        <h1>🚌 BusCompare</h1>
        <p>Compare bus prices across all sites · Find the best coupon code</p>
        <div style={{marginTop:10}}>
          {user ? (
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:12}}>
              <span style={{fontSize:13, color:"#1D9E75", fontWeight:"600"}}>
                👋 Hi {user.name}!
              </span>
              <button onClick={logout}
                style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid #ccc", background:"white", cursor:"pointer"}}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{display:"flex", gap:8, justifyContent:"center"}}>
              <button onClick={() => setPage("login")}
                style={{fontSize:13, padding:"6px 16px", borderRadius:20, border:"1px solid #1D9E75", background:"white", color:"#1D9E75", cursor:"pointer", fontWeight:"600"}}>
                Login
              </button>
              <button onClick={() => setPage("register")}
                style={{fontSize:13, padding:"6px 16px", borderRadius:20, border:"none", background:"#1D9E75", color:"white", cursor:"pointer", fontWeight:"600"}}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="search-box">
        <div className="search-row">
          <div className="field">
            <label>From</label>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Enter city"/>
          </div>
          <div className="field">
            <label>To</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Enter city"/>
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
                <div className="bus-rating">
                  {"★".repeat(Math.floor(bus.rating))} {bus.rating}
                </div>
                <div className="bus-from">From ₹{lowestPrice}</div>
              </div>
            </div>

            <div className="best-deal">
              <div>
                <div className="best-label">🏆 BEST DEAL</div>
                <div className="best-price">₹{best.price - best.saving}</div>
                <div className="best-site-name">
                  on {best.name} · save ₹{best.saving}
                </div>
              </div>
              <button
                className={`coupon-btn ${copied === best.coupon ? "copied" : ""}`}
                onClick={() => copyCoupon(best.coupon)}>
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
                          onClick={() => copyCoupon(site.coupon)}>
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