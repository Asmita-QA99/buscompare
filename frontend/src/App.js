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

  // Load EmailJS when app starts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log("EmailJS loaded!");
    };
    document.head.appendChild(script);
  }, []);

  const sendOTP = async (userName, userEmail) => {
    setOtpLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    console.log("OTP generated:", code);
    try {
      await window.emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        { name: userName, otp: code, email: userEmail },
        EMAILJS_PUBLIC_KEY
      );
      setMessage(`OTP sent to ${userEmail}! Check your inbox.`);
    } catch(err) {
      console.log("Email error:", err);
      setMessage("OTP email failed but you can still verify!");
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
      setName(""); setEmail(""); setPassword("");
      setOtp(""); setPendingUser(null);
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
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data);
        setMessage("");