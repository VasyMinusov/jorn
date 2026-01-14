import { useEffect, useRef, useState, useMemo } from "react";
import type { Shooting } from "../types";
import styles from "../styles/HitViewer.module.css";

type Props = {
  shootings: Shooting[]; // Все выбранные стрельбы
  onClose: () => void;
};

export default function HitViewer({
  shootings,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLCanvasElement>(null);
  const heatRef = useRef<HTMLCanvasElement>(null);
  const centerRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);

  const [alphaHeat, setAlphaHeat] = useState(0.7);
  const [alphaCenter, setAlphaCenter] = useState(0.5);
  const [alphaDots, setAlphaDots] = useState(0.8);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [targetSize, setTargetSize] = useState({ width: 800, height: 800 });
  
  // Локальное состояние - ВСЕ ID изначально выбраны
  const [visibleIds, setVisibleIds] = useState<Set<number>>(
    new Set(shootings.map(sh => sh.id))
  );

  // Кэш размеров мишени по URL
  const targetSizeCache = useRef<Record<string, { width: number; height: number; offsetX: number; offsetY: number }>>({});

  // Стрельбы, которые отображаются на мишени
  const visibleShootings = useMemo(() => {
    return shootings.filter(sh => visibleIds.has(sh.id));
  }, [shootings, visibleIds]);

  // Переключение видимости
  const toggleVisibility = (id: number) => {
    setVisibleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Выбрать все / снять все
  const handleSelectAll = () => {
    if (visibleIds.size === shootings.length) {
      // Снять все
      setVisibleIds(new Set());
    } else {
      // Выбрать все
      setVisibleIds(new Set(shootings.map(sh => sh.id)));
    }
  };

  // Расчет размеров контейнера мишени
  useEffect(() => {
    const updateTargetSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        const targetHeight = Math.min(containerHeight * 0.9, 800);
        const targetWidth = targetHeight;
        
        setTargetSize({ width: targetWidth, height: targetHeight });
      }
    };

    updateTargetSize();
    window.addEventListener('resize', updateTargetSize);
    
    return () => {
      window.removeEventListener('resize', updateTargetSize);
    };
  }, []);

  // Функция получения размеров и смещений с кэшированием
  const getTargetSize = (imgUrl: string, containerWidth: number, containerHeight: number) => {
    const cacheKey = `${imgUrl}_${containerWidth}_${containerHeight}`;
    
    if (targetSizeCache.current[cacheKey]) {
      return targetSizeCache.current[cacheKey];
    }

    const img = new Image();
    img.src = `${import.meta.env.VITE_API_URL}${imgUrl}`;
    if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
      const size = Math.min(containerWidth, containerHeight);
      return { width: size, height: size, offsetX: (containerWidth - size) / 2, offsetY: (containerHeight - size) / 2 };
    }

    const containerSize = Math.min(containerWidth, containerHeight);
    const scale = Math.min(
      containerSize / img.naturalWidth,
      containerSize / img.naturalHeight
    );
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;
    const offsetX = (containerWidth - drawWidth) / 2;
    const offsetY = (containerHeight - drawHeight) / 2;

    const size = { width: drawWidth, height: drawHeight, offsetX, offsetY };
    targetSizeCache.current[cacheKey] = size;
    return size;
  };

  // Загрузка изображения
  const loadImage = async (imgUrl: string) => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${imgUrl}`));
      img.src = `${import.meta.env.VITE_API_URL}${imgUrl}`;
      img.crossOrigin = "anonymous";
    });
    return img;
  };

  // Предзагрузка мишени
  useEffect(() => {
    if (!shootings.length) return;

    const load = async () => {
      try {
        const imgUrl = shootings[0].exercise.target_url;
        await loadImage(imgUrl);
        Object.keys(targetSizeCache.current).forEach(key => {
          if (key.startsWith(imgUrl)) {
            delete targetSizeCache.current[key];
          }
        });
        setImageLoaded(true);
      } catch (error) {
        console.error("Error loading image:", error);
      }
    };

    load();
  }, [shootings]);

  // Рисуем мишень как фон
  useEffect(() => {
    if (!shootings.length || !imageLoaded || !containerRef.current) return;

    const canvas = targetRef.current;
    if (canvas && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const ctx = canvas.getContext("2d")!;
      if (!ctx) return;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      ctx.scale(dpr, dpr);
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      const img = new Image();
      img.src = `${import.meta.env.VITE_API_URL}${shootings[0].exercise.target_url}`;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const { offsetX, offsetY, width, height: drawHeight } = getTargetSize(
          shootings[0].exercise.target_url, 
          containerWidth, 
          containerHeight
        );
        ctx.drawImage(img, offsetX, offsetY, width, drawHeight);
      };
    }
  }, [shootings, imageLoaded, targetSize]);

  /* ---------- ТОЧКИ ---------- */
  useEffect(() => {
    if (!imageLoaded || !dotsRef.current || !containerRef.current) return;

    const canvas = dotsRef.current;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    
    ctx.globalAlpha = alphaDots;

    visibleShootings.forEach((sh) => {
      const pts: { x: number; y: number }[] = JSON.parse(sh.canvas_json);
      const { offsetX, offsetY, width, height: imgHeight } = getTargetSize(
        sh.exercise.target_url, 
        containerWidth, 
        containerHeight
      );

      pts.forEach((p) => {
        const x = offsetX + p.x * width;
        const y = offsetY + p.y * imgHeight;
        
        const distance = Math.sqrt(Math.pow(p.x - 0.5, 2) + Math.pow(p.y - 0.5, 2));
        if (distance < 0.1) {
          ctx.fillStyle = "#ef4444";
        } else if (distance < 0.2) {
          ctx.fillStyle = "#f97316";
        } else if (distance < 0.3) {
          ctx.fillStyle = "#eab308";
        } else if (distance < 0.4) {
          ctx.fillStyle = "#84cc16";
        } else {
          ctx.fillStyle = "#22c55e";
        }
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });
  }, [visibleShootings, imageLoaded, alphaDots, targetSize]);

  /* ---------- ТЕПЛОВАЯ КАРТА ---------- */
  useEffect(() => {
    if (!imageLoaded || !heatRef.current || !containerRef.current) return;

    const canvas = heatRef.current;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    const allPoints = visibleShootings.flatMap((sh) =>
      JSON.parse(sh.canvas_json) as { x: number; y: number }[]
    );
    if (!allPoints.length) return;

    const pointsWithUrl: { p: { x: number; y: number }; url: string }[] = [];
    visibleShootings.forEach((sh) => {
      const pts: { x: number; y: number }[] = JSON.parse(sh.canvas_json);
      pts.forEach((p) => {
        pointsWithUrl.push({ p, url: sh.exercise.target_url });
      });
    });

    const scaledPoints = pointsWithUrl.map(({ p, url }) => {
      const { offsetX, offsetY, width, height: imgHeight } = getTargetSize(
        url, 
        containerWidth, 
        containerHeight
      );
      return {
        x: offsetX + p.x * width,
        y: offsetY + p.y * imgHeight,
      };
    });

    const cluster = Math.max(10, Math.min(containerWidth, containerHeight) * 0.02);
    const map = new Map<string, number>();
    scaledPoints.forEach((pt) => {
      const key = `${Math.floor(pt.x / cluster)}_${Math.floor(pt.y / cluster)}`;
      map.set(key, (map.get(key) || 0) + 1);
    });

    if (map.size === 0) return;

    const maxCount = Math.max(...map.values());
    
    map.forEach((cnt, key) => {
      const [cx, cy] = key.split("_").map(Number);
      const x = cx * cluster + cluster / 2;
      const y = cy * cluster + cluster / 2;
      const radius = cluster * 2;
      
      const t = cnt / maxCount;
      const r = Math.round(255 * t);
      const g = Math.round(128 * (1 - t));
      const b = Math.round(64 * (1 - t));
      
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alphaHeat})`);
      grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alphaHeat * 0.5})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [visibleShootings, alphaHeat, imageLoaded, targetSize]);

  /* ---------- ЦЕНТР ПРИЦЕЛИВАНИЯ ---------- */
  useEffect(() => {
    if (!imageLoaded || !centerRef.current || !containerRef.current) return;

    const canvas = centerRef.current;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    const allPoints = visibleShootings.flatMap((sh) =>
      JSON.parse(sh.canvas_json) as { x: number; y: number }[]
    );
    if (!allPoints.length) return;

    const pointsWithUrl: { p: { x: number; y: number }; url: string }[] = [];
    visibleShootings.forEach((sh) => {
      const pts: { x: number; y: number }[] = JSON.parse(sh.canvas_json);
      pts.forEach((p) => {
        pointsWithUrl.push({ p, url: sh.exercise.target_url });
      });
    });

    const scaledPoints = pointsWithUrl.map(({ p, url }) => {
      const { offsetX, offsetY, width, height: imgHeight } = getTargetSize(
        url, 
        containerWidth, 
        containerHeight
      );
      return {
        x: offsetX + p.x * width,
        y: offsetY + p.y * imgHeight,
      };
    });

    const cx = scaledPoints.reduce((s, pt) => s + pt.x, 0) / scaledPoints.length;
    const cy = scaledPoints.reduce((s, pt) => s + pt.y, 0) / scaledPoints.length;
    const radius = Math.max(
      ...scaledPoints.map((pt) => Math.hypot(pt.x - cx, pt.y - cy))
    ) || Math.min(containerWidth, containerHeight) * 0.1;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(255,255,0,${alphaCenter})`);
    grad.addColorStop(0.3, `rgba(255,128,0,${alphaCenter * 0.7})`);
    grad.addColorStop(0.7, `rgba(255,0,0,${alphaCenter * 0.4})`);
    grad.addColorStop(1, "rgba(0,0,255,0)");

    ctx.globalAlpha = 1;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = `rgba(255,255,255,${alphaCenter})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy);
    ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15);
    ctx.lineTo(cx, cy + 15);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alphaCenter})`;
    ctx.fill();
  }, [visibleShootings, alphaCenter, imageLoaded, targetSize]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Анализ попаданий</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.threeColumnLayout}>
          {/* Левая колонка - все стрельбы */}
          <div className={styles.leftColumn}>
            <div className={styles.shootingsHeader}>
              <h4 className={styles.shootingsTitle}>Стрельбы для анализа</h4>
              <span className={styles.shootingsCount}>({shootings.length})</span>
              <div className={styles.activeCount}>
                Видимых: {visibleIds.size}
              </div>
            </div>

            {shootings.length === 0 ? (
              <div className={styles.emptyShootings}>
                <div className={styles.emptyIcon}>🎯</div>
                <p className={styles.emptyText}>Нет выбранных стрельб</p>
                <p className={styles.emptyHint}>Вернитесь к таблице и выберите стрельбы для анализа</p>
              </div>
            ) : (
              <>
                <div className={styles.shootingsList}>
                  {shootings.map((sh) => {
                    if (!sh.student || !sh.exercise) {
                      return (
                        <div key={sh.id} className={styles.errorItem}>
                          <div className={styles.errorIcon}>⚠️</div>
                          <div className={styles.errorText}>
                            Отсутствуют данные о студенте или упражнении
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={sh.id} 
                        className={`${styles.shootingItem} ${visibleIds.has(sh.id) ? styles.selected : styles.inactive}`}
                        onClick={() => toggleVisibility(sh.id)}
                      >
                        <div className={styles.itemCheckbox}>
                          <input
                            type="checkbox"
                            checked={visibleIds.has(sh.id)}
                            onChange={() => toggleVisibility(sh.id)}
                            className={styles.checkbox}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className={styles.itemContent}>
                          <div className={styles.itemHeader}>
                            <span className={styles.studentName}>{sh.student.username}</span>
                            <span className={styles.exerciseName}>{sh.exercise.name}</span>
                          </div>
                          <div className={styles.itemDetails}>
                            <span className={styles.date}>
                              {new Date(sh.created_at).toLocaleDateString("ru-RU")}
                            </span>
                            <span className={styles.time}>
                              {new Date(sh.created_at).toLocaleTimeString("ru-RU", { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <div className={styles.itemStats}>
                            <span className={styles.stat}>
                              <span className={styles.statIcon}>🎯</span>
                              {sh.hits_count}/{sh.exercise.max_hits}
                            </span>
                            <span className={styles.stat}>
                              <span className={styles.statIcon}>⏱️</span>
                              {sh.time_spent}с
                            </span>
                            {sh.group && (
                              <span className={styles.groupTag}>
                                {sh.group.name}
                              </span>
                            )}
                            {!visibleIds.has(sh.id) && (
                              <span className={styles.inactiveBadge}>
                                Скрыто
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.actionsFooter}>
                  <button 
                    className={styles.selectAllBtn}
                    onClick={handleSelectAll}
                  >
                    {visibleIds.size === shootings.length ? 'Снять все' : 'Выбрать все'}
                  </button>
                  <button 
                    className={styles.exportBtn}
                    onClick={() => {
                      // Экспортируем только видимые стрельбы
                      const exportData = visibleShootings;
                      alert(`Экспорт ${exportData.length} видимых стрельб`);
                    }}
                  >
                    <span className={styles.exportIcon}>📥</span>
                    Экспорт ({visibleShootings.length})
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Центральная колонка - мишень */}
          <div className={styles.centerColumn}>
            <div className={styles.targetContainer} ref={containerRef}>
              <canvas ref={targetRef} className={styles.targetCanvas} />
              <canvas ref={heatRef} className={styles.heatCanvas} />
              <canvas ref={centerRef} className={styles.centerCanvas} />
              <canvas ref={dotsRef} className={styles.dotsCanvas} />
            </div>
            <div className={styles.targetInfo}>
              Отображается: {visibleShootings.length} из {shootings.length} стрельб
            </div>
          </div>

          {/* Правая колонка - настройки */}
          <div className={styles.rightColumn}>
            <div className={styles.heatmapWidgets}>
              <div className={styles.widgetCard}>
                <h4 className={styles.widgetTitle}>Настройки отображения</h4>
                
                <div className={styles.sliderGroup}>
                  <div className={styles.sliderControl}>
                    <label className={styles.sliderLabel}>
                      <span>Яркость точек</span>
                      <span className={styles.sliderValue}>{Math.round(alphaDots * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={alphaDots}
                      onChange={(e) => setAlphaDots(Number(e.target.value))}
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.sliderControl}>
                    <label className={styles.sliderLabel}>
                      <span>Плотность тепловой карты</span>
                      <span className={styles.sliderValue}>{Math.round(alphaHeat * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={alphaHeat}
                      onChange={(e) => setAlphaHeat(Number(e.target.value))}
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.sliderControl}>
                    <label className={styles.sliderLabel}>
                      <span>Прозрачность центра</span>
                      <span className={styles.sliderValue}>{Math.round(alphaCenter * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={alphaCenter}
                      onChange={(e) => setAlphaCenter(Number(e.target.value))}
                      className={styles.slider}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}