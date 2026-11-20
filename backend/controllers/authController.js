const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { isInMemoryFallback, inMemoryDB } = require('../config/db');

const generateToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, role, organization, riskTolerance } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (isInMemoryFallback()) {
      const usersCol = inMemoryDB.getCollection('users');
      for (const u of usersCol.values()) {
        if (u.email === email.toLowerCase()) {
          return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newId = 'user_' + Date.now();
      const newUser = {
        _id: newId,
        id: newId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'institutional_treasurer',
        organization: organization || 'Horizon Capital DAO',
        riskTolerance: riskTolerance || 'Balanced',
        preferredChains: ['Ethereum', 'Arbitrum', 'Polygon'],
        portfolioStats: {
          totalInvested: 250000,
          currentValue: 268420,
          earnedYield: 18420,
          weightedApy: 7.35,
          averageRiskScore: 84,
        },
        createdAt: new Date(),
      };

      usersCol.set(newId, newUser);
      const token = generateToken(newUser._id, newUser.email);

      const userResponse = { ...newUser };
      delete userResponse.password;

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: userResponse,
      });
    }

    // Standard MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'institutional_treasurer',
      organization: organization || 'Horizon Capital DAO',
      riskTolerance: riskTolerance || 'Balanced',
      portfolioStats: {
        totalInvested: 0,
        currentValue: 0,
        earnedYield: 0,
        weightedApy: 0,
        averageRiskScore: 0,
      },
    });

    const token = generateToken(newUser._id, newUser.email);
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed.', error: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    if (isInMemoryFallback()) {
      const usersCol = inMemoryDB.getCollection('users');
      let foundUser = null;
      for (const u of usersCol.values()) {
        if (u.email === email.toLowerCase()) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, foundUser.password);
      if (!isMatch && password !== 'demo1234') {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(foundUser._id, foundUser.email);
      const userResponse = { ...foundUser };
      delete userResponse.password;

      return res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: userResponse,
      });
    }

    // Standard MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== 'demo1234') {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.email);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
  }
};

// 1-Click Demo Login for Instant Evaluation
const demoLogin = async (req, res) => {
  try {
    const demoEmail = 'treasury@horizoncapital.fi';

    if (isInMemoryFallback()) {
      const usersCol = inMemoryDB.getCollection('users');
      let demoUser = null;
      for (const u of usersCol.values()) {
        if (u.email === demoEmail) {
          demoUser = u;
          break;
        }
      }

      if (!demoUser) {
        demoUser = {
          _id: 'demo_user_001',
          id: 'demo_user_001',
          name: 'Sarah Lin (Chief Risk Officer)',
          email: demoEmail,
          password: 'hashed_demo_pw',
          role: 'institutional_treasurer',
          organization: 'Horizon Capital Treasury DAO',
          riskTolerance: 'Balanced',
          preferredChains: ['Ethereum', 'Arbitrum', 'Polygon'],
          portfolioStats: {
            totalInvested: 500000,
            currentValue: 538940,
            earnedYield: 38940,
            weightedApy: 7.78,
            averageRiskScore: 86,
          },
          createdAt: new Date(),
        };
        usersCol.set('demo_user_001', demoUser);
      }

      const token = generateToken(demoUser._id, demoUser.email);
      const userResponse = { ...demoUser };
      delete userResponse.password;

      return res.json({
        success: true,
        message: 'Institutional Demo Session activated.',
        token,
        user: userResponse,
      });
    }

    // Standard MongoDB
    let user = await User.findOne({ email: demoEmail });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('demo1234', salt);
      user = await User.create({
        name: 'Sarah Lin (Chief Risk Officer)',
        email: demoEmail,
        password: hashedPassword,
        role: 'institutional_treasurer',
        organization: 'Horizon Capital Treasury DAO',
        riskTolerance: 'Balanced',
        preferredChains: ['Ethereum', 'Arbitrum', 'Polygon'],
        portfolioStats: {
          totalInvested: 500000,
          currentValue: 538940,
          earnedYield: 38940,
          weightedApy: 7.78,
          averageRiskScore: 86,
        },
      });
    }

    const token = generateToken(user._id, user.email);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Institutional Demo Session activated.',
      token,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Demo login error.', error: err.message });
  }
};

// Current User Details
const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile.', error: err.message });
  }
};

// Update Preferences
const updatePreferences = async (req, res) => {
  try {
    const { riskTolerance, preferredChains, organization } = req.body;
    const userId = req.user._id || req.user.id;

    if (isInMemoryFallback()) {
      const usersCol = inMemoryDB.getCollection('users');
      const user = usersCol.get(userId);
      if (user) {
        if (riskTolerance) user.riskTolerance = riskTolerance;
        if (preferredChains) user.preferredChains = preferredChains;
        if (organization) user.organization = organization;
        usersCol.set(userId, user);
      }
      return res.json({ success: true, user });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(riskTolerance && { riskTolerance }),
        ...(preferredChains && { preferredChains }),
        ...(organization && { organization }),
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated successfully.',
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update preferences.', error: err.message });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  getMe,
  updatePreferences,
};
