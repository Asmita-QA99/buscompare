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

// All Indian Bus Operators
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
      { name: "RedBus", basePrice: 749, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", basePrice: 699, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", basePrice: 779, coupon: "MMT80", saving: 80 },
      { name: "Paytm", basePrice: 729, coupon: "PAYTM60", saving: 60 }
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
      { name: "RedBus", basePrice: 899, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", basePrice: 849, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", basePrice: 879, coupon: "MMT80", saving: 80 },
      { name: "Paytm", basePrice: 919, coupon: "PAYTM60", saving: 60 }
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
      { name: "RedBus", basePrice: 399, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", basePrice: 349, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", basePrice: 429, coupon: "MMT80", saving: 80 },
      { name: "Paytm", basePrice: 379, coupon: "PAYTM60", saving: 60 }
    ]
  },
  {
    id: 4,
    name: "SRS Travels",
    type: "AC Sleeper",
    departure: "20:30",
    arrival: "06:00",
    duration: "9h 30m",
    rating: 4.1,
    sites: [
      { name: "RedBus", basePrice: 699, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", basePrice: 649, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", basePrice: 729, coupon: "MMT80", saving: 80 },
      { name: "Paytm", basePrice: 679, coupon: "PAYTM60", saving: 60 }
    ]
  },
  {
    id: 5,
    name: "Patel Travels",
    type: "Non-AC Seater",
    departure: "19:00",
    arrival: "05:00",
    duration: "10h 00m",
    rating: 3.7,
    sites: [
      { name: "RedBus", basePrice: 299, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", basePrice: 279, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", basePrice: 319, coupon: "MMT80", saving: 80 },
      { name: "Paytm", basePrice: 289, coupon: "PAYTM60", saving: 60 }
    ]
  },
  {
    id: 6,
    name: "IntrCity SmartBus",
    type: "Volvo AC Seater",
    departure: "23:00",
    arrival: "07:00",
    duration: "8h 00m",
    rating: 4.6,
    sites: [
      { name: "RedBus", basePrice: 999, coupon: "REDBUS100", saving: 100 },
      { name: "AbhiBus", basePrice: 949, coupon: "ABHI50", saving: 50 },
      { name: "MakeMyTrip", basePrice: 1049, coupon: "MMT80", saving: 80 },
      { name: "Paytm", basePrice: 979, coupon: "PAYTM60", saving: 60 }
    ]
  }
]

// Calculate distance-based price multiplier
function getPriceMultiplier(from, to) {
  const cities = from.toLowerCase() + to.toLowerCase()

  // Short distance routes
  if (cities.includes('pune') && cities.includes('mumbai')) return 1.0
  if (cities.includes('delhi') && cities.includes('agra')) return 0.8
  if (cities.includes('bangalore') && cities.includes('mysore')) return 0.7
  if (cities.includes('chennai') && cities.includes('pondicherry')) return 0.75

  // Medium distance routes
  if (cities.includes('mumbai') && cities.includes('goa')) return 1.3
  if (cities.includes('pune') && cities.includes('goa')) return 1.2
  if (cities.includes('delhi') && cities.includes('jaipur')) return 1.1
  if (cities.includes('bangalore') && cities.includes('hyderabad')) return 1.4
  if (cities.includes('mumbai') && cities.includes('ahmedabad')) return 1.3
  if (cities.includes('chennai') && cities.includes('bangalore')) return 1.2
  if (cities.includes('hyderabad') && cities.includes('vijayawada')) return 0.9
  if (cities.includes('kolkata') && cities.includes('bhubaneswar')) return 1.1

  // Long distance routes
  if (cities.includes('delhi') && cities.includes('mumbai')) return 2.5
  if (cities.includes('delhi') && cities.includes('bangalore')) return 3.0
  if (cities.includes('mumbai') && cities.includes('kolkata')) return 2.8
  if (cities.includes('delhi') && cities.includes('kolkata')) return 2.6
  if (cities.includes('bangalore') && cities.includes('chennai')) return 1.1
  if (cities.includes('mumbai') && cities.includes('hyderabad')) return 1.8
  if (cities.includes('pune') && cities.includes('hyderabad')) return 1.6
  if (cities.includes('delhi') && cities.includes('hyderabad')) return 2.8

  // Default multiplier for unknown routes
  return 1.0 + (Math.random() * 0.8)
}

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

  const multiplier = getPriceMultiplier(from, to)

  // Generate dynamic prices based on route
  const routeBuses = buses.map(bus => ({
    ...bus,
    sites: bus.sites.map(site => ({
      name: site.name,
      price: Math.floor(site.basePrice * multiplier),
      coupon: site.coupon,
      saving: site.saving
    }))
  }))

  res.json({ from, to, buses: routeBuses })
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