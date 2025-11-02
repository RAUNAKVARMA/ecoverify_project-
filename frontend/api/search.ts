import { NextApiRequest, NextApiResponse } from 'next';

// Mock data for demonstration (replace with DB or real data as needed)
const products = [
  { id: 1, name: 'Eco Bottle', brand: 'GreenCo', verified: true },
  { id: 2, name: 'Sustainable Bag', brand: 'EcoBrand', verified: false },
  { id: 3, name: 'Organic T-Shirt', brand: 'NatureWear', verified: true },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { q } = req.query;
    if (typeof q === 'string') {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.toLowerCase().includes(q.toLowerCase())
      );
      res.status(200).json(filtered);
    } else {
      res.status(200).json(products);
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
