import { useEffect } from "react";
import useSections from "../hooks/useSections";
import SongSection from "../components/SongSection";
import "../styles/Home.css";

function Home() {
  const { sections, loading } = useSections();

  useEffect(() => { document.title = "Home"; }, []);

  return (
    <div className="home-content">
      <h1 className="text-2xl font-semibold text-blue-900">
        Nghe nhạc bằng cả tính mạng
      </h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        sections.map((section) => (
          <SongSection
            key={section._id}
            title={section.name}
            songs={section.songs}
            layout={section.layout}
            songList={section.songs}
          />
        ))
      )}
      <footer>
        <p>© 2026 Me_EM — Enjoy music anytime, anywhere.</p>
      </footer>
    </div>
  );
}

export default Home;
