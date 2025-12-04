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
  leaves: u('photo-1518531933037-91b2f5f229cc', 700),
  field: u('photo-1500382017468-9049fed747ef', 800),
  beach: u('photo-1507525428034-b723cf961d3e', 1000),
  lemon: u('photo-1590502593747-42a996133562', 600),
  bread: u('photo-1509440159596-0249088772ff', 600),
  tea: products[2].image.replace('w=200', 'w=600'),
}

/** Earth plate for the continuous open peak (green hills — not beach) */
const EARTH = u('photo-1501854140801-50d01698950b', 1200)

const WORDMARKS = [
  { id: 'script', className: 'wm-script', label: 'EcoVerify' },
  { id: 'bold', className: 'wm-bold', label: 'EcoVerify' },
  { id: 'outline', className: 'wm-outline', label: 'EcoVerify' },
]

/**
 * Option A — one continuous collage.
 * Wave 1 (seed): plants + goods land → earth opens
 * Wave 2: rest of wreath fills in → phones
 */
const SEED_CLS = new Set(['pc-palms', 'pc-leaves', 'pc-sun', 'pc-bottle', 'pc-honey', 'pc-bamboo'])

const RAW_PIECES = [
  { src: P.palms, shape: 'tall', cls: 'pc-palms', rot: -8, from: 'bottomleft', z: 8 },
  { src: P.leaves, shape: 'tall', cls: 'pc-leaves', rot: 7, from: 'topright', z: 7 },
  { src: P.beach, shape: 'torn', cls: 'pc-beach', rot: 0, from: 'bottom', z: 6 },
  { src: P.sky, shape: 'sky', cls: 'pc-sky-sync', rot: 0, from: 'top', z: 2, isSky: true },
  { src: P.field, shape: 'torn', cls: 'pc-field', rot: -6, from: 'left', z: 5 },
  { src: P.forest, shape: 'torn', cls: 'pc-forest', rot: 8, from: 'right', z: 5 },
  { src: P.sunflower, shape: 'round', cls: 'pc-sun', rot: 12, from: 'top', z: 14 },
  { src: P.hands, shape: 'polaroid', cls: 'pc-hands', rot: -10, from: 'bottomleft', z: 16, caption: 'real dirt.' },
  { src: P.market, shape: 'polaroid', cls: 'pc-market', rot: 8, from: 'topright', z: 15, caption: 'shop wise' },
  { src: P.bottle, shape: 'round', cls: 'pc-bottle', rot: -16, from: 'topleft', z: 17 },
  { src: P.honey, shape: 'round', cls: 'pc-honey', rot: 18, from: 'topright', z: 17 },
  { src: P.bamboo, shape: 'squircle', cls: 'pc-bamboo', rot: -5, from: 'left', z: 12 },
  { src: P.berries, shape: 'round', cls: 'pc-berries', rot: -20, from: 'right', z: 16 },
  { src: P.citrus, shape: 'round', cls: 'pc-citrus', rot: 14, from: 'bottomright', z: 16 },
  { src: P.moss, shape: 'squircle', cls: 'pc-moss', rot: 5, from: 'top', z: 11 },
  { src: P.herbs, shape: 'squircle', cls: 'pc-herbs', rot: -9, from: 'left', z: 11 },
  { src: P.coconut, shape: 'round', cls: 'pc-coco', rot: -12, from: 'right', z: 13 },
  { src: P.milk, shape: 'squircle', cls: 'pc-milk', rot: 7, from: 'bottom', z: 12 },
  { src: P.tomatoes, shape: 'round', cls: 'pc-tomato', rot: 15, from: 'bottomleft', z: 15 },
  { src: P.lemon, shape: 'round', cls: 'pc-avo', rot: -13, from: 'left', z: 15 },
  { src: P.bread, shape: 'squircle', cls: 'pc-bread', rot: 9, from: 'right', z: 10 },
  { src: P.tea, shape: 'round', cls: 'pc-tea', rot: -7, from: 'topleft', z: 14 },
].filter((p) => !p.isSky)

const seedList = RAW_PIECES.filter((p) => SEED_CLS.has(p.cls))
const restList = RAW_PIECES.filter((p) => !SEED_CLS.has(p.cls))

