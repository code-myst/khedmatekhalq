// Cloudinary — unsigned upload (কোনো secret লাগে না, শুধু cloudName + uploadPreset)
export const CLOUD = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'wswiilug',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'atifaj',
  folder: 'khedmate-bookshop',
};

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUD.uploadPreset);
  fd.append('folder', CLOUD.folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD.cloudName}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('ছবি আপলোড হয়নি। Cloudinary-র upload preset "Unsigned" আছে কিনা দেখুন।');
  const data = await res.json();
  return data.secure_url;
}

// Cloudinary URL-এ অটো ফরম্যাট/কোয়ালিটি ও প্রস্থ বসায় (ছবি হালকা হয়)
export function optimize(url, width) {
  if (!url || !url.includes('/image/upload/')) return url || '';
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto${width ? `,w_${width}` : ''}/`);
}
