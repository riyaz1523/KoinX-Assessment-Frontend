import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newTrades, setNewTrades] = useState([]);
    const [trades, setTrades] = useState([]);
    const [timestamp, setTimestamp] = useState('');
    const [balances, setBalances] = useState({});

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

    const handleTimestampChange = (e) => {
        setTimestamp(e.target.value);
    };

    const handleCalculateBalances = async (e) => {
        e.preventDefault();
        setError('');
        setBalances({});

        if (!timestamp) {
            setError('Please enter a timestamp.');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/balance`, { timestamp });
            setBalances(response.data);
        } catch (err) {
            setError('Error calculating balances. Please try again.');
            console.error('Error:', err);
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
                <div className="overflow-x-auto mb-4">
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
                                return (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{new Date(trade.utc_time).toLocaleString()}</td>
                                        <td className="border px-4 py-2">{trade.operation}</td>
                                        <td className="border px-4 py-2">{base_coin}</td>
                                        <td className="border px-4 py-2">{quote_coin}</td>
                                        <td className="border px-4 py-2">{trade.amount}</td>
                                        <td className="border px-4 py-2">{trade.price}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <form onSubmit={handleCalculateBalances} className="mb-4">
                <div className="flex items-center space-x-4 mb-2">
                    <label className="text-gray-700">Enter Timestamp (YYYY-MM-DD HH:mm:ss):</label>
                    <input
                        type="text"
                        value={timestamp}
                        onChange={handleTimestampChange}
                        className="py-2 px-3 border border-gray-300 rounded"
                        placeholder="YYYY-MM-DD HH:mm:ss"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Calculate Balances
                    </button>
                </div>
            </form>
            {Object.keys(balances).length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-2">Calculated Balances</h2>
                    <ul>
                        {Object.entries(balances).map(([coin, balance]) => (
                            <li key={coin} className="mb-1">
                                {coin}: {balance}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
