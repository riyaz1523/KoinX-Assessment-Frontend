import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [trades, setTrades] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setTrades([]);
        
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
                setTrades(response.data);
            } else {
                setMessage(response.data);
            }
        } catch (err) {
            setError('Error processing file. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const parseMarket = (market) => {
        const [baseCoin, quoteCoin] = market.split('/');
        return { baseCoin, quoteCoin };
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Upload Cryptocurrency Trades CSV</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block mb-2"
                    accept=".csv"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Upload
                </button>
            </form>
            {loading && <div className="mb-4">Processing...</div>}
            {error && <div className="mb-4 text-red-500">{error}</div>}
            {message && <div className="mb-4 text-green-500">{message}</div>}
            {trades.length > 0 && (
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
                            const { baseCoin, quoteCoin } = parseMarket(trade.Market);
                            return (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{trade.UTC_Time}</td>
                                    <td className="border px-4 py-2">{trade.Operation}</td>
                                    <td className="border px-4 py-2">{baseCoin}</td>
                                    <td className="border px-4 py-2">{quoteCoin}</td>
                                    <td className="border px-4 py-2">{trade['Buy/Sell Amount']}</td>
                                    <td className="border px-4 py-2">{trade.Price}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FileUpload;
