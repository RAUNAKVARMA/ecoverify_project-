import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Leaf } from 'lucide-react'
import QuickScan from '@/components/home/QuickScan'
import { products } from '@/components/data/productData'

const u = (id, w = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const P = {
  sky: u('photo-1506905925346-21bda4d32df4', 1600),
  palms: u('photo-1509423350716-97f9360b4e09', 900),
  sunflower: u('photo-1597848212624-a19eb35e2651', 800),
  hands: u('photo-1542601906990-b4d3fb778b09', 800),
  produce: u('photo-1542838132-92c53300491e', 800),
  forest: u('photo-1441974231531-c6227db76b6e', 800),
  market: u('photo-1504674900247-0877df9cc836', 700),
  bottle: products[5].image.replace('w=200', 'w=600'),
  honey: products[7].image.replace('w=200', 'w=600'),
