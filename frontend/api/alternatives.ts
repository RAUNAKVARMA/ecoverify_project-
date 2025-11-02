import { NextApiRequest, NextApiResponse } from 'next';

// Mock data for demonstration (replace with DB or real data as needed)
const products = [
  { id: 1, name: 'Eco Bottle', brand: 'GreenCo', verified: true, alternatives: [2, 3] },
  { id: 2, name: 'Sustainable Bag', brand: 'EcoBrand', verified: false, alternatives: [1, 3] },
  { id: 3, name: 'Organic T-Shirt', brand: 'NatureWear', verified: true, alternatives: [1, 2] },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { productId } = req.query;
    const product = products.find(p => p.id === Number(productId));
    if (product) {
      const alternatives = products.filter(p => product.alternatives.includes(p.id));
      res.status(200).json(alternatives);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
