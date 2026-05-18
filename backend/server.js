const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

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

app.get('/search', (req, res) => {
  const { from, to } = req.query
  if (!from || !to) {
    return res.json({ error: 'Please provide from and to cities' })
  }
  res.json({ 
    from, 
    to, 
    buses: buses 
  })
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})