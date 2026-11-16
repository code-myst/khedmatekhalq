export function shape(p) {
  const r = p.prices.price_range;
  return {
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.src || '',
    price: p.prices.price,
    regular: p.prices.regular_price,
    onSale: p.on_sale,
    varied: p.type === 'variable' && !!r && r.min_amount !== r.max_amount,
    min: r?.min_amount || p.prices.price,
    type: p.type,
    inStock: p.is_in_stock,
    cats: (p.categories || []).map((c) => c.id),
    rating: Number(p.average_rating) || 0,
    reviews: Number(p.review_count) || 0,
  };
}
