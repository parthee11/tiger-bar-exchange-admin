import React, { useEffect, useMemo, useRef, useState } from 'react';
import socketService from '../services/socketService';
import branchesApi from '../api/branches';
import api from '../api/api';
import { ArrowUpRight, ArrowDownRight, Minus, Maximize2, Minimize2 } from 'lucide-react';

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
      // msg: { itemId, oldPrice, newPrice, ... }
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

  const tickerEntries = useMemo(() => {
    return items.map((it) => {
      const name = (it?.name || '').toUpperCase();
      const current = typeof it?.currentPrice === 'number' ? it.currentPrice : it?.floorPrice || 0;
      const prev = typeof it?.previousPrice === 'number' ? it.previousPrice : current;
      const diff = +(current - prev).toFixed(2);
      let tone = 'text-white';
      if (diff > 0) tone = 'text-green-400';
      else if (diff < 0) tone = 'text-red-400';
      return {
        id: it._id,
        name,
        current,
        diff,
        tone,
      };
    });
  }, [items]);

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
          <div className="text-sm text-neutral-400">
            Branch: <span className="text-white font-semibold">{selectedBranch?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={"text-xs " + (isConnected ? 'text-green-500' : 'text-red-500')}>
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

      {/* Exit button overlay in fullscreen */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-2 text-xs px-3 py-1 rounded border border-neutral-700 text-neutral-200 bg-neutral-900/70 hover:bg-neutral-900"
          title="Exit fullscreen"
        >
          <Minimize2 size={14} /> Exit
        </button>
      )}

      {/* Centered ticker area */}
      <div className="flex-1 flex items-center justify-center">
        {/* Ticker rail */}
        <div className="relative overflow-hidden select-none" style={{ height: 96, width: '100%' }}>
          <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]" style={{ paddingLeft: '10vw', paddingRight: '10vw' }}>
            <div className="animate-led-scroll whitespace-nowrap flex items-center gap-10 will-change-transform">
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
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-led-scroll {
          animation: led-scroll 40s linear infinite;
        }
        .led-glow {
          text-shadow: 0 0 6px currentColor, 0 0 12px currentColor, 0 0 18px rgba(255,255,255,0.15);
        }
        .seven-seg {
          /* Approximate seven-seg feel using mono + tracking + glow */
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          letter-spacing: 0.08em;
        }
      `}</style>
    </div>
  );
}

function TickerChip({ entry }) {
  const { name, current, diff, tone } = entry;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="px-6 py-4 rounded-md border border-neutral-800 bg-[rgb(8,8,8)]/80 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] flex items-center gap-4">
      {/* Symbol */}
      <div className="text-white font-extrabold text-xl tracking-wide led-glow">
        {name}
      </div>

      {/* Price with up indicator on top, down on bottom (stacked) */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1 seven-seg text-2xl font-bold led-glow">
          <span className={isUp ? 'text-green-400' : 'text-neutral-400'}>
            <ArrowUpRight className="inline -mb-1" size={18} />
          </span>
          <span className={tone}>₹{Number(current).toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1 seven-seg text-base led-glow mt-1">
          <span className={isDown ? 'text-red-400' : 'text-neutral-500'}>
            <ArrowDownRight className="inline -mb-1" size={16} />
          </span>
          <span className={isDown ? 'text-red-400' : isUp ? 'text-green-400' : 'text-white'}>
            {isUp ? `+${Math.abs(diff).toFixed(2)}` : isDown ? `-${Math.abs(diff).toFixed(2)}` : <span className="inline-flex items-center gap-1"><Minus size={14} />0.00</span>}
          </span>
        </div>
      </div>

      {/* Divider dot */}
      <div className="w-2 h-2 rounded-full bg-neutral-700 ml-2" />
    </div>
  );
}

export default TickerBoard;