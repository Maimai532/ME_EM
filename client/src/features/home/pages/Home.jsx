import { useEffect } from "react";
import useSections from "../hooks/useSections";
import SongSection from "../components/SongSection";
import ArtistSection from "../components/ArtistSection";
import "../styles/Home.css";

function Home() {
  const { sections, artists, loading } = useSections();

  useEffect(() => {
    document.title = "Me_Em";
  }, []);

  return (
    <div className="home-content">
      <h1>Tôi yêu âm nhạc</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          {sections.map((section) =>
            section.type === "artist" ? (
              <ArtistSection
                key={section._id}
                title={section.name}
                artist={section.artists || []}
                layout={section.layout}
              />
            ) : (
              <SongSection
                key={section._id}
                title={section.name}
                songs={section.songs || []}
                songList={section.songs || []}
                layout={section.layout}
              />
            ),
          )}
        </>
      )}

      <footer>
        <p>© 2026 Me_EM — Enjoy music anytime, anywhere.</p>
      </footer>
    </div>
  );
}

export default Home;
