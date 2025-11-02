import { NextApiRequest, NextApiResponse } from 'next';

// Mock user data for demonstration
const users = [
  { id: 1, username: 'user1', password: 'pass1', name: 'Alice' },
  { id: 2, username: 'user2', password: 'pass2', name: 'Bob' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      res.status(200).json({ id: user.id, name: user.name });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
