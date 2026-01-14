import { useCallback, useEffect, useState, useRef } from "react";
import { getResults, getGroups, getStudents, getAvailableExercises } from "../api"; // <-- ИМПОРТ ИЗМЕНЕН
import type { Shooting, Group, User, Exercise } from "../types";
import HitViewer from "./HitViewer";
import styles from "../styles/ResultsPage.module.css";
import api from "../api";

export default function ResultsPage() {
  const [shootings, setShootings] = useState<Shooting[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // фильтры
  const [selStudent, setSelStudent] = useState<number | "">("");
  const [selGroup, setSelGroup] = useState<number | "">("");
  const [selExercise, setSelExercise] = useState<number | "">("");
  const [hitsFrom, setHitsFrom] = useState<number | "">("");
  const [hitsTo, setHitsTo] = useState<number | "">("");
  const [timeFrom, setTimeFrom] = useState<number | "">("");
  const [timeTo, setTimeTo] = useState<number | "">("");

  // выбор стрельб для показа попаданий
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showHits, setShowHits] = useState(false);
  
  const allSelectedShootingsRef = useRef<Shooting[]>([]);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  // Загрузка пользователя
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get<User>("/auth/me");
        setUser(data);
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    };
    
    loadUser();
    
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Загрузка фильтров
  const loadFilters = useCallback(async () => {
    try {
      // Для преподавателей загружаем все фильтры
      if (user?.is_teacher) {
        const [g, s, ex] = await Promise.all([
          getGroups().then(r => r.data),
          getStudents().then(r => r.data),
          getAvailableExercises().then(r => r.data), // <-- ИСПОЛЬЗУЕМ НОВЫЙ МЕТОД
        ]);
        setGroups(g);
        setStudents(s);
        setExercises(ex);
      } else {
        // Для студентов загружаем только упражнения
        const ex = await getAvailableExercises();
        setExercises(ex.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки фильтров:", error);
    }
  }, [user]);

  // Загрузка результатов с фильтрами
  const loadResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      
      // Добавляем параметры только если они заданы
      const addParam = (key: string, value: any) => {
        if (value !== "" && value != null) {
          params[key] = value;
        }
      };
      
      addParam('student_id', selStudent);
      addParam('group_id', selGroup);
      addParam('exercise_id', selExercise);
      addParam('hits_from', hitsFrom);
      addParam('hits_to', hitsTo);
      addParam('time_from', timeFrom);
      addParam('time_to', timeTo);

      console.log('Параметры фильтрации:', params);
      const { data } = await getResults(params);
      console.log('Получено результатов:', data.length);
      
      setShootings(data);
      
      // Обновляем выбранные стрельбы
      const updatedSelectedShootings = allSelectedShootingsRef.current.filter(sh => 
        data.some(newSh => newSh.id === sh.id)
      );
      allSelectedShootingsRef.current = updatedSelectedShootings;
      
      setSelectedIds(prev => {
        const next = new Set(prev);
        prev.forEach(id => {
          if (!data.some(sh => sh.id === id)) {
            next.delete(id);
          }
        });
        return next;
      });
    } catch (error) {
      console.error("Ошибка загрузки результатов:", error);
      setShootings([]);
    } finally {
      setIsLoading(false);
    }
  }, [selStudent, selGroup, selExercise, hitsFrom, hitsTo, timeFrom, timeTo]);

  // Загружаем фильтры и результаты при изменении пользователя или параметров
  useEffect(() => {
    if (user) {
      loadFilters();
      loadResults();
    }
  }, [user, loadFilters, loadResults]);

  const resetFilters = () => {
    setSelGroup("");
    setSelStudent("");
    setSelExercise("");
    setHitsFrom("");
    setHitsTo("");
    setTimeFrom("");
    setTimeTo("");
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedShootings = shootings.filter(sh => selectedIds.has(sh.id));

  const openPhoto = (url: string) => {
    window.open(`${import.meta.env.VITE_API_URL}${url}`, '_blank');
  };

  const openTarget = (url: string) => {
    window.open(`${import.meta.env.VITE_API_URL}${url}`, '_blank');
  };

  const isNewRecord = (createdAt: string) => {
    const recordDate = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.h2}>Результаты стрельб</h2>
        <div className={styles.resultsSummary}>
          <span className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Найдено:</span>
            <span className={styles.summaryValue}>{shootings.length}</span>
          </span>
          <span className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Выбрано:</span>
            <span className={styles.summaryValue}>{selectedIds.size}</span>
          </span>
        </div>
      </div>

      {/* Блок фильтров */}
      <div className={styles.filtersContainer}>
        <div className={styles.filtersHeader}>
          <span className={styles.filtersTitle}>Фильтры</span>
          <button className={styles.clearFilters} onClick={resetFilters}>
            Сбросить все
          </button>
        </div>

        <div className={styles.filterGrid}>
          {/* Упражнение */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Упражнение</label>
            <select 
              className={styles.filterSelect}
              value={selExercise} 
              onChange={e => setSelExercise(Number(e.target.value) || "")}
            >
              <option value="">Все упражнения</option>
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          {/* Попадания */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Попадания</label>
            <div className={styles.rangeInputs}>
              <input 
                type="number" 
                className={styles.rangeInput}
                placeholder="От" 
                min={0} 
                value={hitsFrom} 
                onChange={e => setHitsFrom(e.target.value === "" ? "" : Number(e.target.value))} 
              />
              <span className={styles.rangeSeparator}>—</span>
              <input 
                type="number" 
                className={styles.rangeInput}
                placeholder="До" 
                min={0} 
                value={hitsTo} 
                onChange={e => setHitsTo(e.target.value === "" ? "" : Number(e.target.value))} 
              />
            </div>
          </div>

          {/* Время */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Время (сек)</label>
            <div className={styles.rangeInputs}>
              <input 
                type="number" 
                className={styles.rangeInput}
                placeholder="От" 
                min={0} 
                value={timeFrom} 
                onChange={e => setTimeFrom(e.target.value === "" ? "" : Number(e.target.value))} 
              />
              <span className={styles.rangeSeparator}>—</span>
              <input 
                type="number" 
                className={styles.rangeInput}
                placeholder="До" 
                min={0} 
                value={timeTo} 
                onChange={e => setTimeTo(e.target.value === "" ? "" : Number(e.target.value))} 
              />
            </div>
          </div>

          {/* Фильтры только для преподавателя */}
          {user?.is_teacher && (
            <>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Группа</label>
                <select 
                  className={styles.filterSelect}
                  value={selGroup} 
                  onChange={e => setSelGroup(Number(e.target.value) || "")}
                >
                  <option value="">Все группы</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Ученик</label>
                <select 
                  className={styles.filterSelect}
                  value={selStudent} 
                  onChange={e => setSelStudent(Number(e.target.value) || "")}
                >
                  <option value="">Все ученики</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.username}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Индикатор загрузки */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Загрузка результатов...</p>
        </div>
      ) : (
        <>
          {/* Мобильная версия - карточки */}
          {isMobile ? (
            <div className={styles.resultCards}>
              {shootings.length > 0 ? (
                shootings.map(sh => (
                  <div 
                    key={sh.id} 
                    className={`${styles.resultCard} ${selectedIds.has(sh.id) ? styles.selectedCard : ''}`}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardHeaderLeft}>
                        <input
                          type="checkbox"
                          className={styles.cardCheckbox}
                          checked={selectedIds.has(sh.id)}
                          onChange={() => toggleSelect(sh.id)}
                        />
                        <div className={styles.cardStudentInfo}>
                          <div className={styles.studentName}>{sh.student.username}</div>
                          <div className={styles.cardDate}>
                            {new Date(sh.created_at).toLocaleDateString("ru-RU")}
                          </div>
                        </div>
                      </div>
                      <div className={styles.cardHeaderRight}>
                        {isNewRecord(sh.created_at) && (
                          <span className={styles.newBadge}>NEW</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <div className={styles.exerciseInfo}>
                        <span className={styles.exerciseName}>{sh.exercise.name}</span>
                        {sh.group && (
                          <span className={styles.groupTag}>{sh.group.name}</span>
                        )}
                      </div>

                      {sh.note && (
                        <div className={styles.cardNote}>
                          <span className={styles.noteIcon}>📝</span>
                          <span className={styles.noteText}>{sh.note}</span>
                        </div>
                      )}

                      <div className={styles.cardStats}>
                        <div className={styles.statItem}>
                          <div className={styles.statLabel}>Попаданий</div>
                          <div className={`${styles.statValue} ${sh.hits_count >= sh.exercise.max_hits ? styles.statMax : ''}`}>
                            {sh.hits_count} / {sh.exercise.max_hits}
                          </div>
                          <div className={styles.statBar}>
                            <div 
                              className={styles.statBarFill}
                              style={{ width: `${(sh.hits_count / sh.exercise.max_hits) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className={styles.statItem}>
                          <div className={styles.statLabel}>Время</div>
                          <div className={styles.statValue}>
                            {sh.time_spent}с
                          </div>
                          {sh.exercise.time_sec && (
                            <div className={styles.statBar}>
                              <div 
                                className={`${styles.statBarFill} ${sh.time_spent <= sh.exercise.time_sec ? styles.timeOk : styles.timeOver}`}
                                style={{ 
                                  width: `${Math.min((sh.time_spent / sh.exercise.time_sec) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <button 
                          className={styles.cardActionBtn}
                          onClick={() => openPhoto(sh.photo_url)}
                          title="Открыть фото"
                        >
                          <span className={styles.actionIcon}>Фото</span>
                          <span className={styles.actionText}>Фото</span>
                        </button>
                        <button 
                          className={styles.cardActionBtn}
                          onClick={() => toggleSelect(sh.id)}
                          title={selectedIds.has(sh.id) ? "Снять выбор" : "Выбрать"}
                        >
                          <span className={styles.actionIcon}>
                            {selectedIds.has(sh.id) ? "✓" : "○"}
                          </span>
                          <span className={styles.actionText}>
                            {selectedIds.has(sh.id) ? "Выбрано" : "Выбрать"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyResults}>
                  <div className={styles.emptyIcon}>🎯</div>
                  <p className={styles.emptyTitle}>Стрельбы не найдены</p>
                  <p className={styles.emptyText}>Попробуйте изменить параметры фильтров</p>
                </div>
              )}
            </div>
          ) : (
            /* Десктопная версия - таблица */
            <div className={styles.tableContainer}>
              {shootings.length > 0 ? (
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.colCheckbox}>
                            <input
                              type="checkbox"
                              checked={selectedIds.size === shootings.length && shootings.length > 0}
                              onChange={() => {
                                if (selectedIds.size === shootings.length) {
                                  // Снимаем все
                                  setSelectedIds(new Set());
                                  allSelectedShootingsRef.current = [];
                                } else {
                                  // Выбираем все
                                  const newSelectedIds = new Set(shootings.map(sh => sh.id));
                                  setSelectedIds(newSelectedIds);
                                  allSelectedShootingsRef.current = [...shootings];
                                }
                              }}
                              className={styles.headerCheckbox}
                            />
                          </th>
                          <th className={styles.colDate}>Дата</th>
                          <th className={styles.colStudent}>Ученик</th>
                          <th className={styles.colGroup}>Группа</th>
                          <th className={styles.colExercise}>Упражнение</th>
                          <th className={styles.colHits}>Попаданий</th>
                          <th className={styles.colTime}>Время</th>
                          <th className={styles.colActions}>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shootings.map(sh => (
                          <tr 
                            key={sh.id} 
                            className={`${styles.tableRow} ${selectedIds.has(sh.id) ? styles.selectedRow : ''}`}
                          >
                            <td className={styles.colCheckbox}>
                              <div className={styles.checkboxWrapper}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(sh.id)}
                                  onChange={() => toggleSelect(sh.id)}
                                  className={styles.checkbox}
                                />
                              </div>
                            </td>
                            <td className={styles.colDate}>
                              <div className={styles.dateCell}>
                                <div className={styles.date}>
                                  {new Date(sh.created_at).toLocaleDateString('ru-RU')}
                                </div>
                                <div className={styles.time}>
                                  {new Date(sh.created_at).toLocaleTimeString('ru-RU', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                                {isNewRecord(sh.created_at) && (
                                  <span className={styles.newIndicator}>NEW</span>
                                )}
                              </div>
                            </td>
                            <td className={styles.colStudent}>
                              <div className={styles.studentCell}>
                                <span className={styles.studentName}>{sh.student.username}</span>
                                {sh.note && (
                                  <div 
                                    className={styles.noteIndicator}
                                    title={sh.note}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      alert(sh.note);
                                    }}
                                  >
                                    <span className={styles.noteIcon}>📝</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className={styles.colGroup}>
                              {sh.group ? (
                                <span className={styles.groupBadge}>
                                  {sh.group.name}
                                </span>
                              ) : (
                                <span className={styles.noGroup}>—</span>
                              )}
                            </td>
                            <td className={styles.colExercise}>
                              <div className={styles.exerciseCell}>
                                <div className={styles.exerciseName}>{sh.exercise.name}</div>
                                <div className={styles.exerciseStats}>
                                  <span className={styles.statBadge}>
                                    Макс: {sh.exercise.max_hits}
                                  </span>
                                  {sh.exercise.time_sec && (
                                    <span className={styles.statBadge}>
                                      Лимит: {sh.exercise.time_sec}с
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className={styles.colHits}>
                              <div className={styles.hitsCell}>
                                <div className={`${styles.hitsValue} ${sh.hits_count >= sh.exercise.max_hits ? styles.hitsMax : ''}`}>
                                  {sh.hits_count}
                                </div>
                                <div className={styles.hitsProgress}>
                                  <div 
                                    className={styles.hitsProgressBar}
                                    style={{ 
                                      width: `${Math.min((sh.hits_count / sh.exercise.max_hits) * 100, 100)}%` 
                                    }}
                                  ></div>
                                </div>
                                <div className={styles.hitsLabel}>
                                  из {sh.exercise.max_hits}
                                </div>
                              </div>
                            </td>
                            <td className={styles.colTime}>
                              <div className={styles.timeCell}>
                                <div className={styles.timeValue}>
                                  {sh.time_spent}с
                                </div>
                                {sh.exercise.time_sec && (
                                  <div className={styles.timeProgress}>
                                    <div 
                                      className={`${styles.timeProgressBar} ${sh.time_spent <= sh.exercise.time_sec ? styles.timeOk : styles.timeOver}`}
                                      style={{ 
                                        width: `${Math.min((sh.time_spent / sh.exercise.time_sec) * 100, 100)}%` 
                                      }}
                                    ></div>
                                  </div>
                                )}
                                <div className={styles.timeLabel}>
                                  {sh.exercise.time_sec ? `из ${sh.exercise.time_sec}с` : 'без лимита'}
                                </div>
                              </div>
                            </td>
                            <td className={styles.colActions}>
                              <div className={styles.actionsCell}>
                                <button 
                                  className={styles.actionBtn}
                                  onClick={() => openPhoto(sh.photo_url)}
                                  title="Открыть фото"
                                >
                                  <span className={styles.actionIcon}>📷</span>
                                </button>
                                <button 
                                  className={styles.actionBtn}
                                  onClick={() => openTarget(sh.exercise.target_url)}
                                  title="Открыть мишень"
                                >
                                  <span className={styles.actionIcon}>🎯</span>
                                </button>
                                <button 
                                  className={styles.actionBtn}
                                  onClick={() => toggleSelect(sh.id)}
                                  title={selectedIds.has(sh.id) ? "Снять выбор" : "Выбрать для анализа"}
                                >
                                  <span className={styles.actionIcon}>
                                    {selectedIds.has(sh.id) ? "✓" : "+"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Итоговая статистика для десктопа */}
                  {shootings.length > 0 && (
                    <div className={styles.tableFooter}>
                      <div className={styles.footerStats}>
                        <div className={styles.footerStat}>
                          <span className={styles.footerStatLabel}>Среднее попаданий:</span>
                          <span className={styles.footerStatValue}>
                            {(shootings.reduce((sum, sh) => sum + sh.hits_count, 0) / shootings.length).toFixed(1)}
                          </span>
                        </div>
                        <div className={styles.footerStat}>
                          <span className={styles.footerStatLabel}>Среднее время:</span>
                          <span className={styles.footerStatValue}>
                            {(shootings.reduce((sum, sh) => sum + sh.time_spent, 0) / shootings.length).toFixed(1)}с
                          </span>
                        </div>
                        <div className={styles.footerStat}>
                          <span className={styles.footerStatLabel}>Лучший результат:</span>
                          <span className={styles.footerStatValue}>
                            {Math.max(...shootings.map(sh => sh.hits_count))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.emptyResults}>
                  <div className={styles.emptyIcon}>🎯</div>
                  <p className={styles.emptyTitle}>Стрельбы не найдены</p>
                  <p className={styles.emptyText}>Попробуйте изменить параметры фильтров</p>
                </div>
              )}
            </div>
          )}

          {/* Панель действий для мобильных */}
          {isMobile && shootings.length > 0 && (
            <div className={styles.actionsBar}>
              <div className={styles.actionsBarContent}>
                <div className={styles.actionsBarInfo}>
                  <span className={styles.actionsBarText}>
                    Выбрано: <strong>{selectedIds.size}</strong>
                  </span>
                  {selectedIds.size > 0 && (
                    <button 
                      className={styles.clearSelectionBtn}
                      onClick={() => {
                        setSelectedIds(new Set());
                        allSelectedShootingsRef.current = [];
                      }}
                    >
                      Сбросить
                    </button>
                  )}
                </div>
                <button 
                  className={`${styles.primaryActionBtn} ${selectedIds.size === 0 ? styles.disabled : ''}`}
                  onClick={() => selectedIds.size > 0 && setShowHits(true)}
                  disabled={selectedIds.size === 0}
                >
                  <span className={styles.actionBtnIcon}>📊</span>
                  Анализ ({selectedIds.size})
                </button>
              </div>
            </div>
          )}

          {/* Кнопки для десктопной версии */}
          {!isMobile && selectedIds.size > 0 && (
            <div className={styles.desktopActions}>
              <div className={styles.desktopActionsInfo}>
                <span className={styles.selectionInfo}>
                  Выбрано стрельб: <strong>{selectedIds.size}</strong>
                </span>
                <button 
                  className={styles.clearSelectionBtn}
                  onClick={() => {
                    setSelectedIds(new Set());
                    allSelectedShootingsRef.current = [];
                  }}
                >
                  Сбросить выбор
                </button>
              </div>
              <button 
                className={styles.primaryActionBtn}
                onClick={() => setShowHits(true)}
              >
                <span className={styles.actionBtnIcon}>📊</span>
                Показать анализ попаданий
              </button>
            </div>
          )}
        </>
      )}

      {/* Модалка с HitViewer */}
      {showHits && (
        <HitViewer
          shootings={selectedShootings} // Все выбранные стрельбы
          onClose={() => setShowHits(false)}
          // Не передаем selectedIds и onToggle - HitViewer полностью независим
        />
      )}
    </div>
  );
}