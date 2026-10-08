import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function ScannerView({ onOpenExpenseWithPrefill }) {
  const {
    activeWorkspace,
    activeWorkspaceId,
    addToast,
    reviewQueue,
    addToReviewQueue,
    removeFromReviewQueue
  } = useWorkspace();

  const isWarm = activeWorkspace.theme.palette === 'warm';

  // Video & Canvas references
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Camera state
  const [streamActive, setStreamActive] = useState(false);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState(false);
  const [isShutterActive, setIsShutterActive] = useState(false);

  // Image Enhancement Sliders (Brightness & Contrast)
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Review Queue drawer state
  const [isQueueOpen, setIsQueueOpen] = useState(true);

  // Helper function to render an authentic Malaysian receipt template onto the canvas
  const drawSimulatedReceiptCanvas = useCallback((ctx, canvas, b, c, wsId) => {
    canvas.width = 640;
    canvas.height = 440;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(160, 20);

    ctx.fillStyle = '#faf8f5';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 15;
    ctx.fillRect(0, 0, 320, 395);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    const storeName = wsId === 'munchieskk'
      ? 'KIAN SENG WHOLESALE SDN BHD'
      : 'MR. D.I.Y. TRADING SDN BHD';
    ctx.fillText(storeName, 160, 35);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('NO. 45, JALAN TUARAN, 88400 KK, SABAH', 160, 52);
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

    ctx.fillText('SUBTOTAL EXCL SST:', 20, 220);
    const subtotal = wsId === 'munchieskk' ? 'RM 486.50' : 'RM 138.00';
    ctx.fillText(subtotal, 235, 220);

    ctx.fillText('SST (0% EXEMPT GOODS):', 20, 240);
    ctx.fillText('RM 0.00', 240, 240);

    ctx.font = 'bold 13px monospace';
    ctx.fillText('TOTAL PAYABLE (RM):', 20, 265);
    ctx.fillText(subtotal, 230, 265);

    ctx.setLineDash([]);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DATE: 08/10/2026  14:32:10  POS#03', 160, 305);
    ctx.fillText('TERIMA KASIH • PLEASE KEEP FOR LHDN AUDIT', 160, 320);

    for (let i = 40; i < 280; i += 6) {
      ctx.fillStyle = i % 12 === 0 ? '#0f172a' : '#475569';
      ctx.fillRect(i, 340, i % 8 === 0 ? 3 : 1.5, 30);
    }

    ctx.restore();
  }, []);

  /**
   * Real-time Canvas Image Enhancement
   */
  const handleImageEnhance = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    if (streamActive && videoRef.current && !isSimulatedFeed) {
      if (videoRef.current.readyState >= 2) {
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
    } else {
      drawSimulatedReceiptCanvas(ctx, canvas, brightness, contrast, activeWorkspaceId);
    }
  }, [brightness, contrast, streamActive, isSimulatedFeed, activeWorkspaceId, drawSimulatedReceiptCanvas]);

  // Setup camera stream with fallback
  useEffect(() => {
    let currentStream = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Webcam not supported');
        }
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
        console.info('Switching to simulated sample receipt feed:', err);
        setIsSimulatedFeed(true);
        setStreamActive(true);
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Continuous animation loop for canvas rendering
  useEffect(() => {
    let animId;
    function renderLoop() {
      handleImageEnhance();
      animId = requestAnimationFrame(renderLoop);
    }
    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [handleImageEnhance]);

  /**
   * Primary Action: Snap & Save
   */
  const handleSnapAndSave = () => {
    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 250);

    let capturedThumbnail = '';
    if (canvasRef.current) {
      try {
        capturedThumbnail = canvasRef.current.toDataURL('image/jpeg', 0.6);
      } catch (e) {
        console.warn('Canvas export fallback:', e);
      }
    }

    const newReceiptId = `rec-${Date.now().toString().slice(-4)}`;
    const mockReceipt = {
      id: newReceiptId,
      merchant: activeWorkspaceId === 'munchieskk' ? 'Kian Seng Wholesale Sdn Bhd' : 'MR. D.I.Y. Hardware KK',
      amount: activeWorkspaceId === 'munchieskk' ? 486.50 : 138.00,
      date: new Date().toISOString().split('T')[0],
      category: activeWorkspaceId === 'munchieskk' ? 'Food Inventory' : 'Property Maintenance & Repairs',
      status: 'pending',
      confidence: 94,
      workspaceId: activeWorkspaceId,
      itemsCount: activeWorkspaceId === 'munchieskk' ? 4 : 3,
      brightnessUsed: brightness,
      contrastUsed: contrast,
      thumbnail: capturedThumbnail || 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=150&auto=format&fit=crop&q=60',
    };

    addToReviewQueue(mockReceipt);

    addToast({
      title: 'Receipt Captured',
      message: 'Receipt queued for background OCR processing.',
      type: 'success',
      duration: 4500,
    });
  };

  const entityPendingReceipts = reviewQueue.filter(
    (item) => item.workspaceId === activeWorkspaceId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Asynchronous Receipt Scanner
            </h2>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isWarm ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              OCR Pipeline Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Capture Malaysian tax receipts instantly. Processing runs asynchronously in the background.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            isQueueOpen
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Review Queue</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              entityPendingReceipts.length > 0
                ? isWarm
                  ? 'bg-orange-500 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {entityPendingReceipts.length}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 overflow-hidden">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 sm:aspect-16/10 flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                playsInline
                muted
                className="hidden"
              />

              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />

              <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-white rounded-tl" />
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-white/90 font-mono tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ALIGN RECEIPT (SST / LHDN)
                  </div>
                  <div className="w-6 h-6 border-t-2 border-r-2 border-white rounded-tr" />
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-white rounded-bl" />
                  <span className="text-[10px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded">
                    RM / MYR AUTO-DETECT
                  </span>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-white rounded-br" />
                </div>
              </div>

              {isShutterActive && (
                <div className="absolute inset-0 bg-white z-30 animate-shutter pointer-events-none" />
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${isSimulatedFeed ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  {isSimulatedFeed ? 'Sample Receipt Mode' : 'Live Camera Active'}
                </span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimulatedFeed(!isSimulatedFeed)}
                  className="bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20 transition-colors"
                >
                  {isSimulatedFeed ? 'Switch to Webcam' : 'Switch Sample'}
                </button>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Real-time Image Pre-Processing (Canvas API)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="brightness-slider" className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Brightness
                    </label>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{brightness}%</span>
                  </div>
                  <input
                    id="brightness-slider"
                    type="range"
                    min="50"
                    max="160"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 ${
                      !isWarm && 'accent-blue-600'
                    }`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>50%</span>
                    <span>100% (Normal)</span>
                    <span>160%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="contrast-slider" className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Contrast (Thermal Paper Text)
                    </label>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{contrast}%</span>
                  </div>
                  <input
                    id="contrast-slider"
                    type="range"
                    min="60"
                    max="220"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 ${
                      !isWarm && 'accent-blue-600'
                    }`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Low</span>
                    <span>100%</span>
                    <span>High (Faded Ink)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                id="snap-and-save-button"
                type="button"
                onClick={handleSnapAndSave}
                className={`flex-1 py-3.5 px-6 rounded-2xl text-white font-bold text-base shadow-md flex items-center justify-center gap-3 transition-all transform active:scale-98 ${
                  isWarm
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-blue-500/30'
                }`}
              >
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
                <span>Snap & Save</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              Instant non-blocking capture. The OCR worker extracts SST, Merchant, and Totals in the background.
            </p>
          </div>
        </div>

        {isQueueOpen && (
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Review Queue</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${
                    isWarm ? 'bg-orange-500' : 'bg-blue-600'
                  }`}
                >
                  {entityPendingReceipts.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Needs Confirmation</span>
            </div>

            {entityPendingReceipts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  ✓
                </div>
                <h4 className="text-sm font-semibold text-slate-700">Queue is Clear!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  All snapped receipts have been confirmed and posted to the Malaysian tax ledger.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {entityPendingReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-200 relative">
                        <img
                          src={receipt.thumbnail}
                          alt="Receipt thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 bg-slate-950/80 text-[9px] text-white px-1 font-mono">
                          OCR {receipt.confidence}%
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {receipt.merchant}
                          </h4>
                          <span className="text-xs font-black text-slate-900 font-mono">
                            RM {receipt.amount.toFixed(2)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>{receipt.date}</span>
                          <span>•</span>
                          <span className="truncate">{receipt.category}</span>
                        </p>

                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Auto-Extracted
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          removeFromReviewQueue(receipt.id);
                          addToast({
                            title: 'Receipt Confirmed & Logged',
                            message: `Added RM ${receipt.amount.toFixed(2)} from ${receipt.merchant} to tax ledger.`,
                            type: 'success',
                          });
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white transition-colors ${
                          isWarm ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        Confirm Data
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenExpenseWithPrefill) {
                            onOpenExpenseWithPrefill(receipt);
                          }
                        }}
                        className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
