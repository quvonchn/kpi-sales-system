'use client';

import React, { useState, useEffect } from 'react';
import styles from './BannerCarousel.module.css';
import { ArrowUpRight } from 'lucide-react';

import GoalsSelectionModal from './GoalsSelectionModal';

export interface PrizeGoal {
  id: string;
  name: string;
  priceUzs: number;
  imageUrl: string;
  source: 'Uzum Market' | 'Yandex' | 'Custom';
  estimatedSalesNeeded?: number; // optional
}

export const MOCK_CATALOG: PrizeGoal[] = [
  {
    id: '1',
    name: "Guess Sumka",
    priceUzs: 1500000,
    imageUrl: "https://cdn-icons-png.flaticon.com/512/3255/3255050.png",
    source: 'Uzum Market',
    estimatedSalesNeeded: 6
  },
  {
    id: '2',
    name: "Apple AirPods 3",
    priceUzs: 2400000,
    imageUrl: "https://cdn-icons-png.flaticon.com/512/3859/3859106.png",
    source: 'Uzum Market',
    estimatedSalesNeeded: 9
  },
  {
    id: '3',
    name: "Yandex Stansiya Lite",
    priceUzs: 750000,
    imageUrl: "https://cdn-icons-png.flaticon.com/512/6580/6580556.png",
    source: 'Yandex',
    estimatedSalesNeeded: 3
  },
  {
    id: '4',
    name: "Dior Parfyum",
    priceUzs: 1200000,
    imageUrl: "https://cdn-icons-png.flaticon.com/512/1004/1004733.png",
    source: 'Uzum Market',
    estimatedSalesNeeded: 5
  }
];

interface BannerCarouselProps {
  onGoalSet?: (goal: PrizeGoal) => void;
}

export default function BannerCarousel({ onGoalSet }: BannerCarouselProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personalGoal, setPersonalGoal] = useState<PrizeGoal | null>(null);
  const [catalog, setCatalog] = useState<PrizeGoal[]>(MOCK_CATALOG);

  useEffect(() => {
    fetch('/api/prizes')
      .then(res => res.json())
      .then(data => {
        if (data.prizes && data.prizes.length > 0) {
          setCatalog(data.prizes);
        }
      })
      .catch(console.error);
  }, []);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (catalog.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % catalog.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [catalog.length]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleSetGoal = (e: React.MouseEvent, goal?: PrizeGoal) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleGoalSelected = (goal: Partial<PrizeGoal>) => {
    const fullGoal = goal as PrizeGoal;
    setPersonalGoal(fullGoal);
    if (onGoalSet) {
      onGoalSet(fullGoal);
    } else {
      // Fallback alert if onGoalSet is not provided
      alert(`Zo'r tanlov: ${goal.name}! Endi dashboard maqsadga qarab ishlaydi.`);
    }
  };

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.orbTwo} />
      <div className={styles.shimmerBorder} />
      {catalog.length > 0 && catalog.map((item, index) => {
        const isActive = index === currentIndex;
        return (
          <div 
            key={item.id} 
            className={`${styles.slide} ${isActive ? styles.active : ''}`}
            aria-hidden={!isActive}
          >
            <div className={styles.contentWrapper}>
              <div className={styles.imageBox}>
                <span className={styles.badge}>{item.source}</span>
                <img src={item.imageUrl} alt={item.name} />
              </div>
              
              <div className={styles.textContent}>
                <span className={styles.topText}>MAQSAD QO'YING — OLING!</span>
                <h3 className={styles.title}>{item.name}</h3>
                <p className={styles.subtitle}>O'zingizning sof KPI daromadingiz hisobiga!</p>
              </div>
            </div>

            <div className={styles.priceSection}>
              <div>
                <p className={styles.price}>{item.priceUzs.toLocaleString()} UZS</p>
                <p className={styles.salesNeeded}>Atigi ~{item.estimatedSalesNeeded} ta uy sotsangiz</p>
              </div>
              <button 
                className={styles.actionBtn}
                onClick={(e) => handleSetGoal(e, item)}
              >
                Maqsad qo'y <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        );
      })}

      <div className={styles.dots}>
        {catalog.map((_, index) => (
          <div 
            key={index} 
            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>

      <GoalsSelectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        catalog={catalog}
        onSelectGoal={handleGoalSelected}
      />
    </div>
  );
}
