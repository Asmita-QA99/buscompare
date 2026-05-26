const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected!'))
.catch(err => console.log('MongoDB error:', err))
// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
})

// Search History Schema
const searchSchema = new mongoose.Schema({
  from: String,
  to: String,
  date: String,
  userId: String,
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)
const Search = mongoose.model('Search', searchSchema)

// Bus Data
const buses = [
  {
    id: 1,
    name: "VRL Travels",
    type: "AC Sleeper",
    departure: "21:00",
    arrival: "05:30",
    duration: "8h 30m",
    rating: 4.2,
    sites: [
      { name: "RedBus", price: 749, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", price: 699, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", price: 779, coupon: "MMT80", saving: 80 },
      { name: "Paytm", price: 729, coupon: "PAYTM60", saving: 60 }
    ]
  },
  {
    id: 2,
    name: "Orange Travels",
    type: "Volvo AC",
    departure: "22:00",
    arrival: "06:00",
    duration: "8h 00m",
    rating: 4.5,
    sites: [
      { name: "RedBus", price: 899, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", price: 849, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", price: 879, coupon: "MMT80", saving: 80 },
      { name: "Paytm", price: 919, coupon: "PAYTM60", saving: 60 }
    ]
  },
  {
    id: 3,
    name: "Neeta Tours",
    type: "Non-AC Sleeper",
    departure: "20:00",
    arrival: "04:30",
    duration: "8h 30m",
    rating: 3.9,
    sites: [
      { name: "RedBus", price: 399, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", price: 349, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", price: 429, coupon: "MMT80", saving: 80 },
      { name: "Paytm", price: 379, coupon: "PAYTM60", saving: 60 }
    ]
  }
]

// Search buses
app.get('/search', async (req, res) => {
  const { from, to, userId } = req.query
  if (!from || !to) {
    return res.json({ error: 'Please provide from and to cities' })
  }

  // Save search to database
  try {
    await Search.create({ from, to, userId })
  } catch(err) {
    console.log('Search save error:', err)
  }

  res.json({ from, to, buses })
})

// Register user
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const user = await User.create({ name, email, password })
    res.json({ success: true, userId: user._id, name: user.name })
  } catch(err) {
    res.json({ success: false, message: 'Email already exists!' })
  }
})

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email, password })
    if(user) {
      res.json({ success: true, userId: user._id, name: user.name })
    } else {
      res.json({ success: false, message: 'Wrong email or password!' })
    }
  } catch(err) {
    res.json({ success: false, message: 'Login error!' })
  }
})

// Get search history
app.get('/history/:userId', async (req, res) => {
  try {
    const history = await Search.find({ 
      userId: req.params.userId 
    }).sort({ createdAt: -1 }).limit(10)
    res.json({ history })
  } catch(err) {
    res.json({ history: [] })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})