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
  const viewportRef = useRef(null);

  // Visual tuning
  const ROW_HEIGHT = 64; // px height of the ticker row (kept constant for crisp fonts)
  const BASE_DURATION = 40; // scroll loop seconds at 1x speed
  const GAP = 32; // px gap between chips

  // Controls
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Ensure at least N items visible in fullscreen
  const TARGET_VISIBLE = 20;
  const [chipWidth, setChipWidth] = useState(null);

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

  // Compute chip width to ensure >= TARGET_VISIBLE items on screen in fullscreen
  useEffect(() => {
    const computeChipWidth = () => {
      if (!viewportRef.current) {
        setChipWidth(null);
        return;
      }
      if (!isFullscreen) {
        setChipWidth(null);
        return;
      }
      const vw = viewportRef.current.clientWidth || window.innerWidth;
      const widthForTarget = (vw - (TARGET_VISIBLE - 1) * GAP) / TARGET_VISIBLE;
      // Keep chips at least wide enough for icon + price + padding (~80-100px), but small to allow 20 on narrow screens
      const minChip = 80; // px
      const maxChip = 320; // safety cap
      setChipWidth(Math.max(minChip, Math.min(maxChip, Math.floor(widthForTarget))));
    };

    computeChipWidth();
    window.addEventListener('resize', computeChipWidth);
    return () => window.removeEventListener('resize', computeChipWidth);
  }, [isFullscreen]);

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
            {/* Speed control (hidden in fullscreen) */}
            <div className="flex items-center gap-2 text-neutral-300">
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
          </div>
          <div className="flex items-center gap-3">
            <div className={'text-xs ' + (isConnected ? 'text-green-500' : 'text-red-500')}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </div>
            <button
              onClick={() => (isFullscreen ? document.exitFullscreen?.() : rootRef.current?.requestFullscreen?.())}
              className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-900"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {isFullscreen ? 'Exit' : 'Full screen'}
            </button>
          </div>
        </div>
      )}

      {/* Centered ticker area */}
      <div className="flex-1 flex items-center justify-center">
        <div
          ref={viewportRef}
          className="relative overflow-hidden select-none w-full"
          style={{ height: ROW_HEIGHT }}
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
              className="animate-led-scroll whitespace-nowrap flex items-stretch"
              style={{
                gap: GAP,
                height: '100%',
                animationDuration: (BASE_DURATION / Math.max(0.01, speedMultiplier)) + 's',
              }}
            >
              {duplicated.map((e, idx) => (
                <TickerChip key={e.id + '-' + idx} entry={e} chipWidth={chipWidth} rowHeight={ROW_HEIGHT} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Local styles for LED look and scroll */}
      <style>{`
        @keyframes led-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-led-scroll {
          /* Duration will be overridden inline based on speedMultiplier */
          animation: led-scroll 40s linear infinite;
          height: 100%;
          will-change: transform; /* smoother animation */
        }
        .led-glow {
          text-shadow: 0 0 6px currentColor, 0 0 12px currentColor, 0 0 18px rgba(255,255,255,0.15);
        }
        .seven-seg {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          letter-spacing: 0.08em;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}

function TickerChip({ entry, chipWidth, rowHeight }) {
  const { name, base, current, diff, color } = entry;
  const isUp = diff > 0;
  const isDown = diff < 0;

  // Typography scales with chip width to prevent overlap
  const cw = chipWidth || 180; // fallback when not fullscreen
  const nameSize = Math.max(10, Math.min(16, Math.round(cw * 0.18)));
  const baseSize = Math.max(9, Math.min(12, Math.round(cw * 0.12)));
  const priceSize = Math.max(12, Math.min(22, Math.round(cw * 0.28)));
  const iconSize = Math.max(12, Math.min(20, Math.round(cw * 0.22)));

  return (
    <div
      className="box-border px-3 bg-[rgb(8,8,8)]/80 flex items-center justify-between gap-3 h-full flex-none"
      style={{ color, width: cw, minWidth: cw }}
    >
      {/* Item details */}
      <div className="flex flex-col justify-center min-w-0">
        <div
          className="font-extrabold leading-tight text-current whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ fontSize: nameSize }}
          title={name}
        >
          {name}
        </div>
        <div className="leading-tight opacity-80 whitespace-nowrap" style={{ fontSize: baseSize }}>
          Base: ₹{Number(base).toFixed(2)}
        </div>
      </div>

      {/* Trend icon then current price, both in the same color */}
      <div className="flex items-center justify-center leading-none flex-shrink-0">
        {isUp ? (
          <TrendingUp size={iconSize} />
        ) : isDown ? (
          <TrendingDown size={iconSize} />
        ) : (
          <Minus size={iconSize} />
        )}
        <div className="seven-seg font-bold ml-2 whitespace-nowrap" style={{ fontSize: priceSize }}>
          ₹{Number(current).toFixed(2)}
        </div>
      </div>

      {/* Divider dot */}
      <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 ml-2 flex-shrink-0" />
    </div>
  );
}

export default TickerBoard;