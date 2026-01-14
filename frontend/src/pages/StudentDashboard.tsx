import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import type { Shooting, Group } from "../types";
import styles from "../styles/StudentDashboard.module.css";

export default function StudentDashboard() {
  const [shootings, setShootings] = useState<Shooting[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const load = useCallback(async () => {
    const [s, g] = await Promise.all([
      api.get("/shootings").then(r => r.data),
      api.get("/groups").then(r => r.data),
    ]);
    setShootings(s);
    setGroups(g);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={styles.page}>
        <h2 className={styles.h2}>Личный кабинет стрелка</h2>

        <h3 className={styles.h3}>Мои группы</h3>
        {groups.length ? (
        <ul className={styles.list}>
            {groups.map((gr) => (
            <li key={gr.id}>{gr.name}</li>
            ))}
        </ul>
        ) : (
        <p className={styles.empty}>Вы пока не состоите ни в одной группе.</p>
        )}

        <Link to="/shooting">
        <button className={styles.addBtn}>Добавить стрельбу</button>
        </Link>

        <h3 className={styles.h3}>Мои результаты</h3>
        {shootings.length ? (
        <table className={styles.table}>
            <thead>
            <tr>
                <th>Дата</th>
                <th>Упражнение</th>
                <th>Примечание</th>
                <th>Фото</th>
            </tr>
            </thead>
            <tbody>
            {shootings.map((sh) => (
                <tr key={sh.id}>
                <td>{new Date(sh.created_at).toLocaleString("ru-RU")}</td>
                {/*  ГЛАВНОЕ ИСПРАВЛЕНИЕ  */}
                <td>{sh.exercise.name}</td>
                <td>{sh.note || "—"}</td>
                <td>
                    <a
                    href={`${import.meta.env.VITE_API_URL}${sh.photo_url}`}
                    target="_blank"
                    rel="noreferrer"
                    >
                    <img
                        className={styles.img}
                        src={`${import.meta.env.VITE_API_URL}${sh.photo_url}`}
                        alt="shot"
                    />
                    </a>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        ) : (
        <p className={styles.empty}>Ещё нет сохранённых стрельб.</p>
        )}
    </div>
    );
}