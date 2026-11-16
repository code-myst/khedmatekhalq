import { WP_URL } from './config';

export async function wc(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${WP_URL}/wp-json/wc/store/v1${path}${qs ? '?' + qs : ''}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`WooCommerce ${res.status}`);
  return res.json();
}
