import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function ScannerView({ onNavigateQueue }) {
  const {
    activeWorkspace,
    activeWorkspaceId,
    addToast,
    addToReviewQueue,
    reviewQueue
  } = useWorkspace();

  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Video & Canvas references
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stream & Upload State
  const [streamActive, setStreamActive] = useState(false);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState(false);
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);

  // Canvas Enhancement Sliders
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // MyInvois QR Scanner Mode
  const [isQrMode, setIsQrMode] = useState(false);
  const [qrDecodedData, setQrDecodedData] = useState(null);

  // Micro-interactions (Haptic & Shutter / Checkmark)
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Draw simulated Malaysian receipt on Canvas
  const drawSimulatedReceiptCanvas = useCallback((ctx, canvas, wsId) => {
    canvas.width = 640;
    canvas.height = 440;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(160, 20);
    ctx.fillStyle = '#faf8f5';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.fillRect(0, 0, 320, 395);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    const storeName = wsId === 'munchieskk' ? 'KIAN SENG WHOLESALE SDN BHD' : 'MR. D.I.Y. TRADING SDN BHD';
    ctx.fillText(storeName, 160, 35);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('NO. 45, JALAN TUARAN, KK, SABAH', 160, 52);
    ctx.fillText('SST REG NO: W10-1808-32000041', 160, 66);
    ctx.fillText('TAX INVOICE / RESIT RASMI', 160, 80);

    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(15, 90);
    ctx.lineTo(305, 90);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '11px monospace';
    ctx.fillStyle = '#1e293b';

    if (wsId === 'munchieskk') {
      ctx.fillText('1. BEEF PATTIES 10KG FROZEN', 20, 115);
      ctx.fillText('RM 280.00', 240, 115);
      ctx.fillText('2. BRIOCHE BUNS (120 PCS)', 20, 135);
      ctx.fillText('RM 114.00', 240, 135);
      ctx.fillText('3. CHEDDAR CHEESE SLICES', 20, 155);
      ctx.fillText('RM 68.50', 240, 155);
      ctx.fillText('4. COOKING OIL 5KG CAN', 20, 175);
      ctx.fillText('RM 24.00', 240, 175);
    } else {
      ctx.fillText('1. PVC PIPE 25MM X 6M', 20, 115);
      ctx.fillText('RM 45.00', 240, 115);
      ctx.fillText('2. WATER TAP CARTRIDGE', 20, 135);
      ctx.fillText('RM 38.00', 240, 135);
      ctx.fillText('3. WATERPROOF SEALANT 500ML', 20, 155);
      ctx.fillText('RM 55.00', 240, 155);
    }

    ctx.beginPath();
    ctx.moveTo(15, 200);
    ctx.lineTo(305, 200);
    ctx.stroke();

    const subtotal = wsId === 'munchieskk' ? 'RM 486.50' : 'RM 138.00';
    ctx.fillText('SUBTOTAL EXCL SST:', 20, 220);
    ctx.fillText(subtotal, 235, 220);

    ctx.font = 'bold 13px monospace';
    ctx.fillText('TOTAL PAYABLE (RM):', 20, 255);
    ctx.fillText(subtotal, 230, 255);

    ctx.setLineDash([]);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DATE: 08/10/2026  14:32:10  POS#03', 160, 295);
    ctx.fillText('LHDN MYINVOIS COMPLIANT • KEEP 7 YEARS', 160, 310);

    for (let i = 40; i < 280; i += 6) {
      ctx.fillStyle = i % 12 === 0 ? '#0f172a' : '#475569';
      ctx.fillRect(i, 330, i % 8 === 0 ? 3 : 1.5, 30);
    }
    ctx.restore();
  }, []);

  // Real-time Canvas Rendering & Enhancement
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply brightness and contrast filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    if (uploadedImageSrc) {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width || 640;
        canvas.height = img.height || 480;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = uploadedImageSrc;
    } else if (streamActive && videoRef.current && !isSimulatedFeed) {
      if (videoRef.current.readyState >= 2) {
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
    } else {
      drawSimulatedReceiptCanvas(ctx, canvas, activeWorkspaceId);
    }
  }, [brightness, contrast, streamActive, isSimulatedFeed, uploadedImageSrc, activeWorkspaceId, drawSimulatedReceiptCanvas]);

  // Camera setup
  useEffect(() => {
    let currentStream = null;
    async function initCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera unsupported');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
          setIsSimulatedFeed(false);
        }
      } catch (err) {
        setIsSimulatedFeed(true);
        setStreamActive(true);
      }
    }
    if (!uploadedImageSrc) {
      initCamera();
    }
    return () => {
      if (currentStream) currentStream.getTracks().forEach((t) => t.stop());
    };
  }, [uploadedImageSrc]);

  // Animation frame loop
  useEffect(() => {
    let animId;
    function loop() {
      renderCanvas();
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  // Handle Gallery/File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageSrc(event.target.result);
      addToast({
        title: 'Receipt Loaded from Files',
        message: `${file.name} ready for thermal enhancement and OCR.`,
        type: 'info',
      });
    };
    reader.readAsDataURL(file);
  };

  // Simulate MyInvois QR Code Scan
  const handleSimulateMyInvoisQr = () => {
    // Decoding valid e-Invoice QR code payload
    const mockMyInvoisPayload = {
      uuid: 'INV-20261008-88329',
      merchant: 'PETRONAS DAGANGAN BERHAD',
      tin: 'C 2549102801',
      date: new Date().toISOString().split('T')[0],
      totalAmount: 95.00,
      sstAmount: 0.00,
      category: 'Vehicle Expense',
      eInvoiceVerified: true,
      qrUrl: 'https://myinvois.hasil.gov.my/verify/INV-20261008-88329'
    };

    setQrDecodedData(mockMyInvoisPayload);

    // Trigger haptic vibration
    if (navigator.vibrate) {
      navigator.vibrate([40, 40, 40]);
    }

    addToast({
      title: 'LHDN MyInvois QR Verified',
      message: 'Verified e-Invoice bypasses OCR. Details auto-populated directly from LHDN.',
      type: 'success',
    });
  };

  /**
   * Finalize Capture & Upload to Supabase Storage
   * Follows LHDN standard naming: YYYY-MM-DD_MerchantName_Category_RM[Amount].jpg
   */
  const handleSnapAndSave = async () => {
    setIsSaving(true);
    setIsShutterActive(true);

    // Tactile haptic vibration
    if (navigator.vibrate) {
      navigator.vibrate([40, 40, 40]);
    }

    setTimeout(() => setIsShutterActive(false), 250);

    // Extract canvas image data
    let imageBlobUrl = '';
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        imageBlobUrl = canvas.toDataURL('image/jpeg', 0.8);
      } catch (e) {
        console.warn('Canvas export error:', e);
      }
    }

    // Determine metadata
    const dateStr = new Date().toISOString().split('T')[0];
    const merchantStr = qrDecodedData ? qrDecodedData.merchant : (activeWorkspaceId === 'munchieskk' ? 'Kian Seng Wholesale' : 'Mr DIY Hardware');
    const categoryStr = qrDecodedData ? qrDecodedData.category : (activeWorkspaceId === 'munchieskk' ? 'Food Inventory' : 'Repairs & Maintenance');
    const amountVal = qrDecodedData ? qrDecodedData.totalAmount : (activeWorkspaceId === 'munchieskk' ? 486.50 : 138.00);

    // Target bucket partitioned by Malaysian Section
    const bucketName = activeWorkspaceId === 'munchieskk' ? 'munchieskk-receipts-4a' : 'rental-receipts-4d';
    // LHDN Standard File Naming Convention
    const sanitizedMerchant = merchantStr.replace(/[^a-zA-Z0-9]/g, '');
    const sanitizedCategory = categoryStr.replace(/[^a-zA-Z0-9]/g, '');
    const lhdnFileName = `${dateStr}_${sanitizedMerchant}_${sanitizedCategory}_RM${amountVal.toFixed(2)}.jpg`;

    // Simulated Supabase Storage path
    const storagePath = `https://supabase.project.storage/${bucketName}/${lhdnFileName}`;

    const receiptItem = {
      id: `rec-${Date.now().toString().slice(-4)}`,
      merchant: merchantStr,
      amount: amountVal,
      date: dateStr,
      category: categoryStr,
      status: 'pending',
      confidence: qrDecodedData ? 100 : 95,
      isMyInvoisVerified: Boolean(qrDecodedData),
      workspaceId: activeWorkspaceId,
      bucket: bucketName,
      storagePath: storagePath,
      fileName: lhdnFileName,
      thumbnail: imageBlobUrl || 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=150&auto=format&fit=crop&q=60',
    };

    addToReviewQueue(receiptItem);

    // Transition smoothly into green checkmark animation for 1.5 seconds
    setIsSaving(false);
    setIsSuccessAnimated(true);

    addToast({
      title: 'Receipt Queued & Stored',
      message: `Saved as ${lhdnFileName} in ${bucketName}.`,
      type: 'success',
      duration: 4000,
    });

    setTimeout(() => {
      setIsSuccessAnimated(false);
      setQrDecodedData(null);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Dual-Mode Receipt Scanner
            </h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWarm ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
              {activeWorkspaceId === 'munchieskk' ? 'Bucket: 4a' : 'Bucket: 4d'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Live camera capture or WhatsApp file upload with real-time thermal enhancement.</p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateQueue && (
            <button
              type="button"
              onClick={onNavigateQueue}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center gap-1.5"
            >
              <span>Review Queue</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] text-white font-bold ${isWarm ? 'bg-orange-500' : 'bg-blue-600'}`}>
                {reviewQueue.filter((r) => r.workspaceId === activeWorkspaceId).length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsQrMode(!isQrMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isQrMode ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>{isQrMode ? 'MyInvois Active' : 'Scan LHDN QR'}</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        
        {/* Viewfinder Canvas */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 sm:aspect-16/10 flex items-center justify-center border border-slate-800">
          <video ref={videoRef} playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="w-full h-full object-contain" />

          {/* Viewfinder Alignment Box */}
          <div className="absolute inset-5 sm:inset-10 border-2 border-dashed border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-black/60 text-white/90 px-2 py-0.5 rounded font-mono">
                {isQrMode ? 'LHDN MYINVOIS QR DETECTOR' : 'SST / LHDN RECEIPT ALIGN'}
              </span>
              <span className="text-[10px] bg-black/60 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                AUTO-CROP
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded">
              <span>RM / MYR ENGINE</span>
              <span>{activeWorkspace.regime}</span>
            </div>
          </div>

          {/* Camera Shutter Flash */}
          {isShutterActive && <div className="absolute inset-0 bg-white z-30 animate-shutter pointer-events-none" />}

          {/* Success Checkmark Animation */}
          {isSuccessAnimated && (
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-emerald-300">
                ✓
              </div>
              <h4 className="text-sm font-bold">Receipt Processed & Saved!</h4>
              <p className="text-[11px] text-emerald-200 font-mono">Stored to {activeWorkspaceId === 'munchieskk' ? 'munchieskk-receipts-4a' : 'rental-receipts-4d'}</p>
            </div>
          )}

          {/* MyInvois QR Decode Overlay */}
          {isQrMode && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-20 p-5 flex flex-col items-center justify-center text-center">
              <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative flex items-center justify-center mb-3">
                <div className="w-full h-0.5 bg-emerald-400 absolute animate-bounce" />
                <span className="text-xs font-mono text-emerald-300">Point at MyInvois QR</span>
              </div>
              <button
                type="button"
                onClick={handleSimulateMyInvoisQr}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg"
              >
                Simulate Decode Valid e-Invoice QR
              </button>
            </div>
          )}
        </div>

        {/* QR Decoded Info Banner */}
        {qrDecodedData && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
            <div>
              <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                e-Invoice #{qrDecodedData.uuid} Verified
              </span>
              <span className="text-emerald-700 text-[11px]">
                {qrDecodedData.merchant} • RM {qrDecodedData.totalAmount.toFixed(2)} • TIN: {qrDecodedData.tin}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px] font-bold">
              Bypassed OCR
            </span>
          </div>
        )}

        {/* Real-time Canvas Thermal Enhancement Sliders */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Thermal Receipt Pre-Processing (Canvas API)</span>
            <button
              type="button"
              onClick={() => { setBrightness(100); setContrast(100); }}
              className="text-slate-500 underline text-[11px]"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <label htmlFor="scan-brightness">Brightness</label>
                <span className="font-mono text-slate-800">{brightness}%</span>
              </div>
              <input
                id="scan-brightness"
                type="range"
                min="50"
                max="160"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg accent-orange-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <label htmlFor="scan-contrast">Contrast (Faded Ink Recovery)</label>
                <span className="font-mono text-slate-800">{contrast}%</span>
              </div>
              <input
                id="scan-contrast"
                type="range"
                min="60"
                max="220"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg accent-orange-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons: Snap & Save + Gallery File Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Primary Snap & Save Button */}
          <button
            id="snap-save-btn"
            type="button"
            disabled={isSaving}
            onClick={handleSnapAndSave}
            className={`py-3.5 px-5 rounded-2xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-transform active:scale-95 ${
              isWarm
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
                : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700'
            }`}
          >
            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span>Snap & Save (LHDN Bucket)</span>
          </button>

          {/* Upload from Gallery / WhatsApp Receipt Picker */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Upload Gallery / WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Storage Naming Convention Note */}
        <p className="text-[11px] text-center text-slate-400 pt-1 font-mono">
          Auto-saves to: {activeWorkspaceId === 'munchieskk' ? 'munchieskk-receipts-4a' : 'rental-receipts-4d'}/YYYY-MM-DD_Merchant_Category_RM[Amount].jpg
        </p>
      </div>
    </div>
  );
}
