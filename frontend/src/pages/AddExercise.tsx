import { useState } from "react";
import { createExercise } from "../api";
import styles from "../styles/TeacherDashboard.module.css";

export default function AddExercise({ onAdd }: { onAdd: () => void }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [hits, setHits] = useState(10);
  const [sec, setSec] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const submit = async () => {
    if (!file || !name.trim()) return;
    const form = new FormData();
    form.set("name", name);
    form.set("max_hits", String(hits));
    form.set("time_sec", String(sec));
    form.set("target", file);
    await createExercise(form);
    setName(""); setHits(10); setSec(0); setFile(null); setShow(false);
    onAdd();
  };

  return (
    <>
      {!show ? (
        <button className={styles.btn} onClick={() => setShow(true)}>
          Добавить упражнение
        </button>
      ) : (
        <div className={styles.inline}>
          <input
            className={styles.input}
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={styles.input}
            type="number"
            min={1}
            value={hits}
            onChange={(e) => setHits(Number(e.target.value))}
          />
          <input
            className={styles.input}
            type="number"
            min={0}
            value={sec}
            onChange={(e) => setSec(Number(e.target.value))}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button className={styles.btn} onClick={submit}>
            Сохранить
          </button>
          <button className={styles.btn} onClick={() => setShow(false)}>
            Отмена
          </button>
        </div>
      )}
    </>
  );
}