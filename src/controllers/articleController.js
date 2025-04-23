const Article = require('../models/Article');

// Create a new article
const createArticle = async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error creating article', error: error.message });
  }
};

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
};

// Get a single article
const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching article', error: error.message });
  }
};

// Update an article
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Error updating article', error: error.message });
  }
};

// Delete an article
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting article', error: error.message });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticle,
  updateArticle,
  deleteArticle
}; 