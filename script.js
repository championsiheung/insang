(async function(){
  const video = document.getElementById('preview');
  const startBtn = document.getElementById('startBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const countdownEl = document.getElementById('countdown');
  const thumbs = document.getElementById('thumbs');
  const finalImg = document.getElementById('finalImg');
  const composeCanvas = document.getElementById('composeCanvas');

  let stream;
  try{
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio:false});
    video.srcObject = stream;
  } catch(e){
    alert('카메라 권한 필요: ' + e.message);
    console.error(e);
    return;
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

  function captureFrame(width = 720){
    const h = video.videoHeight;
    const w = video.videoWidth;
    const size = Math.min(w,h);
    const sx = Math.floor((w-size)/2);
    const sy = Math.floor((h-size)/2);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = width;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, sx, sy, size, size, 0, 0, width, width);
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  async function doCountdown(start = 3){
    countdownEl.style.display = 'block';
    for(let i = start; i >= 1; --i){
      countdownEl.textContent = i;
      await sleep(800);
    }
    countdownEl.style.display = 'none';
  }

  function loadImg(src){
    return new Promise((res,rej)=>{
      const i = new Image();
      i.onload = ()=>res(i);
      i.onerror = rej;
      i.src = src;
    });
  }

  let shots = [];

  async function shootSequence(){
    startBtn.disabled = true;
    retakeBtn.disabled = true;
    downloadBtn.disabled = true;
    shots = [];
    thumbs.innerHTML = '';
    finalImg.style.display = 'none';

    for(let i=0;i<4;i++){
      await doCountdown(3);
      try{ new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=').play(); }catch(e){}
      const dataUrl = captureFrame(900);
      shots.push(dataUrl);

      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.width = '74px';
      img.style.height = '74px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      thumbs.appendChild(img);

      await sleep(400);
    }

    const padding = 12;
    const shotPx = 900;
    composeCanvas.width = shotPx;
    composeCanvas.height = shotPx*4 + padding*3;
    const ctx = composeCanvas.getContext('2d');

    ctx.fillStyle = '#111';
    ctx.fillRect(0,0,composeCanvas.width,composeCanvas.height);
    ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.2)';

    for(let i=0;i<shots.length;i++){
      const img = await loadImg(shots[i]);
      const y = i*(shotPx + padding);
      ctx.drawImage(img, 0, y, shotPx, shotPx);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, y, shotPx, shotPx);
    }

    ctx.filter = 'none';
    ctx.fillStyle = '#fff';
    ctx.font = '32px "Nanum Pen Script"';
    ctx.fillText('인생네컷', 20, composeCanvas.height - 20);

    const finalData = composeCanvas.toDataURL('image/jpeg',0.95);
    finalImg.src = finalData;
    finalImg.style.display = 'block';
    downloadBtn.disabled = false;
    retakeBtn.disabled = false;
    startBtn.disabled = false;
  }

  startBtn.addEventListener('click', shootSequence);
  retakeBtn.addEventListener('click', ()=>{
    shots = [];
    thumbs.innerHTML = '';
    finalImg.style.display = 'none';
    downloadBtn.disabled = true;
  });
  downloadBtn.addEventListener('click', ()=>{
    const a = document.createElement('a');
    a.href = composeCanvas.toDataURL('image/jpeg', 0.95);
    a.download = `insaeng_4cut_${Date.now()}.jpg`;
    a.click();
  });

})();
