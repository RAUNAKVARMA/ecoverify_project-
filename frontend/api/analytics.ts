import { NextApiRequest, NextApiResponse } from 'next';

// Mock analytics data for demonstration
const analytics = {
  totalUsers: 120,
  totalProducts: 45,
  verifiedProducts: 30,
  searches: 200,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(analytics);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
