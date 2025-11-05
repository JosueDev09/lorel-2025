import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

// Rutas corregidas - relativas al directorio actual
const carpetaEntrada = './public/assets/images/'
const carpetaSalida = './public/assets/imgConvertidas/'

// Crear carpetas si no existen
if (!fs.existsSync(carpetaEntrada)) {
    console.error('❌ La carpeta de entrada no existe:', carpetaEntrada);
    console.log('💡 Crea la carpeta:', carpetaEntrada);
    process.exit(1);
}

if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida, { recursive: true });
    console.log('✅ Carpeta de salida creada:', carpetaSalida);
}

fs.readdir(carpetaEntrada, (err, files) => {
    if (err) {
        console.error('❌ Error al leer la carpeta de entrada:', err);
        return;
    }

    if (files.length === 0) {
        console.log('⚠️ No hay archivos en la carpeta de entrada:', carpetaEntrada);
        return;
    }

    console.log('📁 Archivos encontrados:', files.length);

    // Itera sobre cada archivo en la carpeta de entrada
    files.forEach((file) => {
        // Verifica que sea una imagen (extensiones soportadas)
        if (file.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/i)) {
            // Rutas completas usando path.join para mejor compatibilidad
            const imagePath = path.join(carpetaEntrada, file);
            
           // Genera el nombre de la imagen de salida con extensión .webp
            const nombreSinExtension = file.replace(/\s+/g, '').replace(/\.[^.]+$/, '');
            const imageOutputPath = path.join(carpetaSalida, nombreSinExtension + '.webp');

            console.log(`🔄 Convirtiendo: ${file} → ${nombreSinExtension}.webp`);
            
            // Convierte la imagen a WebP y guarda en la carpeta de salida
            sharp(imagePath)
                .webp({ quality: 80 }) // Calidad del 80% para buen balance tamaño/calidad
                .toFile(imageOutputPath)
                .then(() => {
                    console.log('✅ Imagen convertida:', imageOutputPath);
                })
                .catch((err) => {
                    console.error('❌ Error al convertir la imagen:', file, err.message);
                });
        } else {
            console.log(`⏭️ Archivo omitido (no es imagen):`, file);
        }
    });
});