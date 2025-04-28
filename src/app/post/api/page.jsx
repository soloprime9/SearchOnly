// pages/api/post/[id].js
import axios from 'axios';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // Example: Fetch data from an external API or database
    const response = await axios.get(`https://your-backend-api.com/content/post/${id}`);
    const post = response.data;
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
}
