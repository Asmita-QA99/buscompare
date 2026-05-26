import { useState } from "react";
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
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const sendOTP = async (userName, userEmail) => {
    setOtpLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      const emailjs = await import("https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js");
      await window.emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        { name: userName, otp: code, email: userEmail },
        EMAILJS_PUBLIC_KEY
      );
      setOtpSent(true);
      setMessage(`OTP sent to ${userEmail}!`);
    } catch(err) {
      console.log(err);
      setMessage("Failed to send OTP. Please try again!");
    }
    setOtpLoading(false);
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
        setPendingUser(data);
        await sendOTP(name, email);
        setPage("verify");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Error connecting to server!");
    }
  };

  const verifyOTP = () => {
    if(otp === generatedOtp) {
      setUser(pendingUser);
      setMessage("");
      setPage("home");
      setName(""); setEmail(""); setPassword("");
      setOtp(""); setOtpSent(false); setPendingUser(null);
    } else {
      setMessage("Wrong OTP! Please try again.");
    }
  };

  const resendOTP = async () => {
    if(pendingUser) {
      await sendOTP(name, email);
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

  // OTP Verify Page
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
              We sent a 6-digit OTP to<br/>
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
              maxLength={6}
              style={{fontSize:24, textAlign:"center", letterSpacing:8, fontWeight:"bold"}}
            />
          </div>
          <button className="search-btn"
            style={{width:"100%", marginTop:10}}
            onClick={verifyOTP}>
            ✅ Verify OTP
          </button>
          <p style={{textAlign:"center", marginTop:14, fontSize:13, color:"#666"}}>
            Didn't receive OTP?{" "}
            <span
              style={{color:"#1D9E75", cursor:"pointer", fontWeight:"600"}}
              onClick={resendOTP}>
              {otpLoading ? "Sending..." : "Resend OTP"}
            </span>
          </p>
          <p style={{textAlign:"center", marginTop:8, fontSize:13}}>
            <span
              style={{color:"#1D9E75", cursor:"pointer"}}
              onClick={() => { setPage("register"); setMessage(""); setOtpSent(false); }}>
              ← Back to register
            </span>
          </p>
        </div>
      </div>
    );
  }

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
              <button className="show-password-btn"
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
            <span style={{color:"#1D9E75", cursor:"pointer", fontWeight:"600"}}
              onClick={() => { setPage("register"); setMessage(""); setShowPassword(false); }}>
              Register here
            </span>
          </p>
          <p style={{textAlign:"center", marginTop:8, fontSize:13}}>
            <span style={{color:"#1D9E75", cursor:"pointer"}}
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
              <button className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button className="search-btn"
            style={{width:"100%", marginTop:10}}
            onClick={register}
            disabled={otpLoading}>
            {otpLoading ? "Sending OTP..." : "Create Account"}
          </button>
          <p style={{textAlign:"center", marginTop:14, fontSize:13, color:"#666"}}>
            Already have an account?{" "}
            <span style={{color:"#1D9E75", cursor:"pointer", fontWeight:"600"}}
              onClick={() => { setPage("login"); setMessage(""); setShowPassword(false); }}>
              Login here
            </span>
          </p>
          <p style={{textAlign:"center",