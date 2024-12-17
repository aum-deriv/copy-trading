import { useEffect, useState } from "react";
import { Text, Snackbar } from "@deriv-com/quill-ui";
import useDerivWebSocket from "../hooks/useDerivWebSocket";
import useCopyTradersList from "../hooks/useCopyTradersList";
import AddTraderForm from "./AddTraderForm";
import TraderCard from "./TraderCard";

const CopierDashboard = () => {
    const { sendRequest, wsResponse } = useDerivWebSocket();
    const { traders: apiTraders, isLoading } = useCopyTradersList();
    const [localTraders, setLocalTraders] = useState([]);
    const [processingTrader, setProcessingTrader] = useState(null);
    const [copiedTrader, setCopiedTrader] = useState(null);
    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: "",
        status: "neutral",
    });

    // Load traders from localStorage and API
    useEffect(() => {
        const storedTraders = JSON.parse(
            localStorage.getItem("traders") || "[]"
        );

        if (apiTraders?.length) {
            // Convert API traders to our format
            const formattedApiTraders = apiTraders.map((trader) => ({
                id: trader.loginid,
                name: trader.name || `Trader ${trader.loginid}`, // Fallback name if not provided
            }));

            // Merge API traders with stored traders, avoiding duplicates
            const mergedTraders = [...storedTraders];

            formattedApiTraders.forEach((apiTrader) => {
                const existingIndex = mergedTraders.findIndex(
                    (local) => local.id === apiTrader.id
                );

                if (existingIndex === -1) {
                    // Add new trader if not exists
                    mergedTraders.push(apiTrader);
                }
            });

            // Update localStorage and state
            localStorage.setItem("traders", JSON.stringify(mergedTraders));
            setLocalTraders(mergedTraders);

            console.log("Merged traders:", mergedTraders);
        } else {
            setLocalTraders(storedTraders);
        }
    }, [apiTraders]);

    useEffect(() => {
        if (!wsResponse || !processingTrader) return;

        const handleResponse = () => {
            console.log("WebSocket Response:", wsResponse);
            console.log("Processing Trader:", processingTrader);

            if (wsResponse.msg_type === "copy_start") {
                if (wsResponse.error) {
                    console.log(
                        "Showing error snackbar:",
                        wsResponse.error.message
                    );
                    setSnackbar({
                        isVisible: true,
                        message:
                            wsResponse.error.message ||
                            "Error starting copy trade",
                        status: "fail",
                    });
                    setProcessingTrader(null);
                } else {
                    const trader = processingTrader;
                    console.log(
                        "Showing success snackbar for trader:",
                        trader.name
                    );
                    setCopiedTrader(trader);
                    setProcessingTrader(null);
                    setSnackbar({
                        isVisible: true,
                        message: `Successfully started copying ${trader.name}`,
                        status: "neutral",
                    });
                }
            } else if (wsResponse.msg_type === "copy_stop") {
                if (wsResponse.error) {
                    setSnackbar({
                        isVisible: true,
                        message:
                            wsResponse.error.message ||
                            "Error stopping copy trade",
                        status: "fail",
                    });
                    setProcessingTrader(null);
                } else {
                    const trader = processingTrader;
                    setCopiedTrader(null);
                    setProcessingTrader(null);
                    setSnackbar({
                        isVisible: true,
                        message: `Stopped copying ${trader.name}`,
                        status: "neutral",
                    });
                }
            }
        };

        handleResponse();
    }, [wsResponse]);

    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, isVisible: false }));
    };

    const handleCopyClick = (trader) => {
        console.log("Copy clicked for trader:", trader);
        setProcessingTrader(trader);
        sendRequest({
            copy_start: trader.id,
        });
    };

    const handleStopCopy = (trader) => {
        console.log("Stop copy clicked for trader:", trader);
        setProcessingTrader(trader);
        sendRequest({
            copy_stop: trader.id,
        });
    };

    const handleAddTrader = (trader) => {
        console.log("New trader added:", trader);
        setLocalTraders((prev) => [...prev, trader]);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <Text size="3xl" bold className="mb-4">
                    Copy Trading Dashboard
                </Text>
                <Text size="lg" className="text-gray-600">
                    Available traders to copy
                </Text>
            </div>

            <AddTraderForm onAddTrader={handleAddTrader} />

            {isLoading ? (
                <div className="text-center py-8">Loading traders...</div>
            ) : localTraders.length === 0 ? (
                <div className="text-center py-8">
                    <Text size="lg">Start by adding traders for copying</Text>
                </div>
            ) : (
                <div className="grid gap-6">
                    {localTraders.map((trader, index) => (
                        <TraderCard
                            key={trader.id || index}
                            trader={trader}
                            onCopyClick={handleCopyClick}
                            onStopCopy={handleStopCopy}
                            isCopying={copiedTrader?.id === trader.id}
                            isProcessing={processingTrader?.id === trader.id}
                        />
                    ))}
                </div>
            )}

            <div className="fixed top-0 left-0 right-0 flex justify-center pt-4 z-50">
                <Snackbar
                    isVisible={snackbar.isVisible}
                    message={snackbar.message}
                    status={snackbar.status}
                    hasCloseButton={true}
                    onCloseAction={handleSnackbarClose}
                    standalone={true}
                />
            </div>
        </div>
    );
};

export default CopierDashboard;
