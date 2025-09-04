import React, { useEffect, useMemo, useRef, useState } from 'react';
import socketService from '../services/socketService';
import branchesApi from '../api/branches';
import api from '../api/api';
import { TrendingUp, TrendingDown, Minus, Maximize2, Minimize2 } from 'lucide-react';

/**
 * LED-style stock ticker board for drink prices
 * - Black background, neon glow text
 * - Horizontally scrolling items
 * - Real-time price updates via socket price_update
 * - Fullscreen toggle; ticker centered vertically
 */
export function TickerBoard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [items, setItems] = useState([]);

  const connectionCheckInterval = useRef(null);
  const rootRef = useRef(null);

  // LED panel dimensions (virtual canvas)
  const BASE_PANEL_WIDTH = 14340;
  const PANEL_WIDTH = BASE_PANEL_WIDTH * 6; // Increased width by 6x as requested
  const PANEL_HEIGHT = 96;
  const WIDTH_SCALE = PANEL_WIDTH / BASE_PANEL_WIDTH; // 6x width scale

  // Scroll animation base duration (seconds) and user speed control
  const BASE_DURATION = 40; // seconds for one loop at 1x
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  // Connect socket and pick an active branch
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        const connected = await socketService.connect();
        if (!mounted) return;
        setIsConnected(!!connected);
        const { data: branches } = await branchesApi.getBranches();
        const activeBranch = branches.find((b) => b.isActive);
        if (!activeBranch) {
          setError('No active branches found');
          return;
        }
        setSelectedBranch(activeBranch);
        socketService.subscribeToBranch(activeBranch._id);
      } catch (e) {
        console.error(e);
        setError('Failed to initialize real-time connection');
      } finally {
        setLoading(false);
      }
    };
    init();

    connectionCheckInterval.current = setInterval(() => {
      setIsConnected(socketService.isSocketConnected());
    }, 5000);

    const handleFsChange = () => {
      const fs = !!document.fullscreenElement || !!document.webkitFullscreenElement;
      setIsFullscreen(fs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);

    return () => {
      mounted = false;
      socketService.disconnect();
      if (connectionCheckInterval.current) clearInterval(connectionCheckInterval.current);
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Fetch all drinks for branch with price info
  useEffect(() => {
    if (!selectedBranch) return;
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data } = await api.items.getItems({
          branch: selectedBranch._id,
          type: 'drinks',
          includePrices: true,
          noLimit: true,
        });
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load items', e);
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedBranch]);

  // Live price updates
  useEffect(() => {
    if (!isConnected || !selectedBranch) return;
    const handlePriceUpdate = (msg) => {
      setItems((prev) => prev.map((it) => (
        it._id === msg.itemId
          ? {
              ...it,
              previousPrice: msg.oldPrice,
              currentPrice: msg.newPrice,
            }
          : it
      )));
    };

    const remove = socketService.onPriceUpdate(handlePriceUpdate);
    return () => remove && remove();
  }, [isConnected, selectedBranch]);

  const tickerEntries = useMemo(
    () =>
      items.map((it) => {
        const name = (it?.name || '').toUpperCase();
        const base = typeof it?.floorPrice === 'number' ? it.floorPrice : 0; // Base (stock) price
        const current = typeof it?.currentPrice === 'number' ? it.currentPrice : base; // Fallback to base
        const diff = +(current - base).toFixed(2); // Compare against base price

        // TV screen color palette
        const upColor = '#4CD964';
        const downColor = '#FF3B30';
        const neutralColor = '#FFFFFF';
        let color = neutralColor;
        if (diff > 0) color = upColor;
        else if (diff < 0) color = downColor;

        return {
          id: it._id,
          name,
          base,
          current,
          diff,
          color,
        };
      }),
    [items]
  );

  // Duplicate content to make seamless scroll
  const duplicated = useMemo(() => tickerEntries.concat(tickerEntries), [tickerEntries]);

  const enterFullscreen = async () => {
    const el = rootRef.current || document.documentElement;
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };
  const exitFullscreen = async () => {
    if (document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  };
  const toggleFullscreen = () => {
    if (isFullscreen) exitFullscreen();
    else enterFullscreen();
  };

  if (loading) {
    return (
      <div className="p-6 h-full w-full flex items-center justify-center bg-black">
        <div className="text-gray-300">Loading ticker…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full w-full flex items-center justify-center bg-black">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="h-screen w-full bg-black flex flex-col">
      {/* Status bar (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
          <div className="flex items-center gap-6">
            <div className="text-sm text-neutral-400">
              Branch: <span className="text-white font-semibold">{selectedBranch?.name}</span>
            </div>
            {/* Speed & Scale controls (hidden in fullscreen) */}
            <div className="flex items-center gap-6 text-neutral-300">
              {/* Speed */}
              <div className="flex items-center gap-2">
                <label htmlFor="speedRange" className="text-xs">Speed</label>
                <input
                  id="speedRange"
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.25"
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                  className="w-40 accent-green-500"
                  title={`Speed: ${speedMultiplier.toFixed(2)}x`}
                />
                <span className="text-xs tabular-nums">{speedMultiplier.toFixed(2)}x</span>
              </div>

              {/* Scale */}
              <div className="flex items-center gap-2">
                <label htmlFor="scaleRange" className="text-xs">Scale</label>
                <input
                  id="scaleRange"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scaleMultiplier}
                  onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
                  className="w-40 accent-blue-500"
                  title={`Scale: ${scaleMultiplier.toFixed(1)}x`}
                />
                <span className="text-xs tabular-nums">{scaleMultiplier.toFixed(1)}x</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={'text-xs ' + (isConnected ? 'text-green-500' : 'text-red-500')}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </div>
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-900"
              title="Enter fullscreen"
            >
              <Maximize2 size={14} /> Full screen
            </button>
          </div>
        </div>
      )}

      {/* Centered ticker area with virtual panel */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="relative overflow-hidden select-none"
          style={{
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            // No auto-scale in fullscreen; disable all transforms when fullscreen
            transform: (() => {
              if (isFullscreen) return 'none';
              if (scaleMultiplier !== 1) return 'scale(' + scaleMultiplier + ')';
              return 'none';
            })(),
            transformOrigin: 'center',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              // Soft side fade for LED look; keep full content visible
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
              maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)'
            }}
          >
            <div
              className="animate-led-scroll whitespace-nowrap flex items-center"
              style={{
                gap: 20,
                height: '100%',
                // Keep visual speed consistent even when panel width changes
                // Effective duration scales with width so the pixels/second stays the same
                animationDuration: ((BASE_DURATION * WIDTH_SCALE) / Math.max(0.01, speedMultiplier)) + 's',
              }}
            >
              {duplicated.map((e, idx) => (
                <TickerChip key={e.id + '-' + idx} entry={e} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Local styles for LED look and scroll */}
      <style>{`
        @keyframes led-scroll {
          0% { transform: translateX(0) scale(0.15); }
          100% { transform: translateX(-50%) scale(0.15); }
        }
        .animate-led-scroll {
          /* Duration will be overridden inline based on speedMultiplier */
          animation: led-scroll 40s linear infinite;
          height: 100%;
        }
        .led-glow {
          text-shadow: 0 0 6px currentColor, 0 0 12px currentColor, 0 0 18px rgba(255,255,255,0.15);
        }
        .seven-seg {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          letter-spacing: 0.08em;
        }
      `}</style>
    </div>
  );
}

function TickerChip({ entry }) {
  const { name, base, current, diff, color } = entry;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="px-4 py-1.5 bg-[rgb(8,8,8)]/80 flex items-center justify-between gap-4 h-full" style={{ color }}>
      {/* Item details */}
      <div className="flex flex-col justify-center">
        <div className="font-extrabold text-sm tracking-wide leading-none text-current">{name}</div>
        <div className="text-xs leading-none mt-1 opacity-80">Base: ₹{Number(base).toFixed(2)}</div>
      </div>

      {/* Trend icon then current price, both in the same color */}
      <div className="flex items-center justify-center leading-none">
        {isUp ? (
          <TrendingUp size={18} />
        ) : isDown ? (
          <TrendingDown size={18} />
        ) : (
          <Minus size={18} />
        )}
        <div className="seven-seg text-lg font-bold ml-2">₹{Number(current).toFixed(2)}</div>
      </div>

      {/* Divider dot */}
      <div className="w-1 h-1 rounded-full bg-neutral-700 ml-2" />
    </div>
  );
}

export default TickerBoard;