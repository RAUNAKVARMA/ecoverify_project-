/**
 * Zero-shot labels for EcoVerify product detection + classification.
 * Each catalog product has several natural-language prompts CLIP can score.
 */

export const PRESENCE_LABELS = [
  'a packaged consumer product',
  'a grocery or household item',
  'a reusable bottle or personal-care product',
  'a landscape or outdoor scenery',
  'a person or selfie',
  'an animal or pet',
  'a blank wall or empty table',
]

export const PRODUCT_PRESENCE_SET = new Set([
  'a packaged consumer product',
  'a grocery or household item',
  'a reusable bottle or personal-care product',
])

/** @type {{ id: string, name: string, brand: string, category: string, labels: string[], materials: string, packaging: string }[]} */
export const CATALOG_CLASS_DEFS = [
  {
    id: '1',
    name: 'Organic Milk Tetra Pack',
    brand: "Nature's Promise",
    category: 'Dairy',
    materials: 'recycled carton, plastic spout',
    packaging: 'tetra pack carton',
    labels: [
      'a milk carton',
      'a tetra pack of organic milk',
      'a dairy milk package',
    ],
  },
  {
    id: '2',
    name: 'Bamboo Toothbrush Set',
    brand: 'EcoSmile',
    category: 'Personal Care',
    materials: 'bamboo handle, plant-based bristles',
    packaging: 'compostable cardboard',
    labels: [
      'a bamboo toothbrush',
      'wooden toothbrushes',
      'an eco toothbrush set',
    ],
  },
  {
    id: '3',
    name: 'Green Tea Bottles',
    brand: 'PureBrew',
    category: 'Beverages',
    materials: 'PET plastic bottle',
    packaging: 'single-use plastic bottle',
    labels: [
      'a bottled green tea drink',
      'a plastic tea beverage bottle',
      'an iced tea bottle',
    ],
  },
  {
    id: '4',
    name: 'Organic Cotton T-Shirt',
    brand: 'FairWear',
    category: 'Fashion',
    materials: 'organic cotton',
    packaging: 'recycled paper mailer',
    labels: [
      'a cotton t-shirt',
      'a folded organic t-shirt',
      'a plain apparel shirt',
    ],
  },
  {
    id: '5',
    name: 'Almond Butter Jar',
    brand: 'NutriNuts',
    category: 'Food',
    materials: 'glass jar with plastic lid',
    packaging: 'glass jar',
    labels: [
      'a jar of almond butter',
      'a nut butter jar',
      'a peanut butter style jar',
    ],
  },
  {
    id: '6',
    name: 'Reusable Water Bottle',
    brand: 'HydroEco',
    category: 'Accessories',
    materials: 'stainless steel, silicone seal',
    packaging: 'minimal cardboard',
    labels: [
      'a reusable stainless steel water bottle',
      'a metal water bottle',
      'a thermos bottle',
    ],
  },
  {
    id: '7',
    name: 'Dish Soap Liquid',
    brand: 'CleanGreen',
    category: 'Household',
    materials: 'plastic bottle, liquid detergent',
    packaging: 'plastic soap bottle',
    labels: [
      'a bottle of dish soap',
      'liquid dishwashing detergent',
      'a kitchen soap bottle',
    ],
  },
  {
    id: '8',
    name: 'Organic Honey',
    brand: 'BeeNatural',
    category: 'Food',
    materials: 'glass jar, aluminum lid',
    packaging: 'glass honey jar',
    labels: [
      'a jar of honey',
      'organic honey in a glass jar',
      'a honey pot',
    ],
  },
  {
    id: '9',
    name: 'Eco Laundry Pods',
    brand: 'WashWise',
    category: 'Household',
    materials: 'plant-based pods, cardboard box',
    packaging: 'cardboard laundry box',
    labels: [
      'laundry detergent pods',
      'a box of washing pods',
      'eco laundry capsules',
    ],
  },
  {
    id: '10',
    name: 'Coconut Oil (Cold Pressed)',
    brand: 'TropicPure',
    category: 'Food',
    materials: 'glass jar, metal lid',
    packaging: 'glass oil jar',
    labels: [
      'a jar of coconut oil',
      'cold pressed coconut oil',
      'solid coconut oil in a jar',
    ],
  },
  {
    id: '11',
    name: 'Energy Drink',
    brand: 'PowerRush',
    category: 'Beverages',
    materials: 'aluminum can',
    packaging: 'aluminum beverage can',
    labels: [
      'an energy drink can',
      'a soda or energy beverage can',
      'an aluminum drink can',
    ],
  },
  {
    id: '12',
    name: 'Recycled Paper Notebook',
    brand: 'WriteRight',
    category: 'Stationery',
    materials: 'recycled paper',
    packaging: 'no plastic wrap',
    labels: [
      'a paper notebook',
      'a recycled notebook',
      'a stationery journal',
    ],
  },
]

export const ALL_PRODUCT_LABELS = CATALOG_CLASS_DEFS.flatMap((d) => d.labels)

export function resolveLabelToProduct(label) {
  const hit = CATALOG_CLASS_DEFS.find((d) => d.labels.includes(label))
  return hit || null
}
