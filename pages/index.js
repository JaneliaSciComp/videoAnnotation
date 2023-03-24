import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <canvas id="canvas" className={styles.canvas} width="600" height="450">
          <Image id="img" width="600" height="450" alt="img"/>
        </canvas>
      </main>

      <footer className={styles.footer}>
       
      </footer>
    </div>
  )
}
