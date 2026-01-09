'use client';

import styles from './page.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import StatsCard from '@/components/Motivational/StatsCard';
import ProgressBar from '@/components/Motivational/ProgressBar';
import RecentSales from '@/components/Dashboard/RecentSales';
import AuthGuard from '@/components/Auth/AuthGuard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateCommission, CommissionResult } from '@/utils/commission';

interface Sale {
  id: string;
  amount: number;
  product: string;
  time: string;
}

export default function Home() {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const operator = localStorage.getItem('operator');

        if (operator?.toLowerCase() === 'admin') {
          router.push('/admin');
          return;
        }

        const response = await fetch(`/api/sales?operator=${operator}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // If data.sales exists (even if empty), use real data
        if (Array.isArray(data.sales)) {
          setSalesData(data.sales);
          setIsUsingMock(false);
        } else {
          setIsUsingMock(true);
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
        setIsUsingMock(true); // Only use mock if there's an actual error
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const currentSalesCount = salesData.length;
  const currentTotalRevenue = salesData.reduce((sum, sale) => sum + sale.amount, 0);
  const commissionData: CommissionResult = calculateCommission(currentSalesCount, currentTotalRevenue);

  const currentRatePercent = (commissionData.commissionRate * 100).toFixed(0) + '%';
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Yuklanmoqda...</div>;
  }

  return (
    <AuthGuard>
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <Header />

          {isUsingMock && (
            <div style={{
              padding: '0.5rem 1rem',
              background: '#fff3cd',
              color: '#856404',
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #ffeeba'
            }}>
              ⚠️ Mock ma'lumotlar ko'rsatilmoqda. Haqiqiy ma'lumotlarni ko'rish uchun Google Sheets kalitlarini .env.local ga qo'shing.
            </div>
          )}

          <div className={`animate-fade-in ${styles.dashboardGrid}`}>
            <div className={styles.statsRow}>
              <StatsCard
                title="Shu Oy Sotuvlar"
                value={commissionData.salesCount}
                subtitle="Maqsad: 21+"
                icon="🛒"
                color="primary"
              />
              <StatsCard
                title="Komissiya Foizi"
                value={currentRatePercent}
                subtitle={`Keyingi Daraja: ${(commissionData.nextTier?.rate || 0) * 100}%`}
                icon="📈"
                color="accent"
                trend={commissionData.commissionRate > 0.05 ? "Yuqori!" : "Standart"}
              />
              <StatsCard
                title="Jami Sotuv"
                value={formatCurrency(commissionData.totalRevenue)}
                icon="💰"
                color="success"
              />
              <StatsCard
                title="Sizning Komissiyangiz"
                value={formatCurrency(commissionData.commissionAmount)}
                icon="💵"
                color="success"
                subtitle="Taxminiy daromad"
              />
            </div>

            <section className={styles.progressSection}>
              <div className="card">
                <h3>Keyingi Darajaga O'tish</h3>
                <p className={styles.progressDesc}>
                  {commissionData.nextTier ?
                    `Yana ${commissionData.salesToNextTier} ta sotsangiz ${(commissionData.nextTier.rate * 100)}% komissiyaga erishasiz!`
                    : "Siz eng yuqori darajadasiz! Ajoyib!"}
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <ProgressBar
                    current={commissionData.salesCount}
                    max={commissionData.nextTier ? commissionData.nextTier.min : 30}
                    label="Keyingi Darajaga"
                  />
                </div>
              </div>
            </section>

            <section className={styles.contentRow}>
              <RecentSales sales={salesData} />
            </section>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
