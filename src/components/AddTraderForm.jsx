import { useState } from "react";
import { Text, Button, TextField } from "@deriv-com/quill-ui";
import PropTypes from "prop-types";

const AddTraderForm = ({ onAddTrader }) => {
    const [traderData, setTraderData] = useState({
        token: "",
        isCopying: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Get existing traders from localStorage or initialize empty array
        const existingTraders = JSON.parse(
            localStorage.getItem("traders") || "[]"
        );

        const updatedTraders = [...existingTraders, traderData];
        localStorage.setItem("traders", JSON.stringify(updatedTraders));
        onAddTrader?.(traderData);

        // Clear form after submission
        setTraderData({ token: "", isCopying: false });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTraderData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
            <Text size="xl" bold className="mb-4">
                Add New Trader
            </Text>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <TextField
                            label="Trading Token"
                            name="token"
                            value={traderData.token}
                            onChange={handleChange}
                            placeholder="Enter trading token"
                            required
                        />
                    </div>
                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!traderData.token.trim()}
                        >
                            Start Copying
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

AddTraderForm.propTypes = {
    onAddTrader: PropTypes.func,
};

export default AddTraderForm;
