const fs = require('fs');
const { exec } = require('child_process');

// SVG'yi PNG'ye dönüştürmek için komut
const convertCommand = `npx svgexport assets/images/ultra-visible-splash.svg assets/images/splash-icon.png 3x`;

console.log('SVG dosyası PNG formatına dönüştürülüyor...');

// Önce svgexport paketini yükleyelim
exec('npm install -g svgexport', (error, stdout, stderr) => {
  if (error) {
    console.error(`Hata oluştu: ${error}`);
    return;
  }
  
  // Şimdi dönüştürme işlemini gerçekleştirelim
  exec(convertCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Dönüştürme sırasında hata oluştu: ${error}`);
      return;
    }
    console.log('SVG başarıyla PNG formatına dönüştürüldü!');
  });
}); 