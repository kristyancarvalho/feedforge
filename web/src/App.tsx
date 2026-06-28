import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RadarPage } from "./pages/RadarPage";
import { NewsDetailPage } from "./pages/NewsDetailPage";
import { SavedNewsPage } from "./pages/SavedNewsPage";
import { SourcesPage } from "./pages/SourcesPage";
import { RunsPage } from "./pages/RunsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<RadarPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="saved" element={<SavedNewsPage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="runs" element={<RunsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
