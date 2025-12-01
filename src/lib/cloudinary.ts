export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  // Ganti dengan Upload Preset Anda dari dashboard Cloudinary
  formData.append("upload_preset", "inspage"); 
  // Ganti dengan Cloud Name Anda
  const cloudName = process.env.CLOUD_NAME!;

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    
    return data.secure_url; // Ini URL yang akan disimpan ke DB
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
}