import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Leaf } from 'lucide-react'
import QuickScan from '@/components/home/QuickScan'
import { products } from '@/components/data/productData'

const u = (id, w = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const P = {
