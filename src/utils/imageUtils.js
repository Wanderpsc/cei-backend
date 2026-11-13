// Utilitários de compressão de imagens enviadas pelo usuário.
// Objetivo: impedir que logos/capas em base64 estourem a quota do localStorage.

// PNG redimensionado acima deste tamanho perde a vez para JPEG (sem transparência).
const LIMITE_PNG_BYTES = 300 * 1024;

const estimarBytesDataUrl = (dataUrl) => {
  const base64 = String(dataUrl || '').split(',')[1] || '';
  return Math.floor(base64.length * 0.75);
};

/**
 * Redimensiona e comprime uma imagem em data URL.
 * Mantém PNG (transparência) quando o resultado fica pequeno; caso contrário
 * exporta JPEG com fundo branco. Nunca rejeita: em falha devolve o original.
 */
export const comprimirImagemDataUrl = (dataUrl, opcoes = {}) => {
  const { maxDimensao = 800, qualidade = 0.8, tipoOriginal = '' } = opcoes;

  return new Promise((resolve) => {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      try {
        const escala = Math.min(1, maxDimensao / Math.max(img.width || 1, img.height || 1));
        const largura = Math.max(1, Math.round((img.width || 1) * escala));
        const altura = Math.max(1, Math.round((img.height || 1) * escala));

        const podeTerTransparencia =
          /png|webp|svg/i.test(tipoOriginal) || /^data:image\/(png|webp|svg)/i.test(dataUrl);

        let resultado = null;

        if (podeTerTransparencia) {
          const canvasPng = document.createElement('canvas');
          canvasPng.width = largura;
          canvasPng.height = altura;
          canvasPng.getContext('2d').drawImage(img, 0, 0, largura, altura);
          const comoPng = canvasPng.toDataURL('image/png');
          if (estimarBytesDataUrl(comoPng) <= LIMITE_PNG_BYTES) {
            resultado = comoPng;
          }
        }

        if (!resultado) {
          const canvasJpeg = document.createElement('canvas');
          canvasJpeg.width = largura;
          canvasJpeg.height = altura;
          const ctx = canvasJpeg.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, largura, altura);
          ctx.drawImage(img, 0, 0, largura, altura);
          resultado = canvasJpeg.toDataURL('image/jpeg', qualidade);
        }

        // Se por algum motivo o original já for menor, mantém o original.
        resolve(resultado.length < dataUrl.length ? resultado : dataUrl);
      } catch (_error) {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
};

/**
 * Lê um File de input/upload e devolve a imagem comprimida em data URL.
 */
export const comprimirImagemArquivo = (file, opcoes = {}) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem'));
    reader.onloadend = () => {
      comprimirImagemDataUrl(String(reader.result), { ...opcoes, tipoOriginal: file?.type || '' })
        .then(resolve)
        .catch(() => resolve(String(reader.result)));
    };
    reader.readAsDataURL(file);
  });
