import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiAxios } from '../lib/axios-config';
import { getAccessToken } from '../lib/auth-utils';

interface DashboardStats {
    activeSubscriptions: number;
    newMembers: number;
    totalVideos: number;
    totalCourses: number;
    monthlyRevenue: number;
}

interface MarketStats {
    totalProducts: number;
    pdfCount: number;
    digitalCount: number;
    merchCount: number;
    totalSales: number;
    totalRevenue: number;
}

interface ActivityItem {
    id: string;
    type: 'subscription' | 'sale';
    message: string;
    date: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useDashboardStats = () => {
    const [globalStats, setGlobalStats] = useState<DashboardStats | null>(null);
    const [marketJoseStats, setMarketJoseStats] = useState<MarketStats | null>(null);
    const [marketGabrielStats, setMarketGabrielStats] = useState<MarketStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);

            const statsRes = await apiAxios.get('/dashboard/stats');
            const statsData = statsRes.data;

            setGlobalStats({
                activeSubscriptions: statsData.activeSubscriptions,
                newMembers: statsData.newMembers,
                totalVideos: statsData.totalVideos,
                totalCourses: statsData.totalCourses,
                monthlyRevenue: statsData.monthlyRevenue,
            });

            setMarketJoseStats(statsData.marketJose);
            setMarketGabrielStats(statsData.marketGabriel);

            const activityRes = await apiAxios.get('/dashboard/activity');
            const activityData = activityRes.data;
            setRecentActivity(activityData);

            setError(null);
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const token = getAccessToken();

        // WebSocket connection
        const socket: Socket = io(`${API_URL}/dashboard`, {
            auth: {
                token: token ? `Bearer ${token}` : null
            },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to dashboard websocket');
        });

        socket.on('dashboard-update', () => {
            console.log('Dashboard update received');
            fetchData();
        });

        socket.on('connect_error', (err: any) => {
            console.error('WebSocket connection error:', err);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return {
        globalStats,
        marketJoseStats,
        marketGabrielStats,
        recentActivity,
        loading,
        error,
        refresh: fetchData
    };
};
