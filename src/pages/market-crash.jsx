import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import branchesApi from "../api/branches";
import { useToast } from "../components/ui/use-toast";
import { useMarketCrash } from "../contexts/market-crash-context";
import { BranchSelector } from "../components/market-crash/branch-selector";
import { MarketCrashTrigger } from "../components/market-crash/market-crash-trigger";
import { MarketCrashStatus } from "../components/market-crash/market-crash-status";
import { CrashHistory } from "../components/market-crash/crash-history";
import { ConfirmationModal } from "../components/market-crash/confirmation-modal";

/**
 * MarketCrash page component
 *
 * @returns {JSX.Element} MarketCrash page
 */
export function MarketCrash() {
  const { toast } = useToast();
  const { refreshMarketCrashStatus } = useMarketCrash();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedBranchData, setSelectedBranchData] = useState(null);
  const [crashPercentage, setCrashPercentage] = useState(50);
  const [crashDuration, setCrashDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await branchesApi.getBranches();
        setBranches(response.data);
        setLoadingBranches(false);
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast({
          title: "Error",
          description: "Failed to load branches",
          variant: "destructive",
        });
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [toast]);

  // Fetch branch data when selected branch changes
  useEffect(() => {
    const fetchBranchData = async () => {
      if (!selectedBranch) {
        setSelectedBranchData(null);
        return;
      }

      try {
        const response = await branchesApi.getBranch(selectedBranch);
        setSelectedBranchData(response.data);
      } catch (error) {
        console.error("Error fetching branch data:", error);
        toast({
          title: "Error",
          description: "Failed to load branch data",
          variant: "destructive",
        });
      }
    };

    fetchBranchData();
  }, [selectedBranch, toast]);

  // Update timer for active market crash
  useEffect(() => {
    if (!selectedBranchData?.marketCrashActive) {
      setTimeRemaining(null);
      return;
    }

    // Calculate time remaining based on start time and end time
    const startTime = new Date(selectedBranchData.marketCrashStartTime);
    const endTime = new Date(
      selectedBranchData.marketCrashEndTime ||
        startTime.getTime() +
          (selectedBranchData.marketCrashDuration || 15) * 60 * 1000
    );

    const timer = setInterval(() => {
      const now = new Date();
      if (now >= endTime) {
        setTimeRemaining("00:00");
        clearInterval(timer);
        return;
      }

      const diff = endTime - now;
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedBranchData]);

  // Handle branch selection
  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  // Handle crash percentage selection
  const handleCrashPercentageChange = (event) => {
    setCrashPercentage(parseInt(event.target.value));
  };

  // Handle crash duration selection
  const handleCrashDurationChange = (event) => {
    setCrashDuration(parseInt(event.target.value));
  };

  // Show confirmation modal for triggering market crash
  const showTriggerConfirmation = () => {
    if (!selectedBranch) {
      toast({
        title: "Error",
        description: "Please select a branch",
        variant: "destructive",
      });
      return;
    }

    setConfirmAction("trigger");
    setShowConfirmModal(true);
  };

  // Show confirmation modal for ending market crash
  const showEndConfirmation = () => {
    if (!selectedBranch) {
      toast({
        title: "Error",
        description: "Please select a branch",
        variant: "destructive",
      });
      return;
    }

    setConfirmAction("end");
    setShowConfirmModal(true);
  };

  // Handle confirmation action
  const handleConfirmAction = async () => {
    if (confirmAction === "trigger") {
      await triggerMarketCrash();
    } else if (confirmAction === "end") {
      await endMarketCrash();
    }
  };

  // Trigger market crash
  const triggerMarketCrash = async () => {
    try {
      setLoading(true);
      const response = await branchesApi.triggerMarketCrash(
        selectedBranch,
        crashPercentage,
        crashDuration
      );

      toast({
        title: "Success",
        description: response.message || "Market crash triggered successfully",
        variant: "default",
      });

      // Refresh branch data
      const branchResponse = await branchesApi.getBranch(selectedBranch);
      setSelectedBranchData(branchResponse.data);

      // Refresh global market crash status to trigger visual effects
      refreshMarketCrashStatus();

      setLoading(false);
    } catch (error) {
      console.error("Error triggering market crash:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger market crash",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // End market crash
  const endMarketCrash = async () => {
    try {
      setLoading(true);
      const response = await branchesApi.endMarketCrash(selectedBranch);

      // Show enhanced success message with price reset information
      const resetCount = response.data?.resetCount || 0;
      const branchName = selectedBranchData?.name || 'selected branch';
      
      toast({
        title: "Market Crash Ended",
        description: resetCount > 0 
          ? `Market crash ended for ${branchName}. ${resetCount} item prices have been reset to floor price.`
          : response.message || "Market crash ended successfully",
        variant: "default",
      });

      // Refresh branch data
      const branchResponse = await branchesApi.getBranch(selectedBranch);
      setSelectedBranchData(branchResponse.data);

      // Refresh global market crash status to stop visual effects
      refreshMarketCrashStatus();

      setLoading(false);
    } catch (error) {
      console.error("Error ending market crash:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to end market crash",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Format crash start time
  const formatCrashTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, yyyy HH:mm:ss");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Calculate crash duration
  const calculateCrashDuration = (startTime, endTime) => {
    if (!startTime) return "N/A";

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();

    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));

    return `${minutes} minutes`;
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Market Crash</h1>
        <p className="text-muted-foreground">
          Trigger branch-specific market crash to drop prices based on percentage of base price
        </p>
      </div>

      {/* Branch Selection */}
      <BranchSelector
        branches={branches}
        selectedBranch={selectedBranch}
        onBranchChange={handleBranchChange}
        loading={loadingBranches}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Market Crash Trigger */}
        <MarketCrashTrigger
          selectedBranch={selectedBranch}
          crashPercentage={crashPercentage}
          onCrashPercentageChange={handleCrashPercentageChange}
          crashDuration={crashDuration}
          onCrashDurationChange={handleCrashDurationChange}
          onTriggerCrash={showTriggerConfirmation}
          loading={loading}
          isCrashActive={selectedBranchData?.marketCrashActive}
        />

        {/* Market Crash Status */}
        <MarketCrashStatus
          selectedBranch={selectedBranch}
          branchData={selectedBranchData}
          formatCrashTime={formatCrashTime}
          timeRemaining={timeRemaining}
          onEndCrash={showEndConfirmation}
          loading={loading}
        />
      </div>

      {/* Crash History */}
      <CrashHistory
        selectedBranch={selectedBranch}
        branchData={selectedBranchData}
        formatCrashTime={formatCrashTime}
        calculateCrashDuration={calculateCrashDuration}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === "trigger"
            ? "Confirm Market Crash"
            : "End Market Crash"
        }
        message={
          confirmAction === "trigger"
            ? `Are you sure you want to trigger a market crash with ${crashPercentage}% intensity for ${crashDuration} minutes?`
            : "Are you sure you want to end the current market crash?"
        }
        confirmText={
          confirmAction === "trigger" ? "Trigger Crash" : "End Crash"
        }
        confirmVariant={confirmAction === "trigger" ? "destructive" : "default"}
      />
    </div>
  );
}
