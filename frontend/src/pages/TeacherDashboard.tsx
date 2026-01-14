import { useCallback, useEffect, useState } from "react";
import api, { getExercises } from "../api";
import type { Group, User, Exercise } from "../types";
import styles from "../styles/TeacherDashboard.module.css";
import AddExercise from "./AddExercise";

export default function TeacherDashboard() {
  /* ----------- группы ----------- */
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupName, setGroupName] = useState("");

  /* ----------- ученики ----------- */
  const [students, setStudents] = useState<User[]>([]);
  const [showCreateSt, setShowCreateSt] = useState(false);
  const [newLogin, setNewLogin] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newGroupId, setNewGroupId] = useState<number | "">("");

  /* ----------- упражнения ----------- */
  const [exercises, setExercises] = useState<Exercise[]>([]);

  /* ----------- приглашения ----------- */
  const [invite, setInvite] = useState<{ link: string; password: string } | null>(null);

  /* ----------- общая загрузка ----------- */
  const loadTeacher = useCallback(async () => {
    const [g, s, ex] = await Promise.all([
      api.get<Group[]>("/groups").then((r) => r.data),
      api.get<User[]>("/students").then((r) => r.data),
      getExercises().then((r) => r.data),
    ]);
    setGroups(g);
    setStudents(s);
    setExercises(ex);
  }, []);

  /* загружаем данные */
  useEffect(() => {
    loadTeacher().catch(console.error);
  }, [loadTeacher]);

  /* ----------- группы: создание ----------- */
  const createGroup = async () => {
    if (!groupName.trim()) return;
    await api.post("/groups", { name: groupName });
    setGroupName("");
    await loadTeacher();
  };

  /* ----------- ученики: создание ----------- */
  const createStudent = async () => {
    if (!newLogin.trim() || !newPass.trim()) return;
    await api.post("/students/create", {
      username: newLogin,
      password: newPass,
      group_id: newGroupId || undefined,
    });
    setNewLogin("");
    setNewPass("");
    setNewGroupId("");
    setShowCreateSt(false);
    await loadTeacher();
  };

  /* ----------- создание приглашения для коллеги ----------- */
  const createTeacherInvite = async () => {
    const pwd = prompt("Придумайте пароль для приглашения:");
    if (!pwd) return;
    try {
      const { data } = await api.post<{ link: string; password: string }>("/invites/teacher-link", {
        password: pwd,
      });
      setInvite({ link: data.link, password: data.password });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(msg || "Ошибка создания приглашения");
    }
  };

  /* ----------- компонент «InviteLinks» внутри этой же файлы ----------- */
  const InviteLinks = () => {
    const [tCode, setTCode] = useState("");
    const [sCode, setSCode] = useState("");

    const loadCodes = useCallback(async () => {
      const [t, s] = await Promise.all([
        api.get<{ invite_code: string }>("/invites/teacher").then((r) => r.data.invite_code),
        api.get<{ invite_code: string }>("/invites/student").then((r) => r.data.invite_code),
      ]);
      setTCode(t);
      setSCode(s);
    }, []);

    useEffect(() => {
      loadCodes().catch(console.error);
    }, [loadCodes]);

    return (
      <div className={styles.inviteBlock}>
        <div style={{ marginBottom: "1rem" }}>
          Для преподавателей: <span className={styles.code}>{tCode}</span>
        </div>

        <button className={styles.btn} onClick={createTeacherInvite}>
          Создать приглашение для коллеги
        </button>

        {invite && (
          <div className={styles.inviteBlock} style={{ marginTop: "1rem" }}>
            <div>
              Ссылка: <b>{invite.link}</b>
            </div>
            <div>
              Пароль: <b>{invite.password}</b>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          Для учеников: <span className={styles.code}>{sCode}</span>
        </div>
      </div>
    );
  };

  /* ----------- рендер ----------- */
  return (
    <div className={styles.page}>
      <h2 className={styles.h2}>Преподаватель</h2>

      {/*  УПРАЖНЕНИЯ  */}
      <h3 className={styles.h3}>Мои упражнения</h3>
      <ul className={styles.list}>
        {exercises.map((ex) => (
          <li key={ex.id}>
            {ex.name} (попаданий: {ex.max_hits}, время: {ex.time_sec || "∞"} с)
          </li>
        ))}
      </ul>
      <AddExercise onAdd={loadTeacher} />

      {/*  УЧЕНИКИ  */}
      <h3 className={styles.h3}>Ученики</h3>
      {!showCreateSt ? (
        <button className={styles.btn} onClick={() => setShowCreateSt(true)}>
          Создать ученика
        </button>
      ) : (
        <div className={styles.inline}>
          <input
            className={styles.input}
            placeholder="Логин"
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Пароль"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <select
            className={styles.input}
            value={newGroupId}
            onChange={(e) => setNewGroupId(Number(e.target.value) || "")}
          >
            <option value="">– без группы –</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button className={styles.btn} onClick={createStudent}>
            Сохранить
          </button>
          <button className={styles.btn} onClick={() => setShowCreateSt(false)}>
            Отмена
          </button>
        </div>
      )}

      {/*  ГРУППЫ  */}
      <h3 className={styles.h3}>Мои группы</h3>
      <ul className={styles.list}>
        {groups.map((g) => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
      <input
        className={styles.input}
        placeholder="название группы"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button className={styles.btn} onClick={createGroup}>
        Создать
      </button>

      {/*  СПИСОК УЧЕНИКОВ  */}
      <h3 className={styles.h3}>Список учеников</h3>
      <ul className={styles.list}>
        {students.map((s) => (
          <li key={s.id}>{s.username}</li>
        ))}
      </ul>

      <InviteLinks />
    </div>
  );
}