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
  bamboo: products[1].image.replace('w=200', 'w=600'),
  milk: products[0].image.replace('w=200', 'w=600'),
  citrus: u('photo-1611080626919-7cf5a9dbab5b', 600),
  berries: u('photo-1464454709131-ffd692591ee5', 600),
  coconut: products[9].image.replace('w=200', 'w=600'),
  herbs: u('photo-1416879595882-3373a0480b5b', 600),
  tomatoes: u('photo-1518977956812-cd3dbadaaf31', 600),
  moss: u('photo-1469474968028-56623f02e42e', 600),
