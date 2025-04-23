const Community = require('../models/Community');
const User = require('../models/User');

// Create a new community
const createCommunity = async (req, res) => {
  try {
    const { name, location } = req.body;

    // Create new community
    const community = new Community({
      name,
      location,
      members: [req.user._id] // Add the creator as the first member
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
    const communities = await Community.find().populate('members', 'username email');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching communities', error: error.message });
  }
};

// Get a single community
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('members', 'username email');
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

    // Check if user is already a member
    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'User is already a member of this community' });
    }

    community.members.push(req.user._id);
    await community.save();

    res.json({ message: 'Successfully joined the community', community });
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

    // Remove user from members array
    community.members = community.members.filter(member => !member.equals(req.user._id));
    await community.save();

    res.json({ message: 'Successfully left the community' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving community', error: error.message });
  }
};

// Get community members
const getCommunityMembers = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members', 'username email');
    
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

module.exports = {
  createCommunity,
  getAllCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updatePreferences
}; 