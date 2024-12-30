export const OAUTH_CONFIG = {
    app_id: '36545',
    base_url: 'https://oauth.deriv.com/oauth2/authorize',
    params: {
        l: 'en',
        brand: 'deriv',
        date_first_contact: '2024-01-18',
        signup_device: 'desktop',
        utm_source: 'null'
    }
};

export const getOAuthURL = () => {
    const params = new URLSearchParams({
        app_id: OAUTH_CONFIG.app_id,
        ...OAUTH_CONFIG.params
    });
    return `${OAUTH_CONFIG.base_url}?${params.toString()}`;
};
