import axios from 'axios';

/**
 * Servicio centralizado para subir imágenes a ImageKit
 * Evita guardar base64 en la base de datos
 */
export const uploadToImageKit = async (file, userId, folder = '/bolsa') => {
  if (!file) return null;

  try {
    // 1. Obtener credenciales dinámicas de ImageKit desde el backend
    // Nota: Usamos el endpoint centralizado del proyecto holding
    const authUrl = `https://apiweb.hitpoly.com/ajax/imagekit_auth.php?userId=${userId}`;
    console.log(`[ImageKit Service] 1. Solicitando autenticación para userId: ${userId} a: ${authUrl}`);
    const authRes = await axios.get(authUrl);
    
    console.log(`[ImageKit Service] 2. Respuesta de Auth recibida:`, authRes.data);

    if (!authRes.data || !authRes.data.signature) {
      console.error("[ImageKit Service] Faltan credenciales en la respuesta de auth:", authRes.data);
      throw new Error('No se pudieron obtener las credenciales de ImageKit');
    }

    const { token, expire, signature, publicKey } = authRes.data;

    // 2. Preparar FormData para la subida directa a ImageKit
    const formData = new FormData();
    const fileName = `bolsa_${userId}_${Date.now()}`;
    formData.append("file", file);
    formData.append("fileName", fileName);
    formData.append("publicKey", publicKey);
    formData.append("signature", signature);
    formData.append("expire", expire);
    formData.append("token", token);
    formData.append("useUniqueFileName", "true");
    formData.append("folder", folder);

    console.log(`[ImageKit Service] 3. FormData preparado. Subiendo archivo "${file.name}" (${file.size} bytes) a la carpeta "${folder}" con nombre "${fileName}"...`);

    // 3. Realizar la subida a ImageKit
    const resIK = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log(`[ImageKit Service] 4. Respuesta de subida a ImageKit recibida:`, resIK.data);

    if (resIK.data && resIK.data.url) {
      console.log(`[ImageKit Service] 5. ¡Éxito! URL final:`, resIK.data.url);
      return resIK.data.url;
    }

    throw new Error('Error al obtener la URL de ImageKit');
  } catch (error) {
    console.error("[ImageKit Service] ERROR CRÍTICO durante el proceso:", error);
    if (error.response) {
      console.error("[ImageKit Service] Detalles del error de red (Response):", error.response.data, "Status:", error.response.status);
    }
    throw error;
  }
};
