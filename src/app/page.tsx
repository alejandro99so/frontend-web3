import styles from "./page.module.css";
import { SendTransaction } from "../../utils/send-transaction";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <w3m-button />
        <p>Empezando</p>
        <SendTransaction />
      </main>
    </div>
  );
}
