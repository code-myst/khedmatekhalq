import { WP_URL } from './config';

// WordPress REST helpers. Every helper fails soft: if WordPress is unreachable or a
// field is missing, the storefront keeps working and just hides that piece.
async function wpGet(path, revalidate = 300) {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// { [productId]: 'Author name' } (empty names are left out)
export async function getAuthors() {
  const list = await wpGet('/product?per_page=100&_fields=id,kk_author', 60);
  const map = {};
  (list || []).forEach((p) => {
    if (p.kk_author) map[p.id] = p.kk_author;
  });
  return map;
}

export async function getSeo(id) {
  const d = await wpGet(`/product/${id}?_fields=yoast_head_json`, 300);
  const y = d?.yoast_head_json;
  if (!y) return null;
  return { title: y.title, description: y.description || y.og_description, images: (y.og_image || []).map((i) => i.url) };
}

// Try several slugs, return the first published WP page: { title, html } or null
export async function getPage(slugs) {
  for (const slug of slugs) {
    const d = await wpGet(`/pages?slug=${encodeURIComponent(slug)}&_fields=title,content`, 120);
    if (d && d[0]) return { title: d[0].title?.rendered || '', html: d[0].content?.rendered || '' };
  }
  return null;
}

export const PAGE_SLUGS = {
  about: ['about', 'about-us', 'about-us-2'],
  contact: ['contact', 'contact-us'],
  delivery: [
    'delivery-return-policy', 'delivery-and-return-policy', 'delivery-return', 'delivery-returns',
    'shipping-returns', 'shipping-and-returns', 'return-policy', 'refund-policy', 'delivery-policy', 'shipping-policy',
  ],
};
