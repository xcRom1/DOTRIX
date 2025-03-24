import React, { useEffect, useRef, useState } from 'react';
import GIF from 'gif.js.optimized';
import workerPath from 'gif.js.optimized/dist/gif.worker.js?url';
import tokenLogo from './assets/Polkadot_Token_Pink.svg';
import tokenLogoWhite from './assets/Polkadot_Token_White.svg';

const WORD = 'Polkadot';

function App() {
  const canvasRef = useRef(null);
  const whiteLogoImgRef = useRef(new Image());
  const pinkLogoImgRef = useRef(new Image());
  const [textColor, setTextColor] = useState('#FF2670'); 
  const [bgColor, setBgColor] = useState('#000000'); 
  const [centerTextColor, setCenterTextColor] = useState('#FF2670'); 
  const [glitchColor1, setGlitchColor1] = useState('#FF2670'); 
  const [glitchColor2, setGlitchColor2] = useState('#FFFFFF'); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [gifSize, setGifSize] = useState("1920x917");
  const [speed, setSpeed] = useState(50);

  useEffect(() => {
    whiteLogoImgRef.current.src = tokenLogoWhite;
    pinkLogoImgRef.current.src = tokenLogo;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(0);
    const columnOffsets = Array(columns)
      .fill(0)
      .map(() => Math.floor(Math.random() * WORD.length));

    const draw = () => {
      const parsedGifWidth = parseInt(gifSize.split('x')[0], 10);
      const scale = parsedGifWidth / 1280;

      ctx.fillStyle = `${bgColor}20`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = textColor;
      ctx.font = '16px monospace';
      ctx.textBaseline = 'top';
      for (let i = 0; i < drops.length; i++) {
        const charIndex = (drops[i] + columnOffsets[i]) % WORD.length;
        const text = WORD[charIndex];
        ctx.fillText(text, i * 20, drops[i] * 20);
        if (drops[i] * 20 > canvas.height || Math.random() > 0.975) {
          drops[i] = 0;
          columnOffsets[i] = Math.floor(Math.random() * WORD.length);
        } else {
          drops[i]++;
        }
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = 60 * scale;
      ctx.font = `bold ${fontSize}px monospace`;
      
      const textMetrics = ctx.measureText("POLKADOT");
      const textWidth = textMetrics.width;
      const zoneWidth = textWidth * 1.2;
      const zoneHeight = fontSize * 1.2;
      const rectX = (canvas.width - zoneWidth) / 2;
      const rectY = (canvas.height - zoneHeight) / 2;
      ctx.fillStyle = bgColor;
      ctx.fillRect(rectX, rectY, zoneWidth, zoneHeight);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.fillStyle = centerTextColor;
      ctx.fillText("POLKADOT", centerX, centerY);
      
      const offset1 = Math.random() * 6 - 3;
      ctx.fillStyle = glitchColor1;
      ctx.fillText("POLKADOT", centerX + offset1, centerY + offset1);

      const offset2 = Math.random() * 6 - 3;
      ctx.fillStyle = glitchColor2;
      ctx.fillText("POLKADOT", centerX + offset2, centerY + offset2);

      const margin = 30 * scale;
      const logoWidth = 80 * scale;
      const logoHeight = 80 * scale;
      
      const leftLogoX = centerX - textWidth / 2 - logoWidth - margin;
      const rightLogoX = centerX + textWidth / 2 + margin;
      const logoY = centerY - logoHeight / 2;
      
      if (whiteLogoImgRef.current.complete) {
        ctx.drawImage(whiteLogoImgRef.current, leftLogoX, logoY, logoWidth, logoHeight);
        ctx.drawImage(whiteLogoImgRef.current, rightLogoX, logoY, logoWidth, logoHeight);
      }
      const pinkOffsetX = Math.random() * 6 - 3;
      const pinkOffsetY = Math.random() * 6 - 3;
      if (pinkLogoImgRef.current.complete) {
        ctx.drawImage(pinkLogoImgRef.current, leftLogoX + pinkOffsetX, logoY + pinkOffsetY, logoWidth, logoHeight);
        ctx.drawImage(pinkLogoImgRef.current, rightLogoX + pinkOffsetX, logoY + pinkOffsetY, logoWidth, logoHeight);
      }
    };

    const interval = setInterval(draw, speed);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [textColor, bgColor, centerTextColor, glitchColor1, glitchColor2, speed, gifSize]);

  const handleCaptureGIF = async () => {
    setIsDownloading(true);
    const canvas = canvasRef.current;
    const [gifWidth, gifHeight] = gifSize.split('x').map(Number);
    const gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: workerPath,
      width: gifWidth,
      height: gifHeight,
    });
    
    const framesCount = 80;
    const delay = 100;
    for (let i = 0; i < framesCount; i++) {
      await new Promise((res) => setTimeout(res, delay));
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = gifWidth;
      tempCanvas.height = gifHeight;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      tempCtx.drawImage(canvas, 0, 0, gifWidth, gifHeight);
      gif.addFrame(tempCanvas, { delay: delay, copy: true });
    }

    gif.on('finished', (blob) => {
      setIsDownloading(false);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'polkadot.gif';
      link.click();
    });

    gif.render();
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ background: bgColor, display: 'block' }} />
      <div style={styles.menu}>
        <label>
          🎨 Matrix colour :
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
        </label>
        <label>
          🌌 Background colour :
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        </label>
        <label>
          📐 Size : 1920x917
        </label>
        <label>
          ⚡ Speed :
          <input type="range" min="20" max="200" step="10" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          <span>{speed} ms</span>
        </label>
        <button onClick={handleCaptureGIF} disabled={isDownloading}>
          {isDownloading ? 'Download in progress...' : '📥 Download GIF'}
        </button>
      </div>
    </>
  );
}

const styles = {
  menu: {
    position: 'fixed',
    top: 20,
    right: 20,
    background: '#111',
    padding: '1rem',
    borderRadius: '12px',
    color: 'white',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 10,
  },
};

export default App;
