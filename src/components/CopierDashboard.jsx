import { useEffect } from "react";
import {
    Text,
    Spinner,
    SectionMessage,
    useSnackbar,
} from "@deriv-com/quill-ui";
import useCopyTradersList from "../hooks/useCopyTradersList";
import CopyTradingBanner from "./CopyTradingBanner";
import useSettings from "../hooks/useSettings";
import useCopyStart from "../hooks/useCopyStart";
import useCopyStop from "../hooks/useCopyStop";
import AddTraderForm from "./AddTraderForm";
import TraderCard from "./TraderCard";

const CopierDashboard = () => {
    const {
        settings,
        updateSettings,
        fetchSettings,
        isLoading: isSettingsLoading,
    } = useSettings();
    const showCopierBanner = settings?.allow_copiers === 1;
    const { startCopyTrading, processingTrader: copyStartProcessingTrader } =
        useCopyStart();
    const { stopCopyTrading, processingTrader: copyStopProcessingTrader } =
        useCopyStop();
    const {
        copiers,
        traders: apiTraders,
        isLoading,
        error,
        refreshList,
    } = useCopyTradersList();
    const hasCopiers = copiers?.length > 0;
    const { addSnackbar, removeSnackbar } = useSnackbar();

    useEffect(() => {
        console.log("CopierDashboard - Traders:", {
            apiTraders,
            isLoading,
            error,
        });
    }, [apiTraders, isLoading, error]);
    const isProcessing = copyStartProcessingTrader || copyStopProcessingTrader;

    const handleStartCopy = (trader) => {
        startCopyTrading(
            trader,
            (trader) => {
                const id = `start-copy-${trader.id}-${Date.now()}`;
                addSnackbar({
                    id,
                    message: `Successfully started copying ${trader.id}`,
                    status: "neutral",
                });
                setTimeout(() => removeSnackbar(id), 3000);
            },
            (errorMessage) => {
                const id = `start-copy-error-${Date.now()}`;
                addSnackbar({
                    id,
                    message: errorMessage,
                    status: "fail",
                });
                setTimeout(() => removeSnackbar(id), 3000);
            }
        );
    };

    const handleStopCopy = (trader) => {
        stopCopyTrading(
            trader,
            (trader) => {
                const id = `stop-copy-${trader.name}-${Date.now()}`;
                addSnackbar({
                    id,
                    message: `Stopped copying ${trader.name}`,
                    status: "neutral",
                });
                setTimeout(() => removeSnackbar(id), 3000);
                refreshList();
            },
            (errorMessage) => {
                const id = `stop-copy-error-${Date.now()}`;
                addSnackbar({
                    id,
                    message: errorMessage,
                    status: "fail",
                });
                setTimeout(() => removeSnackbar(id), 3000);
            }
        );
    };

    const handleAddTrader = (trader) => {
        console.log("New trader added:", trader);
        // Refresh the traders list from API
        refreshList();
    };

    const handleGetStarted = async () => {
        try {
            await updateSettings({ allow_copiers: 0 });
            await fetchSettings();
        } catch (error) {
            const id = `settings-error-${Date.now()}`;
            addSnackbar({
                id,
                message: error.message || "Failed to update settings",
                status: "fail",
            });
            setTimeout(() => removeSnackbar(id), 3000);
        }
    };

    const isPageLoading = isLoading || isSettingsLoading;

    if (isPageLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 relative">
            {showCopierBanner && !hasCopiers && (
                <CopyTradingBanner onGetStarted={handleGetStarted} />
            )}
            {hasCopiers && (
                <SectionMessage
                    message="Traders are not permitted to copy other traders."
                    size="sm"
                    status="danger"
                />
            )}
            <div className="relative">
                {(hasCopiers || showCopierBanner) && (
                    <div className="absolute inset-0 bg-gray-50/70 z-30" />
                )}
                <AddTraderForm onAddTrader={handleAddTrader} />

                <div className="mb-8">
                    <Text size="lg" bold>
                        Actively Copied Traders
                    </Text>
                </div>

                {error ? (
                    <div className="text-center py-8 text-red-600">
                        Error loading traders: {error}
                    </div>
                ) : !apiTraders?.length ? (
                    <div className="text-center py-8">No traders available</div>
                ) : (
                    <div className="grid gap-6">
                        {apiTraders.map((trader) => (
                            <TraderCard
                                key={trader.loginid}
                                trader={trader}
                                onStartCopy={handleStartCopy}
                                onStopCopy={handleStopCopy}
                                isProcessing={isProcessing}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CopierDashboard;
