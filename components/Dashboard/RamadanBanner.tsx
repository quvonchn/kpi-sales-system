'use client';

import React, { useState, useEffect } from 'react';
import styles from './RamadanBanner.module.css';

export default function RamadanBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setIsAnimating(true), 100);
    }, []);

    const handleDismiss = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <div className={`${styles.banner} ${isAnimating ? styles.bannerVisible : ''}`}>
            {/* Background decorative stars */}
            <div className={styles.bgStars}>
                <span className={styles.bgStar} style={{ top: '15%', left: '5%', animationDelay: '0s' }} />
                <span className={styles.bgStar} style={{ top: '60%', left: '15%', animationDelay: '0.5s' }} />
                <span className={styles.bgStar} style={{ top: '25%', left: '35%', animationDelay: '1s' }} />
                <span className={styles.bgStar} style={{ top: '70%', left: '55%', animationDelay: '0.3s' }} />
                <span className={styles.bgStar} style={{ top: '20%', right: '25%', animationDelay: '0.8s' }} />
                <span className={styles.bgStar} style={{ top: '65%', right: '10%', animationDelay: '1.2s' }} />
            </div>

            <div className={styles.content}>
                <div className={styles.leftSection}>
                    {/* Premium Moon Image */}
                    <div className={styles.premiumMoonContainer}>
                        <img
                            src="/moon_premium.png"
                            alt=""
                            className={styles.premiumMoon}
                        />
                    </div>
                    <div className={styles.textContent}>
                        <h3 className={styles.greetingTitle}>Ramazon oyi muborak! 🌙</h3>
                        <p className={styles.greetingSubtitle}>
                            Muborak oy sizga baraka va omad keltirsin!
                        </p>
                    </div>
                </div>

                <div className={styles.rightSection}>
                    {/* Premium Lantern Image */}
                    <img
                        src="/lantern_premium.png"
                        alt=""
                        className={styles.premiumLantern}
                    />
                    <button
                        className={styles.dismissBtn}
                        onClick={handleDismiss}
                        aria-label="Yopish"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
}
