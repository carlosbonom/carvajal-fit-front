import { useState, useEffect } from 'react';
import { apiAxios } from '../lib/axios-config';

interface RevenueData {
    month: string;
    amount: number;
}

interface SubscriptionData {
    month: string;
    new: number;
    cancelled: number;
}

interface ReportsData {
    revenueData: RevenueData[];
    subscriptionData: SubscriptionData[];
}

export const useReportsData = () => {
    const [data, setData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await apiAxios.get('/dashboard/reports');
            setData(res.data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching reports data:', err);
            setError(err.message || 'Error al cargar reporte');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        loading,
        error,
        refresh: fetchData
    };
};
