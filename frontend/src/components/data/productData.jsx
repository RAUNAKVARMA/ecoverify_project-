const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

export const products = [
  {
    id: '1',
