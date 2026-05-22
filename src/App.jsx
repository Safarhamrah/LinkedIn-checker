import { Navigate, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import Progress from "@/pages/Progress";
import Results from "@/pages/Results";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
