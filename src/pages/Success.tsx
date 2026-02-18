import React, { useEffect, useState } from 'react';

const Success = () => {
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        // Poll your backend to see if the ITN updated the status
        const interval = setInterval(async () => {
            const res = await fetch('https://192.168.1.39/api/order/1');
            const data = await res.json();
            if (data.status === 'PAID') {
                setVerified(true);
                clearInterval(interval);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center mt-20">
            <div className={`p-10 rounded-full ${verified ? 'bg-green-100' : 'bg-blue-100'} animate-pulse`}>
                {verified ? "✅" : "⏳"}
            </div>
            <h1 className="text-3xl font-bold mt-6">
                {verified ? "Payment Confirmed!" : "Verifying Payment..."}
            </h1>
        </div>
    );
};

export default Success;