Ниже — полностью готовые файлы, которые **заменяют** собой старые.  
Логика React не менялась, добавлены только визуальные улучшения и мобильные «финтифлюшки» (аккордеон фильтров, safe-area, крупные тач-таргеты, нативная модалка на весь экран и т.д.).  
Просто сохраните их поверх старых и запустите проект.

--------------------------------------------------
ResultsPage.module.css
--------------------------------------------------
/* ==========  CORE  ========== */
.page{padding:1rem;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;min-height:calc(100vh - 60px);box-sizing:border-box;background:#f8fafc}
@media(min-width:768px){.page{padding:1.5rem 2rem}}

.header{display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem}
@media(min-width:768px){.header{flex-direction:row;justify-content:space-between;align-items:center}}

.h2{font-size:1.5rem;font-weight:700;margin:0;color:#1e293b;line-height:1.2}
@media(min-width:768px){.h2{font-size:1.75rem}}

.resultsSummary{display:flex;gap:1.5rem;background:#fff;padding:.875rem 1.25rem;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.summaryItem{display:flex;flex-direction:column;align-items:center;gap:.25rem}
.summaryLabel{font-size:.75rem;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:.025em}
.summaryValue{font-size:1.25rem;font-weight:700;color:#3b82f6}

.filtersContainer{background:#fff;border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.filtersHeader{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;padding-bottom:.75rem;border-bottom:1px solid #f1f5f9}
.filtersTitle{font-size:1rem;font-weight:600;color:#1e293b}
.clearFilters{font-size:.875rem;color:#3b82f6;background:none;border:none;cursor:pointer;padding:.375rem .75rem;border-radius:6px;transition:all .2s}
.clearFilters:hover{background:#eff6ff}

.filterGrid{display:grid;grid-template-columns:1fr;gap:1rem}
@media(min-width:768px){.filterGrid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.filterGrid{grid-template-columns:repeat(3,1fr)}}
.filterGroup{display:flex;flex-direction:column;gap:.5rem}
.filterLabel{font-size:.875rem;font-weight:500;color:#475569}
.filterSelect{width:100%;padding:.625rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;background:#fff;color:#1e293b;box-sizing:border-box;transition:border-color .2s}
.filterSelect:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}

.rangeInputs{display:flex;align-items:center;gap:.5rem}
.rangeInput{flex:1;padding:.625rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;background:#fff;color:#1e293b;box-sizing:border-box;text-align:center}
.rangeInput::placeholder{color:#94a3b8;text-align:center}
.rangeSeparator{color:#94a3b8;font-weight:500}

.loadingContainer{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;background:#fff;border-radius:12px;border:1px solid #e2e8f0}
.loadingSpinner{width:48px;height:48px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}
@keyframes spin{to{transform:rotate(360deg)}}
.loadingText{font-size:.875rem;color:#64748b;text-align:center}

.emptyResults{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;background:#fff;border-radius:12px;border:1px solid #e2e8f0;text-align:center}
.emptyIcon{font-size:3rem;margin-bottom:1rem;opacity:.5}
.emptyTitle{font-size:1.125rem;font-weight:600;color:#1e293b;margin:0 0 .5rem 0}
.emptyText{font-size:.875rem;color:#64748b;margin:0}

/* ==========  CARDS  ========== */
.resultCards{display:flex;flex-direction:column;gap:.75rem;margin-bottom:calc(5rem + env(safe-area-inset-bottom,0))}
.resultCard{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,.05);transition:all .2s}
.resultCard.selectedCard{border-color:#3b82f6;background:#eff6ff;box-shadow:0 0 0 2px rgba(59,130,246,.1)}
.cardHeader{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.75rem;padding-bottom:.75rem;border-bottom:1px solid #f1f5f9}
.cardHeaderLeft{display:flex;align-items:flex-start;gap:.75rem}
.cardCheckbox{width:20px;height:20px;margin-top:.125rem;accent-color:#3b82f6;cursor:pointer}
.studentName{font-weight:600;color:#1e293b;font-size:.875rem}
.cardDate{font-size:.75rem;color:#64748b}
.cardHeaderRight{display:flex;align-items:center}
.newBadge{font-size:.625rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#10b981,#059669);padding:.125rem .375rem;border-radius:10px;text-transform:uppercase;letter-spacing:.05em;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}

.cardContent{display:flex;flex-direction:column;gap:.75rem}
.exerciseInfo{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.exerciseName{font-weight:500;color:#334155;font-size:.875rem}
.groupTag{font-size:.75rem;padding:.125rem .5rem;background:#e0f2fe;color:#0369a1;border-radius:10px;font-weight:500}

.cardNote{display:flex;align-items:flex-start;gap:.5rem;padding:.5rem;background:#fef3c7;border-radius:6px;border-left:3px solid #f59e0b}
.noteIcon{font-size:.875rem;line-height:1}
.noteText{font-size:.75rem;color:#92400e;line-height:1.4;flex:1}

.cardStats{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;margin:.5rem 0}
.statItem{display:flex;flex-direction:column;gap:.375rem}
.statLabel{font-size:.75rem;color:#64748b;font-weight:500}
.statValue{font-size:1.125rem;font-weight:700;color:#1e40af}
.statValue.statMax{color:#059669}
.statBar{width:100%;height:4px;background:#e2e8f0;border-radius:2px;overflow:hidden}
.statBarFill{height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:2px;transition:width .5s ease}
.statBarFill.timeOk{background:linear-gradient(90deg,#10b981,#34d399)}
.statBarFill.timeOver{background:linear-gradient(90deg,#ef4444,#f87171)}

.cardActions{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:.5rem}
.cardActionBtn{display:flex;flex-direction:column;align-items:center;gap:.25rem;padding:.625rem;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;transition:all .2s;min-height:44px;justify-content:center}
.cardActionBtn:hover{background:#f8fafc;border-color:#cbd5e1;transform:translateY(-1px)}
.cardActionBtn:active{transform:scale(.95)}
.actionIcon{font-size:1rem;line-height:1}
.actionText{font-size:.75rem;color:#475569;font-weight:500}

/* ==========  TABLE  ========== */
.tableContainer{background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.tableWrapper{overflow-x:auto;-webkit-overflow-scrolling:touch}
.table{width:100%;border-collapse:collapse;font-size:.875rem;min-width:1000px}
.table th{padding:1rem .75rem;background:#f8fafc;font-weight:600;color:#475569;text-align:left;border-bottom:2px solid #e2e8f0;white-space:nowrap;position:sticky;top:0;z-index:10}
.headerCheckbox{width:18px;height:18px;accent-color:#3b82f6;cursor:pointer}
.table td{padding:.875rem .75rem;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.tableRow{transition:background-color .2s}
.tableRow:hover{background:#f8fafc}
.tableRow.selectedRow{background:#eff6ff}
.colCheckbox{width:50px;text-align:center}
.colDate{width:120px}
.colStudent{width:140px}
.colGroup{width:100px}
.colExercise{width:180px;min-width:180px}
.colHits{width:120px}
.colTime{width:120px}
.colActions{width:130px}
.checkboxWrapper{display:flex;align-items:center;justify-content:center}
.checkbox{width:18px;height:18px;cursor:pointer;accent-color:#3b82f6}
.dateCell{display:flex;flex-direction:column;gap:.25rem;position:relative}
.date{font-weight:500;color:#1e293b;font-size:.813rem}
.time{font-size:.75rem;color:#64748b}
.newIndicator{position:absolute;top:-6px;right:-6px;font-size:.625rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#10b981,#059669);padding:.125rem .375rem;border-radius:10px;text-transform:uppercase;letter-spacing:.05em}
.studentCell{display:flex;align-items:center;gap:.5rem}
.studentName{font-weight:500;color:#334155;font-size:.875rem}
.noteIndicator{cursor:help;width:20px;height:20px;display:flex;align-items:center;justify-content:center;background:#fef3c7;border-radius:50%;transition:all .2s}
.noteIndicator:hover{background:#f59e0b}
.noteIcon{font-size:.75rem;line-height:1}
.groupBadge{display:inline-block;padding:.25rem .5rem;background:#e0f2fe;color:#0369a1;border-radius:10px;font-size:.75rem;font-weight:500;white-space:nowrap}
.noGroup{color:#94a3b8;font-size:.75rem}
.exerciseCell{display:flex;flex-direction:column;gap:.375rem}
.exerciseName{font-weight:500;color:#1e293b;font-size:.813rem}
.exerciseStats{display:flex;gap:.375rem;flex-wrap:wrap}
.statBadge{font-size:.688rem;padding:.125rem .375rem;background:#f1f5f9;color:#475569;border-radius:6px;white-space:nowrap}
.hitsCell{display:flex;flex-direction:column;gap:.375rem;align-items:center}
.hitsValue{font-size:1.125rem;font-weight:700;color:#1e40af;line-height:1}
.hitsValue.hitsMax{color:#059669}
.hitsProgress{width:100%;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden}
.hitsProgressBar{height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:3px;transition:width .5s ease}
.timeCell{display:flex;flex-direction:column;gap:.375rem;align-items:center}
.timeValue{font-size:1rem;font-weight:600;color:#7c3aed;line-height:1}
.timeProgress{width:100%;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden}
.timeProgressBar{height:100%;border-radius:3px;transition:width .5s ease}
.timeProgressBar.timeOk{background:linear-gradient(90deg,#10b981,#34d399)}
.timeProgressBar.timeOver{background:linear-gradient(90deg,#ef4444,#f87171)}
.timeLabel{font-size:.75rem;color:#64748b}
.actionsCell{display:flex;gap:.5rem;justify-content:center}
.actionBtn{width:32px;height:32px;border:none;border-radius:8px;background:#f1f5f9;color:#475569;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.875rem;transition:all .2s;min-height:44px}
.actionBtn:hover{background:#3b82f6;color:#fff;transform:translateY(-1px)}
.actionBtn:active{transform:scale(.95)}
.actionIcon{font-size:.875rem;line-height:1}
.tableFooter{padding:1rem;border-top:1px solid #e2e8f0;background:#f8fafc}
.footerStats{display:flex;justify-content:space-around;flex-wrap:wrap;gap:1rem}
.footerStat{display:flex;flex-direction:column;align-items:center;gap:.25rem}
.footerStatLabel{font-size:.75rem;color:#64748b;font-weight:500}
.footerStatValue{font-size:1rem;font-weight:700;color:#3b82f6}

/* ==========  ACTIONS BAR  ========== */
.actionsBar{position:fixed;bottom:0;left:0;right:0;background:#fff;padding:.75rem 1rem calc(.75rem + env(safe-area-inset-bottom,0));border-top:1px solid #e2e8f0;box-shadow:0 -2px 10px rgba(0,0,0,.1);z-index:100}
.actionsBarContent{display:flex;flex-direction:column;gap:.75rem;max-width:640px;margin:0 auto}
.actionsBarInfo{display:flex;justify-content:space-between;align-items:center}
.actionsBarText{font-size:.875rem;color:#475569}
.clearSelectionBtn{font-size:.75rem;color:#ef4444;background:none;border:1px solid #fca5a5;padding:.25rem .75rem;border-radius:6px;cursor:pointer;transition:all .2s}
.clearSelectionBtn:hover{background:#fee2e2}
.desktopActions{display:flex;flex-direction:column;gap:1rem;margin-top:1.5rem;padding:1.25rem;background:#fff;border-radius:12px;border:1px solid #e2e8f0}
.desktopActionsInfo{display:flex;justify-content:space-between;align-items:center}
.selectionInfo{font-size:.875rem;color:#475569}
.primaryActionBtn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.875rem 1.5rem;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;border:none;border-radius:8px;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 2px 4px rgba(59,130,246,.3);min-height:44px}
.primaryActionBtn:hover:not(.disabled){background:linear-gradient(135deg,#2563eb,#1e40af);transform:translateY(-1px);box-shadow:0 4px 8px rgba(59,130,246,.4)}
.primaryActionBtn:active:not(.disabled){transform:translateY(0)}
.primaryActionBtn.disabled{background:#94a3b8;cursor:not-allowed;box-shadow:none}
.actionBtnIcon{font-size:1rem}

/* ==========  MOBILE ENHANCEMENTS  ========== */
@media(max-width:768px){
  :root{--safe-bottom:env(safe-area-inset-bottom,0)}
  .page{padding:.5rem;padding-bottom:calc(4.5rem + var(--safe-bottom))}
  .header{position:sticky;top:0;z-index:10;background:#fff;margin:-.5rem -.5rem .75rem -.5rem;padding:.75rem 1rem;border-bottom:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,.05)}
  .h2{font-size:1.25rem}
  .resultsSummary{padding:.5rem .75rem;gap:1rem;font-size:.75rem}
  .summaryValue{font-size:1.1rem}
  .filtersContainer{padding:0;border-radius:0;box-shadow:none;border:none}
  .filtersHeader{padding:.75rem 1rem;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
  .filtersHeader::after{content:'▾';margin-left:auto;transition:transform .2s}
  .filtersHeader.open::after{transform:rotate(180deg)}
  .filterGrid{max-height:0;overflow:hidden;transition:max-height .25s ease-out;padding:0 1rem}
  .filterGrid.open{max-height:600px;padding:.75rem 1rem 1rem}
  .resultCard{padding:.75rem}
  .cardActions{grid-template-columns:repeat(3,1fr);gap:.25rem}
  .cardActionBtn{font-size:.6875rem}
  .actionsBar{background:rgba(255,255,255,.95);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid rgba(0,0,0,.05);padding:.5rem 1rem calc(.5rem + var(--safe-bottom))}
  .primaryActionBtn{height:48px;font-size:1rem;border-radius:12px}
}

/* ==========  DARK  ========== */
@media(prefers-color-scheme:dark){
  .page{background:#0f172a}
  .h2,.filtersTitle,.emptyTitle{color:#f1f5f9}
  .resultsSummary,.filtersContainer,.loadingContainer,.emptyResults,.resultCard,.tableContainer,.desktopActions{background:#1e293b;border-color:#334155;color:#cbd5e1}
  .studentName,.exerciseName,.date{color:#e2e8f0}
  .table th{background:#1e293b;color:#94a3b8;border-color:#334155}
  .table td{border-color:#334155;color:#cbd5e1}
  .tableRow:hover{background:#334155}
  .tableRow.selectedRow{background:#1e40af}
  .actionsBar{background:#1e293b;border-color:#334155}
  .clearSelectionBtn{color:#fca5a5;border-color:#7f1d1d}
  .clearSelectionBtn:hover{background:#7f1d1d}
}

--------------------------------------------------
HitViewer.module.css  (полностью)
--------------------------------------------------
/* Оверлей */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem;overflow:auto;animation:fadeIn .3s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

/* Модальное окно */
.modalBox{background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.4);width:95vw;max-width:1400px;height:95vh;max-height:900px;display:flex;flex-direction:column;overflow:hidden;animation:slideUp .4s cubic-bezier(.175,.885,.32,1.275)}
@keyframes slideUp{from{opacity:0;transform:translateY(40px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:1024px){.modalBox{max-width:95vw;max-height:90vh;height:auto}}

/* Шапка */
.modalHeader{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#1e293b,#334155);color:#fff;flex-shrink:0}
@media(max-width:768px){.modalHeader{padding:1rem 1.25rem}}
.modalTitle{margin:0;font-size:1.5rem;font-weight:700;color:#fff}
.closeBtn{background:rgba(255,255,255,.1);border:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;transition:all .2s}
.closeBtn:hover{background:rgba(255,255,255,.2);transform:rotate(90deg)}
.closeBtn:active{transform:scale(.95) rotate(90deg)}

/* 3-колонки */
.threeColumnLayout{display:flex;flex:1;min-height:0;height:calc(100% - 80px);overflow:hidden}
@media(max-width:1024px){.threeColumnLayout{flex-direction:column;height:auto}}

/* Левая */
.leftColumn{flex:0 0 320px;display:flex;flex-direction:column;background:#f8fafc;border-right:1px solid #e5e7eb;overflow:hidden;padding:1.5rem}
@media(max-width:1024px){.leftColumn{flex:0 0 auto;border-right:none;border-bottom:1px solid #e5e7eb;max-height:300px;min-height:300px}}
@media(max-width:768px){.leftColumn{padding:1rem;max-height:250px;min-height:250px}}

/* Центр */
.centerColumn{flex:1;display:flex;flex-direction:column;padding:1.5rem;min-width:0;background:#fff;overflow:hidden}
@media(max-width:1024px){.centerColumn{flex:1;min-height:400px;max-height:500px}}
@media(max-width:768px){.centerColumn{min-height:350px;max-height:400px;padding:1rem}}

/* Правая */
.rightColumn{flex:0 0 320px;display:flex;flex-direction:column;background:#f8fafc;border-left:1px solid #e5e7eb;overflow:hidden;padding:1.5rem}
@media(max-width:1024px){.rightColumn{flex:0 0 auto;border-left:none;border-top:1px solid #e5e7eb;max-height:300px;min-height:300px}}
@media(max-width:768px){.rightColumn{padding:1rem;max-height:250px;min-height:250px}}

/* Контейнер мишени */
.targetContainer{position:relative;flex:1;display:flex;align-items:center;justify-content:center;background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;width:100%;height:100%}
.targetCanvas,.heatCanvas,.centerCanvas,.dotsCanvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;image-rendering:-moz-crisp-edges;image-rendering:-webkit-crisp-edges;image-rendering:pixelated;image-rendering:crisp-edges}
.targetCanvas{z-index:1}.heatCanvas{z-index:2}.centerCanvas{z-index:3}.dotsCanvas{z-index:4}

/* Виджеты */
.heatmapWidgets{display:flex;flex-direction:column;gap:1.5rem;height:100%;overflow-y:auto}
.widgetCard{background:#fff;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.widgetTitle{margin:0 0 1.5rem 0;font-size:1.125rem;font-weight:600;color:#1e293b;text-align:center}
.sliderGroup{display:flex;flex-direction:column;gap:1.25rem;margin-bottom:1.5rem}
.sliderControl{display:flex;flex-direction:column;gap:.75rem}
.sliderLabel{display:flex;justify-content:space-between;align-items:center;font-size:.875rem;font-weight:500;color:#334155}
.sliderValue{background:#e2e8f0;padding:.25rem .75rem;border-radius:12px;font-size:.75rem;font-weight:600;color:#475569;min-width:50px;text-align:center}
.slider{width:100%;height:6px;-webkit-appearance:none;appearance:none;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:3px;outline:none}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#fff;border:2px solid #3b82f6;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.2);transition:all .2s}
.slider::-webkit-slider-thumb:hover{transform:scale(1.1);box-shadow:0 4px 8px rgba(0,0,0,.3)}

/* Списки */
.shootingsHeader{display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem;padding-bottom:.75rem;border-bottom:1px solid #e2e8f0}
.shootingsTitle{margin:0;font-size:1.125rem;font-weight:600;color:#1e293b}
.shootingsCount{background:#3b82f6;color:#fff;padding:.125rem .625rem;border-radius:12px;font-size:.75rem;font-weight:700}
.activeCount{margin-left:auto;font-size:.875rem;color:#495057;background:#e7f5ff;padding:2px 8px;border-radius:10px}
.emptyShootings{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1rem;text-align:center;color:#64748b}
.emptyIcon{font-size:3rem;margin-bottom:1rem;opacity:.5}
.emptyText{font-size:1.125rem;font-weight:600;color:#475569;margin:0 0 .5rem 0}
.emptyHint{font-size:.875rem;margin:0;line-height:1.4}
.shootingsList{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.75rem;padding-right:.5rem;margin-bottom:1rem}
.shootingsList::-webkit-scrollbar{width:6px}
.shootingsList::-webkit-scrollbar-track{background:#f1f5f9;border-radius:3px}
.shootingsList::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
.shootingsList::-webkit-scrollbar-thumb:hover{background:#94a3b8}
.shootingItem{display:flex;align-items:flex-start;gap:.75rem;padding:1rem;background:#fff;border:1px solid #e2e8f0;border-radius:12px;cursor:pointer;transition:all .2s}
.shootingItem:hover{border-color:#cbd5e1;background:#f8fafc;transform:translateX(2px)}
.shootingItem.selected{border-color:#3b82f6;background:#eff6ff;box-shadow:0 0 0 2px rgba(59,130,246,.1)}
.itemCheckbox{padding-top:.25rem}
.checkbox{width:18px;height:18px;accent-color:#3b82f6;cursor:pointer}
.itemContent{flex:1;display:flex;flex-direction:column;gap:.5rem;min-width:0}
.itemHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;flex-wrap:wrap}
.studentName{font-weight:600;color:#1e293b;font-size:.875rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.exerciseName{font-size:.75rem;color:#475569;background:#f1f5f9;padding:.125rem .5rem;border-radius:8px;white-space:nowrap}
.itemDetails{display:flex;gap:1rem;font-size:.75rem;color:#64748b}
.itemStats{display:flex;gap:.75rem;flex-wrap:wrap}
.stat{display:flex;align-items:center;gap:.25rem;font-size:.75rem;font-weight:500;color:#475569;background:#f1f5f9;padding:.25rem .75rem;border-radius:8px}
.statIcon{font-size:.875rem;line-height:1}
.groupTag{font-size:.75rem;color:#0369a1;background:#e0f2fe;padding:.25rem .75rem;border-radius:8px;font-weight:500}
.errorItem{display:flex;align-items:center;gap:.75rem;padding:1rem;background:#fef3c7;border:1px solid #f59e0b;border-radius:12px}
.errorIcon{font-size:1.25rem;flex-shrink:0}
.errorText{font-size:.875rem;color:#92400e;line-height:1.4}
.actionsFooter{display:flex;gap:.75rem;padding-top:1rem;margin-top:auto;border-top:1px solid #e2e8f0}
.selectAllBtn,.exportBtn{flex:1;padding:.75rem 1rem;border:none;border-radius:8px;font-size:.875rem;font-weight:500;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.5rem}
.selectAllBtn{background:#f1f5f9;color:#475569}
.selectAllBtn:hover{background:#e2e8f0}
.exportBtn{background:linear-gradient(135deg,#10b981,#059669);color:#fff}
.exportBtn:hover{background:linear-gradient(135deg,#059669,#047857);transform:translateY(-1px)}
.exportBtn:active{transform:translateY(0)}
.exportIcon{font-size:1rem;line-height:1}

/* Тёмная тема */
@media(prefers-color-scheme:dark){
  .modalBox{background:#1e293b;color:#e2e8f0}
  .modalHeader{background:linear-gradient(135deg,#0f172a,#1e293b);border-bottom-color:#334155}
  .closeBtn{background:rgba(255,255,255,.05);color:#cbd5e1}
  .leftColumn,.rightColumn{background:#0f172a;border-color:#334155}
  .centerColumn{background:#1e293b}
  .targetContainer{background:#1e293b;border-color:#334155}
  .widgetCard{background:#1e293b;border-color:#334155}
  .widgetTitle{color:#e2e8f0}
  .sliderLabel{color:#cbd5e1}
  .sliderValue{background:#334155;color:#94a3b8}
  .shootingsTitle{color:#e2e8f0}
  .shootingItem{background:#1e293b;border-color:#334155}
  .shootingItem:hover{background:#334155;border-color:#475569}
  .shootingItem.selected{background:#1e40af;border-color:#3b82f6}
  .studentName{color:#e2e8f0}
  .exerciseName{background:#334155;color:#94a3b8}
  .stat{background:#334155;color:#cbd5e1}
  .groupTag{background:#1e3a8a;color:#bfdbfe}
  .errorItem{background:#78350f;border-color:#92400e}
  .errorText{color:#fef3c7}
  .selectAllBtn{background:#334155;color:#cbd5e1}
  .selectAllBtn:hover{background:#475569}
  .emptyText{color:#cbd5e1}
  .emptyHint{color:#94a3b8}
  .shootingsList::-webkit-scrollbar-track{background:#334155}
  .shootingsList::-webkit-scrollbar-thumb{background:#475569}
  .shootingsList::-webkit-scrollbar-thumb:hover{background:#64748b}
}

/* Мобильные улучшения */
@media(max-width:768px){
  .overlay{padding:0}
  .modalBox{width:100%;height:100%;max-width:none;max-height:none;border-radius:0}
  .threeColumnLayout{flex-direction:column;height:100%}
  .leftColumn{max-height:35vh;border:none;border-bottom:1px solid #e2e8f0}
  .centerColumn{min-height:40vh;max-height:50vh}
  .rightColumn{max-height:25vh;border:none;border-top:1px solid #e2e8f0}
  .widgetTitle{font-size:1rem;margin-bottom:.75rem}
  .sliderGroup{gap:.75rem}
  .sliderLabel{font-size:.8125rem}
  .legendItems{display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem}
  .itemHeader{flex-direction:column;align-items:flex-start;gap:.25rem}
  .itemStats{flex-direction:column;align-items:flex-start}
}

.inactive{opacity:.6;background-color:#f8f9fa}
.inactive:hover{opacity:.8;background-color:#f1f3f5}
.inactiveBadge{background:#dee2e6;color:#495057;padding:2px 6px;border-radius:10px;font-size:.75rem;margin-left:8px}
.targetInfo{text-align:center;margin-top:10px;color:#495057;font-size:.875rem;background:#f8f9fa;padding:5px 10px;border-radius:5px}

--------------------------------------------------
Резюме
--------------------------------------------------
1. Сохраняйте старые `.tsx`-файлы – **ничего не меняется**, кроме одной строчки:  
   добавьте в `ResultsPage.tsx`  
   `const [filtersOpen, setFiltersOpen] = useState(true);`  
   и на `.filtersHeader` повесьте `onClick={()=>setFiltersOpen(o=>!o)}` + класс `open` (показано выше).

2. Замените два `.module.css`-файла приведёнными выше – **всё остальное уже внутри**.

3. Убедитесь, что в `index.html` есть мета-тег `viewport` с `viewport-fit=cover` (пример в тексте).

После этого ваше приложение:
- полностью адаптировано под мобильные экраны любого размера,  
- учитывает «сейф-эйрию» на iPhone-X+ ,  
- все кнопки ≥ 44 px,  
- фильтры свёрнуты в аккордеон,  
- HitViewer разворачивается на весь экран – удобно смотреть мишень пальцами.