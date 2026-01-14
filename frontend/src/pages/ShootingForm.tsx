// src/components/ShootingForm.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { getAvailableExercises } from "../api";
import type { Exercise, Group } from "../types";
import styles from "../styles/ShootingForm.module.css";
import api from "../api";

type Point = { x: number; y: number };

export default function ShootingForm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeSpent, setTimeSpent] = useState<number | "">("");
  const [hitsCount, setHitsCount] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [marks, setMarks] = useState<Point[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selEx, setSelEx] = useState<number | "">("");
  const [selGroup, setSelGroup] = useState<number | "">("");
  const [maxHits, setMaxHits] = useState(10);
  const [timerSec, setTimerSec] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [lastClickCoords, setLastClickCoords] = useState({ x: 0, y: 0 });

  // Определение типа устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadEx = useCallback(async () => {
    try {
      const { data } = await getAvailableExercises();
      setExercises(data);
    } catch (error) {
      alert("Ошибка загрузки упражнений");
    }
  }, []);

  const loadGroups = useCallback(async () => {
    try {
      const { data } = await api.get("/groups");
      setGroups(data);
    } catch (error) {
      console.error("Ошибка загрузки групп:", error);
    }
  }, []);

  useEffect(() => { 
    loadEx(); 
    loadGroups();
  }, [loadEx, loadGroups]);

  useEffect(() => {
    const ex = exercises.find(e => e.id === Number(selEx));
    if (!ex) return;
    
    setMaxHits(ex.max_hits);
    setTimerSec(ex.time_sec);
    setHitsCount(ex.max_hits);
    setTimeSpent(ex.time_sec || "");
    setMarks([]);
    
    if (ex.target_url) {
      drawTarget(ex.target_url);
    }
  }, [selEx, exercises]);

  const drawTarget = useCallback((targetUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log('Canvas context not available');
      return;
    }

    // Сначала очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${import.meta.env.VITE_API_URL}${targetUrl}`;
    
    img.onload = () => {
      if (!canvas || !ctx) return;

      // Рассчитываем размеры для canvas
      const containerWidth = containerRef.current?.clientWidth || 300;
      const targetAspectRatio = 3/4;
      const canvasWidth = Math.min(containerWidth - 32, 400);
      const canvasHeight = canvasWidth / targetAspectRatio;

      // Устанавливаем размеры canvas
      if (canvas.width !== canvasWidth) canvas.width = canvasWidth;
      if (canvas.height !== canvasHeight) canvas.height = canvasHeight;

      // Рисуем мишень с сохранением пропорций
      const scale = Math.min(
        canvasWidth / img.naturalWidth,
        canvasHeight / img.naturalHeight
      );
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      // Сохраняем размеры области мишени для обработки кликов
      const targetArea = { offsetX, offsetY, drawWidth, drawHeight };
      (canvas as any).targetArea = targetArea;

      // Фон
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Мишень
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Обводка области мишени (легкая для визуального ориентира)
      ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);

      // Отладочная информация
      if (debugMode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(offsetX, offsetY, drawWidth, drawHeight);
        
        // Сетка для отладки
        ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 10; i++) {
          const x = offsetX + (i / 10) * drawWidth;
          const y = offsetY + (i / 10) * drawHeight;
          
          // Вертикальные линии
          ctx.beginPath();
          ctx.moveTo(x, offsetY);
          ctx.lineTo(x, offsetY + drawHeight);
          ctx.stroke();
          
          // Горизонтальные линии
          ctx.beginPath();
          ctx.moveTo(offsetX, y);
          ctx.lineTo(offsetX + drawWidth, y);
          ctx.stroke();
        }
        
        // Отметка центра
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(offsetX + drawWidth/2, offsetY + drawHeight/2, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Перерисовываем метки
      marks.forEach((mark, index) => {
        const x = offsetX + (mark.x * drawWidth);
        const y = offsetY + (mark.y * drawHeight);
        
        // Проверяем, что координаты внутри области мишени
        if (x < offsetX || x > offsetX + drawWidth || y < offsetY || y > offsetY + drawHeight) {
          console.warn(`Mark ${index} out of bounds:`, { x, y, offsetX, offsetY, drawWidth, drawHeight });
          return;
        }

        // Большой красный кружок с обводкой (увеличил размер)
        const radius = isMobile ? 10 : 8;
        
        // Белая обводка
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Красный кружок
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Черная тонкая обводка для четкости
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Номер попадания (белый текст)
        ctx.fillStyle = "white";
        ctx.font = `bold ${isMobile ? '11' : '9'}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((index + 1).toString(), x, y);
      });

      console.log('Canvas drawn with', marks.length, 'marks. Target area:', targetArea);
    };

    img.onerror = () => {
      console.error("Ошибка загрузки мишени:", targetUrl);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "14px Arial";
      ctx.fillText("Мишень не загружена", canvas.width/2, canvas.height/2);
    };
  }, [marks, isMobile, debugMode]);

  // Перерисовываем мишень при изменении меток или отладки
  useEffect(() => {
    if (selEx) {
      const ex = exercises.find(e => e.id === Number(selEx));
      if (ex && ex.target_url) {
        drawTarget(ex.target_url);
      }
    }
  }, [marks, debugMode, drawTarget, selEx, exercises]);

  const handleCanvasInteraction = useCallback((clientX: number, clientY: number) => {
    if (marks.length >= maxHits || !selEx) {
      console.log('Cannot add mark:', { marksLength: marks.length, maxHits, selEx });
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas element');
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    setLastClickCoords({ x: Math.round(x), y: Math.round(y) });

    const ex = exercises.find(e => e.id === Number(selEx));
    if (!ex || !ex.target_url) {
      console.log('No exercise or target URL');
      return;
    }

    // Используем сохраненную targetArea или вычисляем
    let targetArea = (canvas as any).targetArea;
    if (!targetArea) {
      console.log('Target area not found, calculating...');
      const img = new Image();
      img.src = `${import.meta.env.VITE_API_URL}${ex.target_url}`;
      
      if (img.complete) {
        const scale = Math.min(
          canvas.width / img.naturalWidth,
          canvas.height / img.naturalHeight
        );
        const drawWidth = img.naturalWidth * scale;
        const drawHeight = img.naturalHeight * scale;
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;
        
        targetArea = { offsetX, offsetY, drawWidth, drawHeight };
      } else {
        img.onload = () => {
          const scale = Math.min(
            canvas.width / img.naturalWidth,
            canvas.height / img.naturalHeight
          );
          const drawWidth = img.naturalWidth * scale;
          const drawHeight = img.naturalHeight * scale;
          const offsetX = (canvas.width - drawWidth) / 2;
          const offsetY = (canvas.height - drawHeight) / 2;
          
          processClick({ offsetX, offsetY, drawWidth, drawHeight }, x, y);
        };
        return;
      }
    }
    
    processClick(targetArea, x, y);
  }, [marks.length, maxHits, selEx, exercises]);

  const processClick = useCallback((targetArea: { offsetX: number, offsetY: number, drawWidth: number, drawHeight: number }, x: number, y: number) => {
    console.log('Processing click:', { x, y, targetArea });
    
    // Проверяем попадание в мишень
    if (
      x < targetArea.offsetX ||
      x > targetArea.offsetX + targetArea.drawWidth ||
      y < targetArea.offsetY ||
      y > targetArea.offsetY + targetArea.drawHeight
    ) {
      console.log('Click outside target area');
      return;
    }

    // Координаты относительно мишени (0-1)
    const xInTarget = (x - targetArea.offsetX) / targetArea.drawWidth;
    const yInTarget = (y - targetArea.offsetY) / targetArea.drawHeight;

    // Проверяем и корректируем диапазон
    const clampedX = Math.max(0, Math.min(1, xInTarget));
    const clampedY = Math.max(0, Math.min(1, yInTarget));

    console.log('Target coordinates:', { xInTarget, yInTarget, clampedX, clampedY });

    const newMark = { 
      x: Math.round(clampedX * 10000) / 10000, 
      y: Math.round(clampedY * 10000) / 10000 
    };

    console.log('Adding new mark:', newMark);
    setMarks(prev => [...prev, newMark]);
  }, []);

  const handleMouseClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleCanvasInteraction(e.clientX, e.clientY);
  }, [handleCanvasInteraction]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    handleCanvasInteraction(touch.clientX, touch.clientY);
  }, [handleCanvasInteraction]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Файл слишком большой. Максимум 10MB");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const validateForm = () => {
    if (!selEx) {
      alert("Выберите упражнение");
      return false;
    }
    if (!file) {
      alert("Добавьте фото стрельбы");
      return false;
    }
    if (marks.length === 0) {
      alert("Добавьте хотя бы одну метку на мишени");
      return false;
    }
    if (hitsCount === "" || Number(hitsCount) > maxHits) {
      alert(`Количество попаданий не может превышать ${maxHits}`);
      return false;
    }
    if (timerSec > 0 && (timeSpent === "" || Number(timeSpent) > timerSec)) {
      alert(`Время стрельбы не может превышать ${timerSec} секунд`);
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateForm() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("exercise_id", String(selEx));
      form.append("note", note);
      form.append("canvas_json", JSON.stringify(marks));
      form.append("time_spent", String(timeSpent || 0));
      form.append("hits_count", String(hitsCount));
      form.append("photo", file!);
      
      // Добавляем group_id если выбрана группа
      if (selGroup) {
        form.append("group_id", String(selGroup));
      }

      await api.post("/shootings", form);
      
      alert("Сохранено ✓");
      
      // Сброс формы
      setMarks([]);
      setFile(null);
      setFileName("");
      setNote("");
      setHitsCount("");
      setTimeSpent("");
      setSelEx("");
      setSelGroup("");
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert("Ошибка сохранения");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMark = (index: number) => {
    setMarks(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllMarks = () => {
    setMarks([]);
  };

  const addTestMark = (position: 'center' | 'random') => {
    if (marks.length >= maxHits) return;
    
    let x, y;
    if (position === 'center') {
      x = 0.5;
      y = 0.5;
    } else {
      x = Math.random() * 0.8 + 0.1; // 0.1 - 0.9
      y = Math.random() * 0.8 + 0.1;
    }
    
    setMarks(prev => [...prev, { x, y }]);
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Добавить стрельбу</h2>

      {/* Отладочная панель */}
      {debugMode && (
        <div className={styles.debugPanel}>
          <div className={styles.debugHeader}>
            <span>Отладочная информация</span>
            <button 
              className={styles.debugClose}
              onClick={() => setDebugMode(false)}
            >
              ×
            </button>
          </div>
          <div className={styles.debugContent}>
            <div>Меток: {marks.length} / {maxHits}</div>
            <div>Упражнение ID: {selEx || 'не выбрано'}</div>
            <div>Группа ID: {selGroup || 'не выбрана'}</div>
            <div>Canvas: {canvasRef.current ? `${canvasRef.current.width}×${canvasRef.current.height}` : 'не загружен'}</div>
            <div>Последний клик: {lastClickCoords.x}, {lastClickCoords.y}</div>
            <div>Последняя метка: {marks.length > 0 ? 
              `X: ${(marks[marks.length-1].x*100).toFixed(1)}%, Y: ${(marks[marks.length-1].y*100).toFixed(1)}%` : 
              'нет'
            }</div>
            <div className={styles.debugButtons}>
              <button 
                className={styles.debugBtn}
                onClick={() => addTestMark('center')}
              >
                Тест: центр
              </button>
              <button 
                className={styles.debugBtn}
                onClick={() => addTestMark('random')}
              >
                Тест: случайно
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Упражнение *</label>
        <select 
          className={styles.select}
          value={selEx} 
          onChange={e => setSelEx(Number(e.target.value))}
        >
          <option value="">– выберите упражнение –</option>
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      {/* Добавляем поле выбора группы */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Группа</label>
        <select 
          className={styles.select}
          value={selGroup} 
          onChange={e => setSelGroup(Number(e.target.value) || "")}
        >
          <option value="">– без группы –</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {selEx && (
        <>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Макс. попаданий:</span>
              <span className={styles.statValue}>{maxHits}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Время:</span>
              <span className={styles.statValue}>
                {timerSec ? `${timerSec} с` : '∞'}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Режим:</span>
              <span className={styles.statValue}>
                {isMobile ? 'Мобильный' : 'Десктоп'}
              </span>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Попадания *</label>
              <input 
                type="number" 
                className={styles.input}
                min="0"
                max={maxHits}
                value={hitsCount}
                onChange={e => setHitsCount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
              />
              <div className={styles.hint}>
                <span className={marks.length === maxHits ? styles.hintFull : ''}>
                  Добавлено: {marks.length} из {maxHits}
                </span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Время, сек {timerSec > 0 && `(до ${timerSec})`}
              </label>
              <input 
                type="number" 
                className={styles.input}
                min="0"
                max={timerSec || undefined}
                value={timeSpent}
                onChange={e => setTimeSpent(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div className={styles.canvasContainer} ref={containerRef}>
            <div className={styles.canvasHeader}>
              <div className={styles.canvasTitleWrapper}>
                <span className={styles.canvasTitle}>Мишень</span>
                {marks.length > 0 && (
                  <span className={styles.marksCounter}>
                    <span className={styles.marksCounterBadge}>
                      {marks.length} из {maxHits}
                    </span>
                  </span>
                )}
              </div>
              <div className={styles.canvasActions}>
                {marks.length > 0 && (
                  <button 
                    className={styles.clearBtn}
                    onClick={clearAllMarks}
                    type="button"
                  >
                    Очистить все
                  </button>
                )}
                {process.env.NODE_ENV === 'development' && (
                  <button 
                    className={styles.debugToggle}
                    onClick={() => setDebugMode(!debugMode)}
                    type="button"
                  >
                    {debugMode ? '❌' : '🐛'}
                  </button>
                )}
              </div>
            </div>
            
            <div className={styles.canvasWrapper}>
              <canvas 
                ref={canvasRef} 
                className={styles.canvas}
                onClick={handleMouseClick}
                onTouchStart={handleTouchStart}
              />
              {marks.length === 0 && (
                <div className={styles.canvasOverlay}>
                  <div className={styles.canvasInstruction}>
                    {isMobile ? (
                      <>Тапните на мишени, чтобы добавить попадание</>
                    ) : (
                      <>Кликните на мишени, чтобы добавить попадание</>
                    )}
                    <div className={styles.canvasInstructionSub}>
                      Добавлено: {marks.length} из {maxHits}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.canvasHint}>
              {marks.length >= maxHits ? (
                <span className={styles.hintFull}>
                  <span className={styles.hintIcon}>✓</span>
                  Достигнут максимум попаданий
                </span>
              ) : (
                <>
                  <span className={styles.hintDot}>•</span>
                  {isMobile 
                    ? "Тапните на мишени для отметки попаданий" 
                    : "Кликните на мишени для отметки попаданий"
                  }
                  <span className={styles.hintCounter}>
                    ({marks.length}/{maxHits})
                  </span>
                </>
              )}
            </div>

            {marks.length > 0 && (
              <div className={styles.marksList}>
                <div className={styles.marksHeader}>
                  <span className={styles.marksTitle}>Добавленные попадания:</span>
                  <span className={styles.marksCount}>{marks.length} шт.</span>
                </div>
                <div className={styles.marksGrid}>
                  {marks.map((mark, index) => (
                    <div key={index} className={styles.markItem}>
                      <div className={styles.markHeader}>
                        <div className={styles.markIndexWrapper}>
                          <span className={styles.markIndex}>#{index + 1}</span>
                          <div className={styles.markPreview}>
                            <div 
                              className={styles.markPreviewDot}
                              style={{
                                left: `${mark.x * 100}%`,
                                top: `${mark.y * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <button 
                          className={styles.markRemove}
                          onClick={() => removeMark(index)}
                          type="button"
                          aria-label="Удалить метку"
                        >
                          ×
                        </button>
                      </div>
                      <div className={styles.markCoords}>
                        <span data-label="X:">{(mark.x * 100).toFixed(1)}</span>
                        <span data-label="Y:">{(mark.y * 100).toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Примечание</label>
        <textarea 
          className={styles.textarea}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Дополнительные заметки..."
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Фото стрельбы *</label>
        <div className={styles.fileUpload}>
          <input
            type="file"
            id="photo"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
            capture={isMobile ? "environment" : undefined}
          />
          <label htmlFor="photo" className={styles.fileLabel}>
            <svg className={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span className={styles.fileText}>
              {fileName || (isMobile ? "Сфотографировать или выбрать файл" : "Выбрать файл")}
            </span>
            {fileName && (
              <span className={styles.fileName}>{fileName}</span>
            )}
          </label>
        </div>
        <div className={styles.fileHint}>Формат: JPG, PNG • Макс. 10MB</div>
      </div>

      <button 
        className={`${styles.submitBtn} ${isSubmitting ? styles.submitting : ''}`}
        onClick={submit}
        disabled={isSubmitting || !selEx || !file || marks.length === 0}
      >
        {isSubmitting ? (
          <>
            <span className={styles.spinner}></span>
            Сохранение...
          </>
        ) : (
          'Сохранить стрельбу'
        )}
      </button>
    </div>
  );
}