import { NextApiRequest, NextApiResponse } from 'next';

// Mock data for demonstration (replace with DB or real data as needed)
const products = [
  { id: 1, name: 'Eco Bottle', brand: 'GreenCo', verified: true },
  { id: 2, name: 'Sustainable Bag', brand: 'EcoBrand', verified: false },
  { id: 3, name: 'Organic T-Shirt', brand: 'NatureWear', verified: true },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { productId } = req.body;
    const product = products.find(p => p.id === Number(productId));
    if (product) {
      res.status(200).json({ verified: product.verified });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
