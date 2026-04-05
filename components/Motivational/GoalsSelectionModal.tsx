'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './GoalsSelectionModal.module.css';
import { X } from 'lucide-react';
import { PrizeGoal } from './BannerCarousel';

interface GoalsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: PrizeGoal[];
  onSelectGoal: (goal: Partial<PrizeGoal>) => void;
}

export default function GoalsSelectionModal({ isOpen, onClose, catalog, onSelectGoal }: GoalsSelectionModalProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [selectedCatalogGoal, setSelectedCatalogGoal] = useState<PrizeGoal | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Custom goal state
  const [customLink, setCustomLink] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirmCatalog = () => {
    if (selectedCatalogGoal) {
      onSelectGoal(selectedCatalogGoal);
      onClose();
    }
  };

  const handleConfirmCustom = () => {
    if (customLink && customName && customPrice) {
      let finalImageUrl = customLink;
      const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(customLink);
      
      // If the link is just an Uzum or Yandex product page link, not a direct image URL
      if (!isDirectImage) {
        finalImageUrl = 'https://cdn-icons-png.flaticon.com/512/3768/3768393.png'; // Golden Gift Box Placeholder
      }

      onSelectGoal({
        id: 'custom_' + Date.now(),
        name: customName,
        priceUzs: Number(customPrice.replace(/[^0-9]/g, '')),
        imageUrl: finalImageUrl,
        source: 'Custom',
      });
      onClose();
    }
  };

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Maqsad belgilash</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'catalog' ? styles.active : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            Katalogdan tanlash
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            O'zim link beraman
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'catalog' ? (
            <div className={styles.grid}>
              {catalog.map(item => (
                <div 
                  key={item.id} 
                  className={`${styles.card} ${selectedCatalogGoal?.id === item.id ? styles.selected : ''}`}
                  onClick={() => setSelectedCatalogGoal(item)}
                >
                  <div className={styles.cardImage}>
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className={styles.cardDetails}>
                    <h4 className={styles.cardTitle}>{item.name}</h4>
                    <p className={styles.cardPrice}>{item.priceUzs.toLocaleString()} UZS</p>
                    <p className={styles.cardSource}>{item.source}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.customForm}>
              <div className={styles.inputGroup}>
                <label>Maxsulot nomi</label>
                <input 
                  type="text" 
                  placeholder="Masalan: iPhone 15 Pro, 256GB" 
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Uzum yoki Yandexdan link (rasm yoki sahifa)</label>
                <input 
                  type="text" 
                  placeholder="https://uzum.uz/..." 
                  value={customLink}
                  onChange={e => setCustomLink(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Narxi (UZS)</label>
                <input 
                  type="text" 
                  placeholder="15000000" 
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                />
                <p className={styles.helperText}>Iltimos, aniq narxni tirqishlarsiz kiriting.</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {activeTab === 'catalog' ? (
            <button 
              className={styles.confirmBtn} 
              disabled={!selectedCatalogGoal}
              onClick={handleConfirmCatalog}
            >
              Ushbu maqsadni tasdiqlash
            </button>
          ) : (
            <button 
              className={styles.confirmBtn}
              disabled={!customName || !customPrice || !customLink}
              onClick={handleConfirmCustom}
            >
              Yangi maqsad yaratish
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
