import AlbumCard from './AlbumCard'
import '../styles/AlbumSection.css'

function AlbumSection({ title, albums = [] }) {
  return (
    <section className="album-section">
      <div className="album-section__header">
        <h2 className="album-section__title">{title}</h2>
      </div>
      <div className="album-section__scroll">
        {albums.map(a => (
          <AlbumCard key={a._id} album={a} />
        ))}
      </div>
    </section>
  )
}

export default AlbumSection