/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import socketService from '../services/socketService';
import branchesApi from '../api/branches';
import api from '../api/api';
import { formatCurrency } from '../utils/formatters';
import tigerWhiteLogo from '../assets/images/TIGER LOGO - WHITE.png';
import tigerDarkLogo from '../assets/images/TIGER LOGO - DARK.png';
import tvScreenBackdrop from '../assets/images/tv-screen-backdrop.png';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * TV Screen component that displays drinks grouped by category for the selected branch
 * with real-time pricing updates
 *
 * @returns {JSX.Element} TV Screen component
 */
export function TVScreen() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [marketCrashActive, setMarketCrashActive] = useState(false);
  const [latestPriceUpdates, setLatestPriceUpdates] = useState(new Map());
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  // Always dark mode, no toggle needed
  const darkMode = true;
  const [blinkingItems, setBlinkingItems] = useState(new Set());

  // Ref for the interval that checks connection status
  const connectionCheckInterval = useRef(null);
  // Ref for the interval that refreshes data
  const dataRefreshInterval = useRef(null);
  // Ref to store the current branch ID to avoid unnecessary refreshes
  const currentBranchIdRef = useRef(null);
  // Ref to track if initial data has been loaded
  const initialDataLoadedRef = useRef(false);
  // Ref for the auto-scroll interval
  const autoScrollInterval = useRef(null);
  // Ref for the blinking effect interval
  const blinkingInterval = useRef(null);
  // Ref for the main container element
  const containerRef = useRef(null);

  // Group items by category
  const groupItemsByCategory = useCallback((items, categoryList) => {
    const grouped = [];

    // Create a section for each category
    categoryList.forEach((category) => {
      const categoryItems = items.filter(
        (item) => item.category._id === category._id,
      );
      if (categoryItems.length > 0) {
        grouped.push({
          title: category.name,
          categoryId: category._id,
          data: categoryItems,
        });
      }
    });

    return grouped;
  }, []);

  // Fetch categories and items
  const fetchCategoriesAndItems = useCallback(async () => {
    if (!selectedBranch) return;

    // Only set loading to true on initial load
    if (!initialDataLoadedRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch drink categories
      const { data: categoriesData } = await api.categories.getCategories({
        type: 'drinks',
      });

      // Fetch ALL drink items for the selected branch with price information
      const { data: itemsData } = await api.items.getItems({
        branch: selectedBranch._id,
        type: 'drinks',
        includePrices: true, // Include current and previous prices for trend display
        noLimit: true, // Get all items without pagination for TV screen
      });

      // Update state in a batch to reduce renders
      setCategories(categoriesData);
      setAllItems(itemsData || []);

      // Mark initial data as loaded
      initialDataLoadedRef.current = true;
    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError('Failed to load menu data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  // Refresh data for the selected branch
  const refreshData = useCallback(async (branchId) => {
    // Skip if the branch ID is the same as the last refresh
    if (
      branchId === currentBranchIdRef.current &&
      initialDataLoadedRef.current
    ) {
      return;
    }

    currentBranchIdRef.current = branchId;

    try {
      // Refresh branch data to get latest market crash status
      const { data: branch } = await branchesApi.getBranch(branchId);
      if (branch) {
        setSelectedBranch((prevBranch) => {
          // Only update if the branch has changed or market crash status changed
          if (
            !prevBranch ||
            prevBranch._id !== branch._id ||
            prevBranch.marketCrashActive !== branch.marketCrashActive
          ) {
            return branch;
          }
          return prevBranch;
        });

        setMarketCrashActive(branch.marketCrashActive || false);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, []);

  // Always use dark mode
  useEffect(() => {
    // Apply dark mode class to body for global styling
    document.body.classList.add('dark-mode');
  }, []);

  // Connect to socket and initialize data - only run once
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Connect to socket
        const connected = await socketService.connect();
        setIsConnected(connected);

        if (connected) {
          console.log('TV Screen: Socket connected successfully');

          // Get the first active branch
          const { data: branches } = await branchesApi.getBranches();
          const activeBranch = branches.find((branch) => branch.isActive);

          if (activeBranch) {
            setSelectedBranch(activeBranch);
            setMarketCrashActive(activeBranch.marketCrashActive || false);
            currentBranchIdRef.current = activeBranch._id;

            // Subscribe to branch events
            socketService.subscribeToBranch(activeBranch._id);
          } else {
            setError('No active branches found');
          }
        } else {
          setError('Failed to connect to real-time service');
        }
      } catch (err) {
        console.error('Error initializing socket:', err);
        setError('Failed to initialize real-time connection');
      } finally {
        setLoading(false);
      }
    };

    initializeSocket();

    // Set up connection status check interval
    connectionCheckInterval.current = setInterval(() => {
      const connected = socketService.isSocketConnected();
      setIsConnected(connected);
    }, 5000);

    // Set up data refresh interval (every 5 minutes)
    dataRefreshInterval.current = setInterval(() => {
      if (currentBranchIdRef.current) {
        refreshData(currentBranchIdRef.current);
      }
    }, 5 * 60 * 1000);

    // Clean up on unmount
    return () => {
      socketService.disconnect();
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
      if (dataRefreshInterval.current) {
        clearInterval(dataRefreshInterval.current);
      }
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
      if (blinkingInterval.current) {
        clearInterval(blinkingInterval.current);
      }
    };
  }, []); // Empty dependency array - only run once

  // Fetch categories and items when branch changes
  useEffect(() => {
    if (selectedBranch) {
      fetchCategoriesAndItems();
    }
  }, [selectedBranch, fetchCategoriesAndItems]);

  // Set up socket event listeners
  useEffect(() => {
    if (!isConnected || !selectedBranch) return;

    // Handle price updates
    const handlePriceUpdate = (data) => {
      console.log(
        `TV Screen: Received price update for ${data.name}: ${data.oldPrice} -> ${data.newPrice}`,
        data,
      );

      // Update the item in our state
      setAllItems((prevItems) => {
        const updatedItems = prevItems.map((item) => {
          if (item._id === data.itemId) {
            // Update the item with new price data
            console.log(`Updating item ${item.name} with new price data:`, {
              oldPrice: data.oldPrice,
              newPrice: data.newPrice,
              highestDailyPrice: data.highestDailyPrice,
              lowestDailyPrice: data.lowestDailyPrice,
            });

            return {
              ...item,
              previousPrice: data.oldPrice,
              currentPrice: data.newPrice,
              highestDailyPrice: data.highestDailyPrice,
              lowestDailyPrice: data.lowestDailyPrice,
            };
          }
          return item;
        });

        // Log the first updated item for debugging
        if (updatedItems.length > 0) {
          console.log('Sample updated item:', {
            name: updatedItems[0].name,
            currentPrice: updatedItems[0].currentPrice,
            previousPrice: updatedItems[0].previousPrice,
            floorPrice: updatedItems[0].floorPrice,
            highestDailyPrice: updatedItems[0].highestDailyPrice,
            lowestDailyPrice: updatedItems[0].lowestDailyPrice,
          });
        }

        return updatedItems;
      });

      // Store the latest price update
      setLatestPriceUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.itemId, data);
        // Remove old updates after 5 seconds
        setTimeout(() => {
          setLatestPriceUpdates((current) => {
            const updatedMap = new Map(current);
            if (updatedMap.has(data.itemId)) {
              updatedMap.delete(data.itemId);
            }
            return updatedMap;
          });
        }, 5000);
        return newMap;
      });
    };

    // Handle market crash events
    const handleMarketCrash = (data) => {
      console.log(
        `TV Screen: Market crash event received for branch: ${data.branchId}`,
      );
      if (data.branchId === selectedBranch._id) {
        setMarketCrashActive(true);
        // We don't need to call refreshData here, as the price updates will come through socket
      }
    };

    // Handle market crash end events
    const handleMarketCrashEnd = (data) => {
      console.log(
        `TV Screen: Market crash end event received for branch: ${data.branchId}`,
      );
      if (data.branchId === selectedBranch._id) {
        setMarketCrashActive(false);
        // We don't need to call refreshData here, as the price updates will come through socket
      }
    };

    // Register event handlers and store cleanup functions
    const removePriceUpdateListener =
      socketService.onPriceUpdate(handlePriceUpdate);
    const removeMarketCrashListener =
      socketService.onMarketCrash(handleMarketCrash);
    const removeMarketCrashEndListener =
      socketService.onMarketCrashEnd(handleMarketCrashEnd);

    // Clean up event handlers
    return () => {
      removePriceUpdateListener();
      removeMarketCrashListener();
      removeMarketCrashEndListener();
    };
  }, [isConnected, selectedBranch]); // Removed refreshData dependency

  // Group items by category whenever allItems or categories change
  useEffect(() => {
    if (allItems.length > 0 && categories.length > 0) {
      const grouped = groupItemsByCategory(allItems, categories);
      setGroupedItems(grouped);
    }
  }, [allItems, categories, groupItemsByCategory]);

  // Set up blinking effect for items with trends
  useEffect(() => {
    // Function to select items with trends to blink
    const updateBlinkingItems = () => {
      // Get all items with high or low trends (not neutral)
      const itemsWithTrends = allItems.filter((item) => {
        const trend = getTrendInfo(item);
        return trend.icon !== 'remove';
      });

      // If no items with trends, clear blinking items
      if (itemsWithTrends.length === 0) {
        setBlinkingItems(new Set());
        return;
      }

      const selectedItems = new Set();
      
      // If there are many trending items (>20), use a different strategy
      if (itemsWithTrends.length > 20) {
        // Group items by category for more organized blinking
        const itemsByCategory = {};
        
        // Group items by their category
        itemsWithTrends.forEach(item => {
          const categoryId = item.category._id;
          if (!itemsByCategory[categoryId]) {
            itemsByCategory[categoryId] = [];
          }
          itemsByCategory[categoryId].push(item);
        });
        
        // For each category, select a percentage of items to blink
        Object.values(itemsByCategory).forEach(categoryItems => {
          // Select ~75% of items in each category, but at least 3 if available
          const numToSelect = Math.max(3, Math.ceil(categoryItems.length * 0.75));
          
          // Shuffle the items in this category
          const shuffled = [...categoryItems].sort(() => 0.5 - Math.random());
          
          // Select the items
          for (let i = 0; i < numToSelect && i < shuffled.length; i++) {
            selectedItems.add(shuffled[i]._id);
          }
        });
        
        // Ensure we have at least some minimum number of blinking items
        if (selectedItems.size < 15 && itemsWithTrends.length >= 15) {
          const shuffled = [...itemsWithTrends].sort(() => 0.5 - Math.random());
          for (let i = 0; i < 15 && i < shuffled.length; i++) {
            selectedItems.add(shuffled[i]._id);
          }
        }
      } else {
        // For fewer items, select ~75% of them to blink
        const maxItems = Math.ceil(itemsWithTrends.length * 0.75);
        const shuffled = [...itemsWithTrends].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < maxItems; i++) {
          if (i < shuffled.length) {
            selectedItems.add(shuffled[i]._id);
          }
        }
      }

      // Update state with the new set of blinking items
      setBlinkingItems(selectedItems);
    };

    // Only start the interval if we have items and the component is mounted
    if (allItems.length > 0 && !loading) {
      // Clear any existing interval
      if (blinkingInterval.current) {
        clearInterval(blinkingInterval.current);
      }

      // Initial update
      updateBlinkingItems();

      // Set up interval to update blinking items every 1 second (faster for more dynamic effect)
      blinkingInterval.current = setInterval(updateBlinkingItems, 1000);
    }

    // Clean up on unmount or when dependencies change
    return () => {
      if (blinkingInterval.current) {
        clearInterval(blinkingInterval.current);
        blinkingInterval.current = null;
      }
    };
  }, [allItems, loading]);

  // Set up auto-scrolling
  useEffect(() => {
    // Only start auto-scrolling when data is loaded and not in loading/error state
    // and when auto-scroll is not paused
    if (loading || error || !initialDataLoadedRef.current || autoScrollPaused) {
      // Clear any existing interval if we're pausing
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      return;
    }

    // Clear any existing interval before setting a new one
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }

    // Function to handle auto-scrolling
    const handleAutoScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Calculate the maximum scroll position
      const maxScroll = scrollHeight - clientHeight;

      // If we're at or very near the bottom, pause auto-scroll and reset to top
      if (scrollTop >= maxScroll - 5) {
        // Temporarily pause auto-scroll
        if (autoScrollInterval.current) {
          clearInterval(autoScrollInterval.current);
          autoScrollInterval.current = null;
        }

        // Scroll to top with smooth behavior
        container.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

        // Wait for the scroll to complete, then restart auto-scroll
        setTimeout(() => {
          if (containerRef.current && !autoScrollPaused) {
            // Restart auto-scroll interval
            autoScrollInterval.current = setInterval(handleAutoScroll, 100);
          }
        }, 1000); // Wait 1 second after scrolling to top
      } else {
        // Otherwise, scroll down by a small amount
        // Use a slightly faster scroll speed to compensate for sticky headers
        container.scrollBy({
          top: 3, // Increased value to ensure smooth scrolling past sticky headers
          behavior: 'smooth',
        });
      }
    };

    // Set up the interval for auto-scrolling (every 100ms)
    autoScrollInterval.current = setInterval(handleAutoScroll, 100);

    // Clean up on unmount
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [loading, error, groupedItems, autoScrollPaused]);

  // Get trend icon and color based on price comparison with stock price (floor price)
  const getTrendInfo = (item) => {
    // If price data is not available, show neutral trend
    if (!item.currentPrice || !item.floorPrice) {
      return { 
        icon: "remove", 
        color: "#888888" 
      };
    }

    // If current price equals stock price (floor price), show neutral trend
    if (item.currentPrice === item.floorPrice) {
      return { 
        icon: "remove", 
        color: "#888888" // Gray for neutral trend
      };
    }

    // Compare current price with stock price (floor price)
    // Green if current price is higher than stock price (price is above base)
    // Red if current price is lower than stock price (price is below base)
    if (item.currentPrice > item.floorPrice) {
      return { 
        icon: "trending-up", 
        color: "#4CD964" // Green for up trend (price above stock price)
      };
    } else if (item.currentPrice < item.floorPrice) {
      return { 
        icon: "trending-down", 
        color: "#FF3B30" // Red for down trend (price below stock price)
      };
    } else {
      return { 
        icon: "remove", 
        color: "#888888" // Gray for no change
      };
    }
  };

  // Format price with currency symbol
  const formatPrice = (price) => {
    if (price === undefined || isNaN(price)) {
      return 'N/A';
    }
    return formatCurrency(price);
  };

  // Get the highest daily price for an item, falling back to floor price if undefined
  const getHighestDailyPrice = (item) =>
    item.highestDailyPrice || item.floorPrice;

  // Get the lowest daily price for an item, falling back to floor price if undefined or <= 0
  const getLowestDailyPrice = (item) => {
    // If lowestDailyPrice is 0 or negative or undefined, use floorPrice
    if (!item.lowestDailyPrice || item.lowestDailyPrice <= 0) {
      return item.floorPrice;
    }

    // Return the lowest daily price even if it's less than the floor price
    // This allows showing the true lowest price reached during the day
    return item.lowestDailyPrice;
  };

  // Get the current price for an item, falling back to floor price
  const getCurrentPrice = (item) => {
    // Ensure we have a valid number
    if (typeof item.currentPrice === 'number' && !isNaN(item.currentPrice)) {
      return item.currentPrice;
    }

    // Fall back to floor price
    if (typeof item.floorPrice === 'number' && !isNaN(item.floorPrice)) {
      return item.floorPrice;
    }

    // Last resort: return 0
    console.error(`No valid price found for item ${item.name}`);
    return 0;
  };

  // Check if an item was recently updated
  const isRecentlyUpdated = (itemId) => latestPriceUpdates.has(itemId);

  // Add Ionicons and custom animations to the document head
  useEffect(() => {
    // Check if Ionicons is already loaded
    if (!document.getElementById('ionicons-css')) {
      const link = document.createElement('link');
      link.id = 'ionicons-css';
      link.rel = 'stylesheet';
      link.href =
        'https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css';
      document.head.appendChild(link);
    }

    // Add custom animations if not already added
    if (!document.getElementById('custom-animations')) {
      const style = document.createElement('style');
      style.id = 'custom-animations';
      style.textContent = `
        @keyframes blink {
          0% { 
            opacity: 1; 
            transform: scale(1); 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.15); 
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6); 
            filter: brightness(1.5);
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); 
          }
        }
        
        @keyframes pulse {
          0% { 
            transform: scale(1); 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); 
            opacity: 1;
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
            filter: brightness(1.2);
            opacity: 1; /* Maintain full opacity */
          }
          100% { 
            transform: scale(1); 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); 
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (loading) {
    return (
      <div
        className={`flex h-screen items-center justify-center ${
          darkMode ? 'bg-gray-900' : ''
        }`}
      >
        <div
          className={`h-12 w-12 animate-spin rounded-full border-4 ${
            darkMode
              ? 'border-blue-400 border-t-gray-900'
              : 'border-primary border-t-transparent'
          }`}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`container mx-auto p-4 ${
          darkMode ? 'bg-gray-900 text-white' : ''
        }`}
      >
        <div
          className={`rounded-md p-4 ${
            darkMode
              ? 'border border-red-800 bg-red-900 text-red-200'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <p>{error}</p>
          <button
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // All hooks must be called before any conditional returns

  return (
    <div
      ref={containerRef}
      className={`container mx-auto p-4 h-screen overflow-auto scroll-container ${
        marketCrashActive ? 'market-crash-active' : ''
      } ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}
    >
      {/* Header with branch name and market crash indicator */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1
            className="font-bold mr-4 text-white"
            style={{ fontSize: '2.175rem' }}
          >
            {selectedBranch?.name || 'Tiger Bar Menu'}
          </h1>
        </div>

        <div className="flex items-center gap-4">

          {marketCrashActive && (
            <div
              className={
                'market-crash-indicator animate-pulse rounded-md bg-red-600 px-4 py-2 text-white'
              }
            >
              <span className="font-bold" style={{ fontSize: '1.305rem' }}>MARKET CRASH ACTIVE</span>
            </div>
          )}

          {!isConnected && (
            <div className="rounded-md bg-yellow-500 px-4 py-2 text-white">
              <span style={{ fontSize: '1.305rem' }}>Reconnecting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Watermark - fixed position */}
      <div className="fixed inset-0 pointer-events-none z-10 watermark-container">
        {/* TV Screen Backdrop as full-screen background */}
        <img
          src={tvScreenBackdrop}
          alt="TV Screen Backdrop"
          className="watermark-backdrop"
        />

        {/* Tiger Bar logo centered on top of the backdrop */}
        <div className="fixed inset-0 flex items-center justify-center">
          <img
            src={darkMode ? tigerWhiteLogo : tigerDarkLogo}
            alt="Tiger Bar Logo"
            className="tiger-logo"
          />
        </div>
      </div>

      {/* Floating buttons container - enhanced auto-scroll button */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-50">
        {/* Auto-scroll toggle button - enhanced with label */}
        <button
          onClick={() => setAutoScrollPaused(!autoScrollPaused)}
          className={`flex items-center justify-center rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
            autoScrollPaused
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } border-2 border-white`}
          title={autoScrollPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          style={{ width: '70px', height: '70px' }}
        >
          {autoScrollPaused ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Drinks grouped by category */}
      <div className="flex flex-col gap-6">
        {groupedItems.map((section) => (
          <div
            key={section.categoryId}
            className="relative rounded-lg shadow-sm w-full border border-gray-800"
            style={{ backgroundColor: '#000000' }}
          >
            {/* Category header */}
            <div className="sticky-header p-3 text-white" style={{ backgroundColor: '#222222' }}>
              <h2 className="font-bold" style={{ fontSize: '1.45rem' }}>{section.title}</h2>
            </div>

            {/* Table header */}
            <div
              className="sticky-subheader flex p-3 font-semibold border-b border-gray-700"
              style={{ backgroundColor: '#111111' }}
            >
              <div className="w-1/2 flex items-center justify-between">
                <div className="w-1/2 text-left" style={{ color: '#FFFFFF', fontSize: '1.2325rem' }}>Item</div>
                <div className="w-1/2 text-center"></div>
              </div>
              <div className="w-1/2 flex items-center justify-between">
                <div className="w-full text-center" style={{ color: '#FF0000', fontSize: '1.2325rem' }}>Today's Low</div>
                <div className="w-full text-center" style={{ color: '#00FF00', fontSize: '1.2325rem' }}>Today's High</div>
                <div className="w-full text-center" style={{ color: '#FFFFFF', fontSize: '1.2325rem' }}>Current</div>
              </div>
            </div>

            {/* Table rows */}
            <div style={{ backgroundColor: '#000000' }}>
              {section.data.map((item) => {
                const trend = getTrendInfo(item);
                const isUpdated = isRecentlyUpdated(item._id);

                return (
                  <div
                    key={item._id}
                    className="flex p-3 border-b border-gray-800"
                    style={{
                      backgroundColor: isUpdated ? '#003300' : '#000000',
                      transition: 'background-color 1000ms',
                    }}
                  >
                    <div className="w-1/2 flex items-center justify-between">
                      <div className="w-1/2">
                        <div className="flex flex-col">
                          <span className="font-medium" style={{ fontSize: '1.305rem' }}>{item.name}</span>
                          <span className="text-xs" style={{ color: '#AAAAAA', fontSize: '1.015rem' }}>Stock Price: {formatPrice(item.floorPrice)}</span>
                        </div>
                      </div>

                      <div className="w-1/2 flex items-center justify-center">
                        <div
                          className="trend-icon"
                          style={{
                            color: trend.icon === 'trending-up'
                              ? '#4CD964' // Green color from frontend
                              : trend.icon === 'trending-down'
                                ? '#FF3B30' // Red color from frontend
                                : '#888888', // Gray color from frontend
                            fontSize: '20px',
                            fontWeight: 'bold',
                          }}
                        >
                          {trend.icon === 'trending-up' ? (
                            <TrendingUp size={24} />
                          ) : trend.icon === 'trending-down' ? (
                            <TrendingDown size={24} />
                          ) : (
                            <Minus size={24} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-1/2 flex items-center justify-between">
                      <div className="w-full flex items-center justify-center">
                        <span
                          className="font-bold"
                          style={{
                            color: '#FF0000', // Red for lowest price
                            fontSize: '1.2325rem',
                          }}
                        >
                          {formatPrice(getLowestDailyPrice(item))}
                        </span>
                      </div>

                      <div className="w-full flex items-center justify-center">
                        <span
                          className="font-bold"
                          style={{
                            color: '#00FF00', // Green for highest price
                            fontSize: '1.2325rem',
                          }}
                        >
                          {formatPrice(getHighestDailyPrice(item))}
                        </span>
                      </div>

                      <div className="w-full flex items-center justify-center">
                        <span
                          className="price-button"
                          data-trend={trend.icon === 'trending-up' ? 'up' : trend.icon === 'trending-down' ? 'down' : 'neutral'}
                          onMouseEnter={(e) => e.currentTarget.classList.add('price-button-hover')}
                          onMouseLeave={(e) => e.currentTarget.classList.remove('price-button-hover')}
                          style={{
                            fontWeight: 'bold',
                            padding: '0.25rem 0.75rem',
                            fontSize: '1.2325rem',
                            color: trend.icon === 'trending-up'
                              ? '#000000' // Black text on green background for better contrast
                              : trend.icon === 'trending-down'
                                ? '#FFFFFF' // White text on red background for better contrast
                                : '#FFFFFF', // White for neutral
                            display: 'inline-block',
                            animation: trend.icon !== 'remove' && blinkingItems.has(item._id)
                              ? 'blink 0.7s ease-in-out infinite'
                              : isUpdated
                                ? 'pulse 2s ease-in-out'
                                : 'none',
                            /* Button-like styling with fully opaque trend colors */
                            backgroundColor: trend.icon === 'trending-up'
                              ? '#00FF00' // Pure green, fully opaque
                              : trend.icon === 'trending-down'
                                ? '#FF0000' // Pure red, fully opaque
                                : 'rgba(255, 255, 255, 0.1)', // Semi-transparent white for neutral
                            borderRadius: '4px',
                            border: trend.icon === 'trending-up'
                              ? '2px solid #00FF00' // Thicker green border
                              : trend.icon === 'trending-down'
                                ? '2px solid #FF0000' // Thicker red border
                                : '1px solid #FFFFFF', // White border
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                            cursor: 'pointer',
                            minWidth: '80px',
                            textAlign: 'center',
                            transition: 'all 0.2s ease-in-out',
                            /* Add hover class to simulate hover effect even without mouse */
                          }}
                        >
                          {formatPrice(getCurrentPrice(item))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Market info */}
      <div
        className="mt-6 rounded-lg p-4 shadow-sm border border-gray-800"
        style={{ backgroundColor: '#111111' }}
      >
        <div className="mb-2 flex items-center">
          <span className="mr-2 text-blue-600">ℹ️</span>
          <span className="text-gray-300" style={{ fontSize: '0.75rem' }}>
            Prices fluctuate based on demand. "Low" shows the lowest price reached
            today. "High" shows the highest price reached today. Stock price is shown below each item name.
          </span>
        </div>

        <div className="mb-2 flex items-center">
          <span
            className="mr-2 font-bold"
            style={{ fontSize: '18px', color: '#00FF00' }}
          >
            ▲
          </span>
          <span className="text-gray-300" style={{ fontSize: '0.75rem' }}>
            Green upward trend indicates current price is higher than the stock price.
          </span>
        </div>

        <div className="mb-2 flex items-center">
          <span
            className="mr-2 font-bold"
            style={{ fontSize: '18px', color: '#FF0000' }}
          >
            ▼
          </span>
          <span className="text-gray-300" style={{ fontSize: '0.75rem' }}>
            Red downward trend indicates current price is lower than the stock price.
          </span>
        </div>

        <div className="mb-2 flex items-center">
          <span
            className="mr-2 font-bold"
            style={{ fontSize: '18px', color: '#757575' }}
          >
            —
          </span>
          <span className="text-gray-300" style={{ fontSize: '0.75rem' }}>
            Horizontal line indicates current price is equal to the stock price.
          </span>
        </div>

        {marketCrashActive && (
          <div
            className={`mt-4 flex items-center rounded-md p-3 ${
              darkMode ? 'bg-red-900 bg-opacity-30' : 'bg-red-100'
            }`}
          >
            <span className="mr-2 text-red-600">⚠️</span>
            <span
              className="text-red-300 font-semibold"
              style={{ fontSize: '0.75rem' }}
            >
              Market crash in progress! Prices have dropped significantly.
            </span>
          </div>
        )}

        {/* Status indicator */}
        <div className="mt-4 flex items-center justify-center">
          <span
            className="text-gray-400"
            style={{ fontSize: '0.7rem' }}
          >
            Use the floating button in the bottom right to control auto-scroll
          </span>
        </div>
      </div>

      {/* Add some CSS for the market crash effect, sticky headers, and floating buttons */}
      <style jsx global>{`

        /* No global font size adjustment */
        /* Dark mode styles for body */
        body.dark-mode {
          background-color: #000000; /* Pure black */
          color: white;
        }

        .market-crash-active {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .market-crash-indicator {
          animation: blink 1s infinite;
        }

        /* This is for the market crash indicator only */
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Price button hover effect */
        .price-button-hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }
        
        /* Trend-specific hover effects with full opacity */
        .price-button[data-trend="up"].price-button-hover {
          background-color: #00FF00 !important; /* Pure green, fully opaque */
          box-shadow: 0 4px 8px rgba(0, 255, 0, 0.7) !important;
          filter: brightness(1.2) !important;
        }
        
        .price-button[data-trend="down"].price-button-hover {
          background-color: #FF0000 !important; /* Pure red, fully opaque */
          box-shadow: 0 4px 8px rgba(255, 0, 0, 0.7) !important;
          filter: brightness(1.2) !important;
        }

        /* Scroll container */
        .scroll-container {
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          transition: background-color 0.3s ease, color 0.3s ease;
          min-height: 100vh;
        }
        
        /* Prevent layout shifts when switching modes */
        .container {
          transition: background-color 0.3s ease;
        }

        /* Floating buttons styles - only for auto-scroll button */
        .fixed.bottom-6.right-6 button {
          width: 50px;
          height: 50px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          transform: scale(1);
          opacity: 0.1; /* Reduced opacity when idle */
          z-index: 1000;
          transition: transform 0.2s ease, box-shadow 0.2s ease,
            opacity 0.3s ease;
        }

        .fixed.bottom-6.right-6 button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.35);
          opacity: 1;
        }

        /* Make the container also respond to hover for better UX */
        .fixed.bottom-6.right-6:hover button {
          opacity: 0.8;
        }

        /* Enhanced pulse animation to the pause/play button */
        .fixed.bottom-6.right-6 button.bg-red-600 {
          animation: subtle-pulse 2s infinite;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
        }
        
        .fixed.bottom-6.right-6 button.bg-green-600 {
          animation: subtle-pulse 2s infinite;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
        }
        
        @keyframes subtle-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        /* Dark mode button styles - no hover animations */
        .flex.items-center.gap-4 button {
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          z-index: 10;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        @keyframes subtle-pulse {
          0%,
          100% {
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            opacity: 0.3;
          }
          50% {
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);
            opacity: 0.5;
          }
        }

        /* Trend icon styles */
        .trend-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 50px;
        }

        .trend-icon i {
          font-size: 32px;
        }

        /* Add a subtle animation for recently updated items */
        .bg-green-50,
        .bg-green-900.bg-opacity-30 {
          transition: background-color 1s ease;
        }

        /* Sticky header styles */
        .sticky-header {
          position: -webkit-sticky;
          position: sticky;
          top: -16px; /* Adjusted as requested */
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .sticky-subheader {
          position: -webkit-sticky;
          position: sticky;
          top: 44px; /* Adjusted as requested */
          z-index: 9;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        /* Ensure each category section has proper spacing */
        .flex-col > div {
          margin-bottom: 16px;
          overflow: visible; /* Important for sticky positioning */
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        /* Dark mode scrollbar styles */
        .dark-mode .scroll-container::-webkit-scrollbar {
          width: 12px;
        }

        .dark-mode .scroll-container::-webkit-scrollbar-track {
          background: #000000; /* Pure black */
        }

        .dark-mode .scroll-container::-webkit-scrollbar-thumb {
          background-color: #333333; /* Dark gray */
          border-radius: 6px;
          border: 3px solid #000000; /* border color matching track */
        }

        .dark-mode .scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: #444444; /* Slightly lighter gray on hover */
        }

        /* Watermark styles */
        .watermark-container {
          pointer-events: none;
          z-index: 20;
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
        }

        /* TV Screen Backdrop styles */
        .watermark-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: fill; /* Cover the entire container */
          filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.1));
          opacity: 0.1; /* Default opacity for light mode */
          transform: scaleX(-1); /* Flip horizontally */
        }

        /* Tiger Logo styles */
        .tiger-logo {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.1));
          opacity: 0.1; /* Default opacity for light mode */
        }

        /* Adjust watermark for dark mode */
        .dark-mode .watermark-backdrop {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.1));
          opacity: 0.2; /* Lower opacity for dark mode */
        }
        
        .dark-mode .tiger-logo {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.1)) blur(3px);
          opacity: 0.2; /* Lower opacity for dark mode */
        }
      `}</style>
    </div>
  );
}
