import { useState } from "react";
import api from "../api";
import styles from "../styles/Login.module.css";

export default function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [log, setLog] = useState(""); // <-- строчка-лог

  const login = async () => {
    setLog("login called");            // <-- сигнал
    const form = new FormData();
    form.set("username", u);
    form.set("password", p);
    try {
      const { data } = await api.post("/auth/token", form);
      setLog("token ok");              // <-- успех
      localStorage.setItem("token", data.access_token);
      window.location.href = "/";
    } catch (e: any) {
      setLog("error: " + (e?.response?.data?.detail || "network")); // <-- ошибка
    }
  };

  return (
    <>
      {/* ВИДИМЫЙ ЛОГ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "#111",
          color: "#0f0",
          fontSize: "14px",
          padding: "4px 8px",
          zIndex: 9999,
          whiteSpace: "pre-wrap",
        }}
      >
        {log || "..."}
      </div>

      {/* ваша форма */}
      <div className={styles.wrapper} style={{ marginTop: 40 }}>
        <h2 className={styles.title}>Вход</h2>

        <label className={styles.label}>Логин</label>
        <input
          className={styles.input}
          value={u}
          onChange={(e) => setU(e.target.value)}
        />

        <label className={styles.label}>Пароль</label>
        <input
          className={styles.input}
          type="password"
          value={p}
          onChange={(e) => setP(e.target.value)}
        />

        {/* КНОПКА С ДВУМЯ СОБЫТИЯМИ */}
        <button
          className={styles.btn}
          type="button"
          onTouchEnd={(e) => {
            e.preventDefault();
            setLog("touch");
            login();
          }}
          onClick={(e) => {
            e.preventDefault();
            setLog("click");
            login();
          }}
        >
          Войти
        </button>
      </div>
    </>
  );
}