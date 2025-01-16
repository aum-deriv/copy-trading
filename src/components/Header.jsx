import { Text, Button, Skeleton } from "@deriv-com/quill-ui";
import AccountSelector from "./AccountSelector";
import derivIcon from "../assets/deriv-icon.svg";
import { useAuth } from "../hooks/useAuth.jsx";
import useBalance from "../hooks/useBalance";
import useLogout from "../hooks/useLogout";

const Header = () => {
    const { defaultAccount, otherAccounts, isAuthorized, isLoading } =
        useAuth();
    const balances = useBalance();
    const settings = JSON.parse(
        localStorage.getItem("deriv_endpoint_settings") || "{}"
    );
    const server = settings.server;
    const appId = settings.appId;
    const { logout } = useLogout();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleDerivLogin = () => {
        window.location.href = `https://${server}/oauth2/authorize?app_id=${appId}`;
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src={derivIcon} alt="Deriv" className="w-6 h-6" />
                        <Text size="lg" bold>
                            Copy Trading
                        </Text>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isLoading ? (
                            <>
                                <div className="w-40 h-8">
                                    <Skeleton.Square
                                        active
                                        rounded
                                        width="100%"
                                    />
                                </div>
                                <div className="w-20 h-8">
                                    <Skeleton.Square
                                        active
                                        rounded
                                        width="100%"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {isAuthorized ? (
                                    <AccountSelector
                                        defaultAccount={defaultAccount}
                                        otherAccounts={otherAccounts}
                                        onLogout={handleLogout}
                                        balances={balances}
                                    />
                                ) : (
                                    <Button
                                        variant="primary"
                                        size="md"
                                        onClick={handleDerivLogin}
                                    >
                                        Log in
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
