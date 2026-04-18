'use client';

import styles from './page.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import StatsCard from '@/components/Motivational/StatsCard';
import ProgressBar from '@/components/Motivational/ProgressBar';
import RecentSales from '@/components/Dashboard/RecentSales';
import AuthGuard from '@/components/Auth/AuthGuard';
import UpsellCard from '@/components/Motivational/UpsellCard';
import DeveloperPieChart from '@/components/Dashboard/DeveloperPieChart';
import BannerCarousel, { PrizeGoal } from '@/components/Motivational/BannerCarousel';
import PersonalGoalCard from '@/components/Motivational/PersonalGoalCard';
import TopPerformers from '@/components/Dashboard/TopPerformers';
import Achievements from '@/components/Dashboard/Achievements';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { calculateCommission, CommissionResult } from '@/utils/commission';


interface Sale {
  id: string;
  amount: number;
  product: string;
  time: string;
  quruvchi: string;
  status: string;
}

export default function Home() {
  const { operator, role } = useAuth();
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [personalGoal, setPersonalGoal] = useState<PrizeGoal | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (role === 'admin') {
      router.push('/admin');
      return;
    }

    async function fetchData() {
      if (!operator) return;

      try {
        const response = await fetch(`/api/sales?operator=${operator}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (Array.isArray(data.sales)) {
          const sortedSales = [...data.sales].sort((a, b) => {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
          });
          setSalesData(sortedSales);
          setIsUsingMock(false);
        } else {
          setIsUsingMock(true);
        }
        
        // Fetch personal goal
        const goalResponse = await fetch('/api/goals');
        const goalData = await goalResponse.json();
        if (goalData.goal) {
          setPersonalGoal(goalData.goal);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setIsUsingMock(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [operator, role, router]);


  // KPI calculations MUST use only 'tasdiqlandi' sales
  const confirmedSales = salesData.filter(s => s.status === 'tasdiqlandi');
  const currentSalesCount = confirmedSales.length;
  const currentTotalRevenue = confirmedSales.reduce((sum, sale) => sum + sale.amount, 0);
  const commissionData: CommissionResult = calculateCommission(currentSalesCount, currentTotalRevenue);

  // New logic for estimated bonus (Image 4)
  const averageCommission = currentSalesCount > 0 ? currentTotalRevenue / currentSalesCount : 0;
  const nextTierMin = commissionData.nextTier?.min || 0;
  const nextTierRate = commissionData.nextTier?.rate || 0;
  const nextTierEstimatedBonus = (averageCommission * nextTierMin) * nextTierRate;

  // New logic for Upsell (Image 5)
  const hypotheticalTotalRevenue = currentTotalRevenue * 1.5;
  const potentialShare = hypotheticalTotalRevenue * commissionData.commissionRate;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading || role === 'admin') {
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
            {(!personalGoal || isEditingGoal) ? (
              <BannerCarousel 
                onGoalSet={(goal) => {
                  const currentEdits = personalGoal ? (personalGoal as any).editCount ?? 3 : (goal as any).editCount ?? 3;
                  const newGoal = { ...goal, editCount: Math.max(0, currentEdits - (isEditingGoal ? 1 : 0)) } as PrizeGoal;
                  
                  setPersonalGoal(newGoal);
                  setIsEditingGoal(false);
                  fetch('/api/goals', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ goalData: newGoal }) 
                  }).catch(console.error);
                }} 
              />
            ) : (
              <PersonalGoalCard 
                goal={personalGoal} 
                currentKpiAmount={commissionData.commissionAmount}
                remainingEdits={(personalGoal as any).editCount ?? 3}
                onEditClick={() => setIsEditingGoal(true)}
              />
            )}
            <div className={styles.statsRow}>
              <StatsCard
                title="Shu Oy Sotuvlar"
                value={commissionData.salesCount}
                subtitle="Maqsad: 21+"
                icon="🛒"
                color="primary"
              />
              <StatsCard
                title="Sizning KPI summangiz"
                value={formatCurrency(commissionData.commissionAmount)}
                icon="💵"
                color="success"
              />
            </div>

            <section className={styles.progressSection}>
              {commissionData.nextTier ? (
                <ProgressBar
                  current={commissionData.salesCount}
                  max={commissionData.nextTier.min}
                  nextRate={commissionData.nextTier.rate * 100}
                  estimatedBonus={formatCurrency(nextTierEstimatedBonus)}
                />
              ) : (
                <div className="card">
                  <p className={styles.progressDesc}>Siz eng yuqori darajadasiz! Ajoyib!</p>
                </div>
              )}

              <UpsellCard
                currentSalesCount={currentSalesCount}
                currentTotalRevenue={currentTotalRevenue}
                currentCommission={commissionData.commissionAmount}
                potentialCommission={potentialShare}
                formatCurrency={formatCurrency}
              />
            </section>

            <section className={styles.contentRow}>
              <RecentSales
                sales={salesData}
                activeFilter={null}
                hideBuilder={true}
                hideAmount={true}
                showBuilderInstead={false}
                showKPI={true}
              />
              <div className={styles.sideWidgets}>
                <TopPerformers />
                <Achievements 
                   salesCount={currentSalesCount} 
                   totalRevenue={currentTotalRevenue} 
                />
                <DeveloperPieChart sales={salesData} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
