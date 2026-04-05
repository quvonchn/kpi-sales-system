'use client';

import React from 'react';
import styles from './PersonalGoalCard.module.css';
import { PrizeGoal } from './BannerCarousel';
import { Edit2 } from 'lucide-react';

interface PersonalGoalCardProps {
  goal: PrizeGoal;
  currentKpiAmount: number;
  onEditClick?: () => void;
  remainingEdits?: number;
}

export default function PersonalGoalCard({ goal, currentKpiAmount, onEditClick, remainingEdits = 3 }: PersonalGoalCardProps) {
  const progressPercentage = Math.min(100, Math.round((currentKpiAmount / goal.priceUzs) * 100));
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
  };

  const isNearingGoal = progressPercentage >= 85 && progressPercentage < 100;
  const isGoalReached = progressPercentage >= 100;

  return (
    <div className={styles.card}>
      <div className={styles.purpleOrb} />
      <div className={styles.shimmerBorder} />
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div style={{ flex: 1 }}>
            <div className={styles.titleRow}>
              <h4 className={styles.title}>Mening maqsadim</h4>
              {onEditClick && (
                <button 
                  className={styles.editBtn} 
                  onClick={onEditClick}
                  disabled={remainingEdits <= 0}
                  title={remainingEdits > 0 ? "Maqsadni o'zgartirish" : "O'zgartirish limiti tugadi"}
                >
                  <Edit2 size={14} /> 
                  Qayta tanlash
                  {remainingEdits > 0 && <span className={styles.editBadge}>{remainingEdits}</span>}
                </button>
              )}
            </div>
            <div className={styles.goalInfo}>
              <div className={styles.imageBox}>
                <img src={goal.imageUrl} alt={goal.name} />
              </div>
              <div className={styles.goalDetails}>
                <h3>{goal.name}</h3>
                <p>{formatCurrency(goal.priceUzs)} UZS</p>
              </div>
            </div>
          </div>
          <p className={styles.percentage}>{progressPercentage}%</p>
        </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>
        
        <div className={styles.progressStats}>
          <p className={styles.earned}>
            <span>{formatCurrency(currentKpiAmount)} UZS</span> yig'ildi
          </p>
          {!isGoalReached && (
            <p className={styles.remaining}>
              Yana {formatCurrency(goal.priceUzs - currentKpiAmount)} UZS kerak
            </p>
          )}
        </div>
      </div>

      {isNearingGoal && (
        <div className={styles.alertBox}>
          Barakalla! Maqsadingizga juda yaqinlashdingiz — yana ozgina harakat qiling va {goal.name} sizniki!
        </div>
      )}

      {isGoalReached && (
        <div className={styles.alertBox} style={{ background: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f', borderColor: 'rgba(241, 196, 15, 0.4)' }}>
          Tabriklaymiz! Siz o'z maqsadingizga yetdingiz! Endi joriy KPI hisobiga ushbu maxsulotni xarid qilishingiz mumkin.
        </div>
      )}
      </div>
    </div>
  );
}
