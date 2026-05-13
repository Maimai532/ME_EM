import { useState, useEffect } from "react";
import { getSections } from "../services/sectionService";

function useSections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSections()
      .then((data) => setSections(data))
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  return { sections, loading };
}

export default useSections;
