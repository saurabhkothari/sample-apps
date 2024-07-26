require('dotenv').config();
const { createLogger, format, transports } = require('winston');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
// MongoDB connection
const mongoUrl = process.env.MONGO_URL
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err.message));

// Define Mongoose Schema for votes
const CarVote = mongoose.model('CarVote', { username: String, car: String });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'user' && password === 'user') {
    req.session.user = username;
    res.redirect('/vote');
  } else {
    res.send('Invalid credentials. Please try again.');
  }
});

// Handle vote counts and display
app.get('/vote', (req, res) => {
    if (!req.session.user) {
      res.redirect('/');
    } else {
      // Aggregate query to count votes
      CarVote.aggregate([
        { $group: { _id: '$car', count: { $sum: 1 } } }
      ])
      .then(results => {
        // Prepare vote counts object
        const voteCounts = {
          BMW: 0,
          Audi: 0,
          Mercedes: 0 // Use quotes for multi-word keys in JavaScript objects
        };
  
        // Populate vote counts from aggregation results
        results.forEach(result => {
          if (result._id in voteCounts) {
            voteCounts[result._id] = result.count;
          }
        });
  
        // Render vote.html template with vote counts and user information
        res.render('vote', { user: req.session.user, votes: voteCounts });
      })
      .catch(err => {
        console.error('Error fetching vote counts:', err);
        res.status(500).send('Error fetching vote counts. Please try again.');
      });
    }
  });
  

// Handle vote submission
app.post('/vote', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    const { car } = req.body;
    // Save vote to MongoDB
    const newVote = new CarVote({ username: req.session.user, car });
    newVote.save()
      .then(() => {
        res.redirect('/vote');
      })
      .catch(err => {
        console.error('Error saving vote:', err.message);
        res.send('Error voting. Please try again.');
      });
  }
});

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Set view engine and views directory
app.set('view engine', 'ejs'); // Assuming you have EJS installed (`npm install ejs`)
app.set('views', __dirname + '/views');

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



const logger = createLogger({
  level: 'info',
  exitOnError: false,
  format: format.json(),
  transports: [
    new transports.File({ filename: '/home/ec2-user/project/logs/app.log' }),
  ],
});

module.exports = logger;

// Example logs
logger.log('info', 'Hello simple log!');
logger.info('Hello log with metas',{color: 'blue' });

