import { useState, useEffect } from "react";
import "./App.css";

const API = "https://buscompare-backend.onrender.com";
const EMAILJS_SERVICE = "BusCompare";
const EMAILJS_TEMPLATE = "template_mcbnixi";
const EMAILJS_PUBLIC_KEY = "PXzrml4qGQ5tEnX_I";

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
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    };
    document.head.appendChild(script);
  }, []);

  const sendOTP = async (userName, userEmail) => {
    setOtpLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    try {
      await window.emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        { name: userName, otp: code, email: userEmail },
        EMAILJS_PUBLIC_KEY
      );
      setMessage("OTP sent to " + userEmail + "! Check your inbox.");
    } catch(err) {
      console.log("Email error:", err);
      setMessage("OTP email failed. Please try again!");
    }
    setOtpLoading(false);
  };

  const register = async () => {
    if(!name || !email || !password) {
      setMessage("Please fill all fields!");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        setPendingUser(data);
        await sendOTP(name, email);
        setPage("verify");
      } else {
        setMessage(data.message);
        setOtpLoading(false);
      }
    } catch (err) {
      setMessage("Error connecting to server!");
      setOtpLoading(false);
    }
  };

  const verifyOTP = () => {
    if(otp === generatedOtp) {
      setUser(pendingUser);
      setMessage("");
      setPage("home");
      setName("");
      setEmail("");
      setPassword("");
      setOtp("");
      setPendingUser(null);
    } else {
      setMessage("Wrong OTP! Please try again.");
    }
  };

  const resendOTP = async () => {
    setOtp("");
    setMessage("");
    await sendOTP(name, email);
  };

  const login = async () => {
    if(!email || !password) {
      setMessage("Please fill all fields!");
      return;
    }
    try {
      const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data);
        setMessage("");
        setPage("home");
        setEmail("");
        setPassword("");
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

  const searchBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch(API + "/search?from=" + from + "&to=" + to + "&userId=" + (user ? user.userId : ""));
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

  if (page === "verify") {
    return (
      <div className="app">
        <div className="header">
          <h1>🚌 BusCompare</h1>
        </div>
        <div className="auth-box">
          <div style={{textAlign:"center", marginBottom:20}}>
            <div style={{fontSize:48}}>📧</div>
            <h2>Verify Your Email</h2>
            <p style={{fontSize:13, color:"#666", marginTop:8}}>
              We sent a 6-digit OTP to
              <br/>
              <strong style={{color:"#1D9E75"}}>{email}</strong>
            </p>
          </div>
          {message && (
            <div className={message.includes("sent") ? "success-msg" : "error-msg"}>
              {message}
            </div>
          )}
          <div className="field">
            <label>Enter 6-digit OTP</label>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP here"
              style={{fontSize:24, textAlign:"center", letterSpacing:8, fontWeight:"bold"}}
            />
          </div>
          <button
            className="search-btn"
            style={{width:"100%", marginTop:10}}
            onClick={verifyOTP}>
            Verify OTP
          </button>
          <p style={{textAlign:"center", marginTop:14, fontSize:13, color:"#666"}}>
            Didnt receive OTP?{" "}
            <span
              style={{color:"#1D9E75", cursor:"pointer", fontWeight:"600"}}
              onClick={resendOTP}>
              {otpLoading ? "Sending..." : "Resend OTP"}
            </span>
          </p>
          <p style={{textAlign:"center", marginTop:8, fontSize:13}}>
            <span
              style={{color:"#1D9E75", cursor:"pointer"}}
              onClick={() => { setPage("register"); setMessage(""); }}>
              Back to register
            </span>
          </p>
        </div>
      </div>
    );
  }

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
          <button
            className="search-btn"
            style={{width:"100%", marginTop:10}}
            onClick={login}>
            Login
          </button>
          <p style={{textAlign:"center", marginTop:14, fontSize:13, color:"#666"}}>
            Dont have an account?{" "}
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
              Back to home
            </span>
          </p>
        </div>
      </div>
    );
  }

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
          <button
            className="search-btn"
            style={{width:"100%", marginTop:10}}
            onClick={register}
            disabled={otpLoading}>
            {otpLoading ? "Sending OTP..." : "Create Account"}
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
              Back to home
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🚌 BusCompare</h1>
        <p>Compare bus prices across all sites · Find the best coupon code</p>
        <div style={{marginTop:10}}>
          {user ? (
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:12}}>
              <span style={{fontSize:13, color:"#1D9E75", fontWeight:"600"}}>
                Hi {user.name}!
              </span>
              <button
                onClick={logout}
                style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid #ccc", background:"white", cursor:"pointer"}}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{display:"flex", gap:8, justifyContent:"center"}}>
              <button
                onClick={() => setPage("login")}
                style={{fontSize:13, padding:"6px 16px", borderRadius:20, border:"1px solid #1D9E75", background:"white", color:"#1D9E75", cursor:"pointer", fontWeight:"600"}}>
                Login
              </button>
              <button
                onClick={() => setPage("register")}
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
            {loading ? "Searching..." : "Search"}
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
                  {bus.departure} to {bus.arrival} · {bus.duration}
                </div>
              </div>
              <div>
                <div className="bus-rating">
                  {"★".repeat(Math.floor(bus.rating))} {bus.rating}
                </div>
                <div className="bus-from">From Rs.{lowestPrice}</div>
              </div>
            </div>
            <div className="best-deal">
              <div>
                <div className="best-label">BEST DEAL</div>
                <div className="best-price">Rs.{best.price - best.saving}</div>
                <div className="best-site-name">on {best.name} · save Rs.{best.saving}</div>
              </div>
              <button
                className={copied === best.coupon ? "coupon-btn copied" : "coupon-btn"}
                onClick={() => copyCoupon(best.coupon)}>
                {copied === best.coupon ? "Copied!" : best.coupon}
              </button>
            </div>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Original</th>
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
                        {isLowest ? "Best " : ""}{site.name}
                      </td>
                      <td className="original-price">Rs.{site.price}</td>
                      <td className={isLowest ? "final-price green" : "final-price"}>
                        Rs.{finalPrice}
                      </td>
                      <td>
                        <button
                          className={copied === site.coupon ? "code-btn copied" : "code-btn"}
                          onClick={() => copyCoupon(site.coupon)}>
                          {copied === site.coupon ? "Copied!" : site.coupon}
                        </button>
                      </td>
                      <td className="saving-text">Rs.{site.saving}</td>
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