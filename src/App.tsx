export default function App() {
  return (
    <main className="app-shell">
      <section className="welcome-card" aria-labelledby="app-title">
        <p className="eyebrow">English for every journey</p>
        <h1 id="app-title">WanderWords</h1>
        <p className="intro">
          ต่อคำศัพท์ที่คุณจะได้ใช้จริงในร้านอาหาร ระหว่างเดินทาง ที่พัก
          และสถานที่ท่องเที่ยว
        </p>
        <form className="player-form">
          <label htmlFor="player-name">ชื่อผู้เล่น</label>
          <input
            id="player-name"
            name="playerName"
            type="text"
            placeholder="เช่น Mook"
            autoComplete="nickname"
          />
          <button type="submit">เริ่มการเดินทาง</button>
        </form>
      </section>
    </main>
  );
}

