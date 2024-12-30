import { Spinner } from "@deriv-com/quill-ui";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { getOAuthURL } from "../config/oauth_config.js";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { defaultAccount, isLoading, updateAccounts } = useAuth();

    useEffect(() => {
        // Handle OAuth redirect logic
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(
            window.location.search || location.search
        );
        const hashParams = new URLSearchParams(location.hash.replace("#", ""));

        console.log("OAuth Redirect Debug:", {
            currentUrl,
            urlSearch: window.location.search,
            locationSearch: location.search,
            hashSearch: location.hash,
            urlParams: Object.fromEntries(urlParams.entries()),
            hashParams: Object.fromEntries(hashParams.entries()),
            pathname: window.location.pathname,
            locationState: location.state,
        });

        const accounts = [];
        let defaultAcct = null;

        // Iterate through params to find account data
        let index = 1;
        while (
            urlParams.has(`acct${index}`) ||
            hashParams.has(`acct${index}`)
        ) {
            const account = {
                account:
                    urlParams.get(`acct${index}`) ||
                    hashParams.get(`acct${index}`),
                token:
                    urlParams.get(`token${index}`) ||
                    hashParams.get(`token${index}`),
                currency:
                    urlParams.get(`cur${index}`) ||
                    hashParams.get(`cur${index}`),
            };
            console.log(`Found account ${index}:`, account);

            if (account.account && account.token) {
                accounts.push(account);
                if (index === 1) {
                    defaultAcct = account;
                }
            }
            index++;
        }

        // Handle accounts if found in OAuth redirect
        if (accounts.length > 0) {
            console.log("Updating accounts and redirecting to dashboard");
            const otherAccounts = accounts.slice(1);
            updateAccounts(defaultAcct, otherAccounts);
            window.location.href = `${window.location.origin}/copy-trading/#/dashboard`;
            return;
        }

        // Regular login flow - redirect if already logged in
        if (!isLoading && defaultAccount?.token) {
            navigate("/dashboard", { replace: true });
        }
    }, [defaultAccount, navigate, isLoading, location, updateAccounts]);

    const showSpinner =
        (isLoading ||
            window.location.search ||
            window.location.hash.includes("acct")) &&
        !defaultAccount?.token;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/src/assets/deriv-icon.svg"
                        alt="Deriv Logo"
                        className="w-16 h-16 mb-4"
                    />
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Copy Trading
                    </h1>
                </div>

                {showSpinner ? (
                    <div className="flex flex-col items-center">
                        <Spinner size="lg" className="mb-4" />
                        <p className="text-neutral-600">Authenticating...</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-neutral-600 mb-4">
                            Please log in to your Deriv account to start copy
                            trading
                        </p>
                        <a
                            href={getOAuthURL()}
                            className="inline-block bg-brand-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                        >
                            Log in
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
