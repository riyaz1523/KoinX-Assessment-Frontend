import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newTrades, setNewTrades] = useState([]);
    const [trades, setTrades] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!file) {
            setError('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/trades/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Backend Response:', response.data);
            if (Array.isArray(response.data)) {
                setNewTrades(response.data);
            } else {
                setMessage(response.data);
            }
            // After successful upload, reload the page to fetch updated data
            window.location.reload();
        } catch (err) {
            setError('Error processing file. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/trades`);
                setTrades(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching trades:', error);
                setError('Error fetching trades from server.');
            } finally {
                setLoading(false); // Ensure loading state is set to false after fetching
            }
        };

        fetchTrades();
    }, []); // Empty dependency array to fetch trades only once on component mount

    useEffect(() => {
        if (newTrades.length > 0) {
            // Append new trades to the existing trades array
            setTrades(prevTrades => [...prevTrades, ...newTrades]);
            setNewTrades([]); // Clear new trades after appending
        }
    }, [newTrades]);

    const parseMarket = (market) => {
        if (!market) {
            return { baseCoin: '', quoteCoin: '' }; 
        }
        const [baseCoin, quoteCoin] = market.split('/');
        return { baseCoin, quoteCoin };
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Upload Cryptocurrency Trades CSV</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex items-center space-x-4 mb-2">
                    <label className="text-gray-700">Select CSV file:</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="py-2 px-3 border border-gray-300 rounded"
                        accept=".csv"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Upload
                    </button>
                </div>
            </form>
            {loading && <div className="mb-4">Processing...</div>}
            {error && <div className="mb-4 text-red-500">{error}</div>}
            {message && <div className="mb-4 text-green-500">{message}</div>}
            {trades.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">UTC Time</th>
                                <th className="px-4 py-2">Operation</th>
                                <th className="px-4 py-2">Base Coin</th>
                                <th className="px-4 py-2">Quote Coin</th>
                                <th className="px-4 py-2">Amount</th>
                                <th className="px-4 py-2">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map((trade, index) => {
                                const { base_coin, quote_coin } = trade; // Ensure these fields match the backend response
                                const { baseCoin, quoteCoin } = parseMarket(`${base_coin}/${quote_coin}`);
                                return (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{new Date(trade.utc_time).toLocaleString()}</td>
                                        <td className="border px-4 py-2">{trade.operation}</td>
                                        <td className="border px-4 py-2">{baseCoin}</td>
                                        <td className="border px-4 py-2">{quoteCoin}</td>
                                        <td className="border px-4 py-2">{trade.amount}</td>
                                        <td className="border px-4 py-2">{trade.price}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
