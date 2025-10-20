import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <span className={styles.title}>
          Привет мой любимый Эндкул как дела как жизнь?
        </span>
      </main>
    </div>
  );
}
