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
  const [darkMode, setDarkMode] = useState(false);

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

      // Fetch drink items for the selected branch with price information
      const { data: itemsData } = await api.items.getItems({
        branch: selectedBranch._id,
        type: 'drinks',
        includePrices: true, // Include current and previous prices for trend display
      });

      // Log the first item to check if we're getting price data
      if (itemsData && itemsData.length > 0) {
        console.log('Sample item with price data:', {
          name: itemsData[0].name,
          currentPrice: itemsData[0].currentPrice,
          previousPrice: itemsData[0].previousPrice,
          floorPrice: itemsData[0].floorPrice,
        });
      }

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

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('tvScreenDarkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Check if user prefers dark mode based on system preference
      const prefersDarkMode =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  // Save dark mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tvScreenDarkMode', darkMode.toString());

    // Apply dark mode class to body for global styling if needed
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

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
            });

            return {
              ...item,
              previousPrice: data.oldPrice,
              currentPrice: data.newPrice,
              highestDailyPrice: data.highestDailyPrice,
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

  // Get trend icon and color based on price comparison
  const getTrendInfo = (item) => {
    // Log the item to debug
    console.log(`Getting trend for ${item.name}:`, {
      currentPrice: item.currentPrice,
      previousPrice: item.previousPrice,
      floorPrice: item.floorPrice,
    });

    const currentPrice = getCurrentPrice(item);

    // If price data is not available, don't show any trend
    if (
      item.previousPrice === undefined ||
      item.previousPrice === null ||
      typeof currentPrice !== 'number'
    ) {
      console.log(`No trend data for ${item.name}, not showing trend`);
      return {
        icon: 'remove',
        color: darkMode ? '#9CA3AF' : '#888888', // Lighter gray for dark mode
        show: false,
      }; // No trend symbol
    }

    // Compare current price with previous price
    if (currentPrice > item.previousPrice) {
      console.log(
        `Uptrend for ${item.name}: ${item.previousPrice} -> ${currentPrice}`,
      );
      return {
        icon: 'trending-up',
        color: darkMode ? '#34D399' : '#4CD964', // Adjusted green for dark mode
        show: true,
      }; // Green for up trend (price increased)
    } else if (currentPrice < item.previousPrice) {
      console.log(
        `Downtrend for ${item.name}: ${item.previousPrice} -> ${currentPrice}`,
      );
      return {
        icon: 'trending-down',
        color: darkMode ? '#F87171' : '#FF3B30', // Adjusted red for dark mode
        show: true,
      }; // Red for down trend (price decreased)
    } else {
      console.log(
        `No change for ${item.name}: ${item.previousPrice} -> ${currentPrice}`,
      );
      return {
        icon: 'remove',
        color: darkMode ? '#9CA3AF' : '#888888', // Lighter gray for dark mode
        show: false,
      }; // No trend symbol for unchanged price
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

  // Get the current price for an item, falling back to floor price
  const getCurrentPrice = (item) => {
    // Log the item to debug
    console.log(`Getting current price for ${item.name}:`, {
      currentPrice: item.currentPrice,
      floorPrice: item.floorPrice,
    });

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

  // Add Ionicons to the document head
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
      } ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
    >
      {/* Header with branch name and market crash indicator */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1
            className={`text-3xl font-bold mr-4 ${
              darkMode ? 'text-white' : 'text-black'
            }`}
          >
            {selectedBranch?.name || 'Tiger Bar Menu'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Dark mode toggle button - moved to top */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center justify-center rounded-full w-10 h-10 shadow-lg focus:outline-none ${
              darkMode
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-700 text-yellow-300'
            }`}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ minWidth: '40px' }}
          >
            <div className="flex items-center justify-center w-6 h-6">
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </div>
          </button>

          {marketCrashActive && (
            <div
              className={
                'market-crash-indicator animate-pulse rounded-md bg-red-600 px-4 py-2 text-white'
              }
            >
              <span className="font-bold">MARKET CRASH ACTIVE</span>
            </div>
          )}

          {!isConnected && (
            <div className="rounded-md bg-yellow-500 px-4 py-2 text-white">
              <span>Reconnecting...</span>
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

      {/* Floating buttons container - only for auto-scroll button */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-50">
        {/* Auto-scroll toggle button */}
        <button
          onClick={() => setAutoScrollPaused(!autoScrollPaused)}
          className={`flex items-center justify-center rounded-full p-3 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
            autoScrollPaused
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
          title={autoScrollPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
          {autoScrollPaused ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
              className="h-6 w-6"
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
            className={`relative rounded-lg shadow-sm w-full ${
              darkMode ? 'border border-gray-700' : 'border border-gray-200'
            }`}
          >
            {/* Category header */}
            <div className="sticky-header bg-primary p-4 text-white">
              <h2 className="text-xl font-bold">{section.title}</h2>
            </div>

            {/* Table header */}
            <div
              className={`sticky-subheader flex p-3 font-semibold ${
                darkMode
                  ? 'border-b border-gray-700 bg-gray-800'
                  : 'border-b border-gray-200 bg-gray-50'
              }`}
            >
              <div className="w-1/2 flex items-center justify-between">
                <div className="w-1/2 text-left">Item</div>
                <div className="w-1/2 text-center"></div>
              </div>
              <div className="w-1/2 flex items-center justify-between">
                <div className="w-24 text-center">Low</div>
                <div className="w-24 text-center">High</div>
                <div className="w-32 text-center">Current</div>
              </div>
            </div>

            {/* Table rows */}
            <div className={darkMode ? 'bg-gray-800' : 'bg-white'}>
              {section.data.map((item) => {
                const trend = getTrendInfo(item);
                const isUpdated = isRecentlyUpdated(item._id);

                return (
                  <div
                    key={item._id}
                    className={`flex p-3 ${
                      darkMode
                        ? `border-b border-gray-700 ${
                            isUpdated
                              ? 'bg-green-900 bg-opacity-30 transition-colors duration-1000'
                              : ''
                          }`
                        : `border-b border-gray-100 ${
                            isUpdated
                              ? 'bg-green-50 transition-colors duration-1000'
                              : ''
                          }`
                    }`}
                  >
                    <div className="w-1/2 flex items-center justify-between">
                      <div className="w-1/2">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </div>

                      <div className="w-1/2 flex items-center justify-center">
                        {trend.show && trend.icon !== 'remove' && (
                          <div
                            className="trend-icon"
                            style={{
                              color: trend.color,
                            }}
                          >
                            <i className={`ionicons ion-md-${trend.icon}`}></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-1/2 flex items-center justify-between">
                      <div className="w-24 flex items-center justify-center">
                        <span
                          className={`font-bold ${
                            darkMode ? 'text-red-400' : 'text-red-600'
                          }`}
                        >
                          {formatPrice(item.floorPrice)}
                        </span>
                      </div>

                      <div className="w-24 flex items-center justify-center">
                        <span
                          className={`font-bold ${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}
                        >
                          {formatPrice(getHighestDailyPrice(item))}
                        </span>
                      </div>

                      <div className="w-32 flex items-center justify-center">
                        <span
                          className={`font-bold ${
                            isUpdated
                              ? darkMode
                                ? 'text-green-400'
                                : 'text-green-600'
                              : ''
                          }`}
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
        className={`mt-6 rounded-lg p-4 shadow-sm ${
          darkMode
            ? 'border border-gray-700 bg-gray-800'
            : 'border border-gray-200 bg-white'
        }`}
      >
        <div className="mb-2 flex items-center">
          <span className="mr-2 text-blue-600">ℹ️</span>
          <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>
            Prices fluctuate based on demand. "Low" shows the floor price
            (minimum possible price). "High" shows the highest price reached
            today.
          </span>
        </div>

        <div className="mb-2 flex items-center">
          <span
            className={`mr-2 font-bold ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}
          >
            <i
              className="ionicons ion-md-trending-up"
              style={{ fontSize: '20px' }}
            ></i>
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>
            Green upward trend indicates price has increased compared to
            previous price.
          </span>
        </div>

        <div className="mb-2 flex items-center">
          <span
            className={`mr-2 font-bold ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}
          >
            <i
              className="ionicons ion-md-trending-down"
              style={{ fontSize: '20px' }}
            ></i>
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>
            Red downward trend indicates price has decreased compared to
            previous price.
          </span>
        </div>

        <div className="mb-2 flex items-center">
          <span
            className={`mr-2 font-bold ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <i
              className="ionicons ion-md-remove"
              style={{ fontSize: '20px' }}
            ></i>
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>
            Horizontal line indicates no change in price.
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
              className={`text-sm font-semibold ${
                darkMode ? 'text-red-300' : 'text-red-800'
              }`}
            >
              Market crash in progress! Prices have dropped significantly.
            </span>
          </div>
        )}

        {/* Status indicator */}
        <div className="mt-4 flex items-center justify-center">
          <span
            className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Use the floating buttons in the bottom right to control auto-scroll
            and theme
          </span>
        </div>
      </div>

      {/* Add some CSS for the market crash effect, sticky headers, and floating buttons */}
      <style jsx global>{`
        /* Dark mode styles for body */
        body.dark-mode {
          background-color: #111827; /* bg-gray-900 */
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

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
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
          opacity: 0.25;
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

        /* Add a subtle pulse animation to the pause button when auto-scroll is active */
        .fixed.bottom-6.right-6 button.bg-red-500 {
          animation: subtle-pulse 2s infinite;
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
            opacity: 0.5;
          }
          50% {
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);
            opacity: 0.7;
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
          background: #1f2937; /* bg-gray-800 */
        }

        .dark-mode .scroll-container::-webkit-scrollbar-thumb {
          background-color: #4b5563; /* bg-gray-600 */
          border-radius: 6px;
          border: 3px solid #1f2937; /* border color matching track */
        }

        .dark-mode .scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280; /* bg-gray-500 */
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
          object-fit: cover; /* Cover the entire container */
          filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.1)) blur(2px);
          opacity: 0.15; /* Default opacity for light mode */
        }

        /* Tiger Logo styles */
        .tiger-logo {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.1)) blur(1px);
          opacity: 0.1; /* Default opacity for light mode */
        }

        /* Adjust watermark for dark mode */
        .dark-mode .watermark-backdrop {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2)) blur(2px);
          opacity: 0.2; /* Slightly higher opacity for dark mode */
        }
        
        .dark-mode .tiger-logo {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2)) blur(1px);
          opacity: 0.1; /* Slightly higher opacity for dark mode */
        }
      `}</style>
    </div>
  );
}
