import { useState } from "react";
import api from "../api";
import styles from "../styles/Register.module.css";

export default function Register() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [code, setCode] = useState("");

  const reg = async () => {
    await api.post("/auth/register", { username: u, password: p, invite_code: code });
    window.location.href = "/login";
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Регистрация</h2>

      <label className={styles.label}>Логин</label>
      <input className={styles.input} value={u} onChange={e => setU(e.target.value)} />

      <label className={styles.label}>Пароль</label>
      <input className={styles.input} type="password" value={p} onChange={e => setP(e.target.value)} />

      <label className={styles.label}>Код приглашения</label>
      <input className={styles.input} value={code} onChange={e => setCode(e.target.value)} />

      <button className={styles.btn} onClick={reg}>Зарегистрироваться</button>
    </div>
  );
}