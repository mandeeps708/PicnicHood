const Community = require('../models/Community');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new community
const createCommunity = async (req, res) => {
  try {
    const { name, location } = req.body;

    // Create new community
    const community = new Community({
      name,
      location,
      members: [{
        user: req.user._id,
        deliveryTime: 'Morning'
      }]
    });

    await community.save();
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Error creating community', error: error.message });
  }
};

// Get all communities
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate('members.user', 'username email');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching communities', error: error.message });
  }
};

// Get a single community
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('members.user', 'username email');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community', error: error.message });
  }
};

// Join a community
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Convert user ID to ObjectId for comparison
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Check if user is already a member
    if (community.members.some(member => member.user.equals(userId))) {
      return res.status(400).json({ message: 'User is already a member of this community' });
    }

    // Check if user is already in another community
    const user = await User.findById(userId);
    if (user.community) {
      return res.status(400).json({ message: 'User is already a member of another community' });
    }

    // Add user as a new member with default delivery time
    community.members.push({
      user: userId,
      deliveryTime: 'Morning'
    });

    // Update user's community field
    user.community = community._id;
    await user.save();

    await community.save();

    // Populate user information before sending response
    await community.populate('members.user', 'username email');

    res.json({ 
      message: 'Successfully joined the community', 
      community 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining community', error: error.message });
  }
};

// Leave a community
const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Convert user ID to ObjectId for comparison
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Remove user from members array
    community.members = community.members.filter(
      member => !member.user.equals(userId)
    );

    await community.save();

    // If there are still members, update the community's delivery time preference
    if (community.members.length > 0) {
      await updateCommunityDeliveryTime(community);
    }

    res.json({ message: 'Successfully left the community' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving community', error: error.message });
  }
};

// Get community members
const getCommunityMembers = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.user', 'username email');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community.members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community members', error: error.message });
  }
};

// Update community preferences
const updatePreferences = async (req, res) => {
  try {
    const { deliveryDay, deliveryTime } = req.body;
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Update preferences
    community.preferences = {
      ...community.preferences,
      deliveryDay,
      deliveryTime
    };

    await community.save();
    res.json({ message: 'Preferences updated successfully', preferences: community.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

// Helper function to update community delivery time based on votes
const updateCommunityDeliveryTime = async (community) => {
  const timeCounts = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0
  };

  community.members.forEach(member => {
    timeCounts[member.deliveryTime]++;
  });

  // Find the most popular time
  let mostPopularTime = 'Morning';
  let maxVotes = timeCounts.Morning;

  if (timeCounts.Afternoon > maxVotes) {
    mostPopularTime = 'Afternoon';
    maxVotes = timeCounts.Afternoon;
  }
  if (timeCounts.Evening > maxVotes) {
    mostPopularTime = 'Evening';
  }

  // Update community preferences
  community.preferences.deliveryTime = mostPopularTime;
  await community.save();
};

// Vote for delivery time
const voteForDeliveryTime = async (req, res) => {
  try {
    const { deliveryTime } = req.body;
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Convert user ID to ObjectId for comparison
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Find member index
    const memberIndex = community.members.findIndex(
      member => member.user.equals(userId)
    );

    if (memberIndex === -1) {
      return res.status(403).json({ message: 'You are not a member of this community' });
    }

    // Update member's delivery time
    community.members[memberIndex].deliveryTime = deliveryTime;

    // Update community delivery time based on all votes
    await updateCommunityDeliveryTime(community);

    // Populate user information before sending response
    await community.populate('members.user', 'username email');

    res.json({
      message: 'Vote recorded successfully',
      preferences: community.preferences,
      members: community.members
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording vote', error: error.message });
  }
};

// Get community votes
const getCommunityVotes = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.user', 'username email');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json({
      preferences: community.preferences,
      members: community.members
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching votes', error: error.message });
  }
};

module.exports = {
  createCommunity,
  getAllCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updatePreferences,
  voteForDeliveryTime,
  getCommunityVotes
}; 