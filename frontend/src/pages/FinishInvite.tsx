import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import styles from "../styles/Login.module.css"; // переиспользуем те же стили

export default function FinishInvite() {
  const [params] = useSearchParams();
  const code = params.get("code") ?? "";
  const [password, setPassword]   = useState(""); // пароль из приглашения
  const [username, setUsername]   = useState("");
  const [newPwd, setNewPwd]       = useState("");
  const nav = useNavigate();

  const submit = async () => {
    if (!code || !password || !username || !newPwd) {
      alert("Заполните все поля");
      return;
    }
    try {
      await api.post("/auth/finish-invite", {
        code,
        password,
        username,
        new_password: newPwd,
      });
      alert("Аккаунт создан – войдите");
      nav("/login");
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Ошибка");
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Завершение регистрации преподавателя</h2>

      <label className={styles.label}>Пароль из приглашения</label>
      <input
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className={styles.label}>Придумайте логин</label>
      <input
        className={styles.input}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className={styles.label}>Придумайте пароль</label>
      <input
        className={styles.input}
        type="password"
        value={newPwd}
        onChange={(e) => setNewPwd(e.target.value)}
      />

      <button className={styles.btn} onClick={submit}>
        Создать аккаунт
      </button>
    </div>
  );
}