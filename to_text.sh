#!/bin/bash

# Файл для вывода
OUTPUT_FILE="all_files_content.txt"

# Список исключений (через пробел)
EXCLUDE_LIST="node_modules .next .git __pycache__ v1 infra  *.module.css Readme.md models *.log init tests package-lock.json venv all_files_content.txt venv pnpm-lock.yaml"

# Функция для проверки, нужно ли исключить файл/директорию
should_exclude() {
    local item="$1"
    for pattern in $EXCLUDE_LIST; do
        if [[ "$item" == $pattern ]]; then
            return 0  # true - исключить
        fi
    done
    return 1  # false - не исключать
}

# Очищаем файл вывода
> "$OUTPUT_FILE"

# Функция для обработки директории
process_directory() {
    local dir="$1"
    
    for item in "$dir"/*; do
        # Получаем только имя файла/директории
        local base_name=$(basename "$item")
        
        # Пропускаем текущую и родительскую директории
        if [[ "$base_name" == "." || "$base_name" == ".." ]]; then
            continue
        fi
        
        # Проверяем исключения
        if should_exclude "$base_name"; then
            echo "Пропускаем: $item" >&2
            continue
        fi
        
        if [[ -d "$item" ]]; then
            # Это директория - рекурсивно обрабатываем
            echo "Обрабатываем директорию: $item" >&2
            process_directory "$item"
        elif [[ -f "$item" ]]; then
            # Это файл - записываем его содержимое
            echo "Обрабатываем файл: $item" >&2
            echo "=== Файл: $item ===" >> "$OUTPUT_FILE"
            
            # Пытаемся прочитать файл как текст
            if file "$item" | grep -q "text"; then
                cat "$item" >> "$OUTPUT_FILE" 2>/dev/null
            else
                echo "[Бинарный файл - содержимое не отображается]" >> "$OUTPUT_FILE"
            fi
            
            echo -e "\n=== Конец файла: $item ===\n" >> "$OUTPUT_FILE"
        fi
    done
}

# Запускаем обработку с текущей директории
echo "Начинаем обработку файлов..."
process_directory "."

echo "Готово! Все файлы записаны в: $OUTPUT_FILE"