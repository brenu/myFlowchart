import { useEffect } from "react";
import AppRoutes from "./routes.js";

function App() {
  useEffect(() => {
    const flowchartData = localStorage.getItem("myFlowchart@flowchart");

    if (!flowchartData) {
      localStorage.setItem("myFlowchart@flowchart", JSON.stringify([
        [
          {code: "CET-635", name: "Linguagem de Programação I", summary: "Ementa legal aqui"},
          {code: "FCH-310", name: "Metodologia da Pesquisa Científica", summary: "Ementa legal aqui"},
          {code: "CET-633", name: "Física para Ciência da Computação", summary: "Ementa legal aqui"},
          {code: "CET-634", name: "Introdução à Ciência da Computação", summary: "Ementa legal aqui"},
          {code: "CET-636", name: "Lógica para Computação", summary: "Ementa legal aqui"},
          {code: "CET-632", name: "Cálculo Aplicado I", summary: "Ementa legal aqui"},
          {code: "LTA-322", name: "Inglês Instrumental", summary: "Ementa legal aqui"}
        ],
        [
          {code: "CET-641", name: "Linguagem de Programação II", summary: "Ementa legal aqui", prerequisites: ["CET-635"]},
          {code: "CET-638", name: "Álgebra e Geometria Analítica", summary: "Ementa legal aqui"},
          {code: "CET-637", name: "Eletrônica", summary: "Ementa legal aqui", prerequisites: ["CET-633","CET-634"]},
          {code: "CET-642", name: "Lógica Digital I", summary: "Ementa legal aqui", prerequisites: ["CET-636"]},
          {code: "CET-640", name: "Fund. Matemáticos para Computação", summary: "Ementa legal aqui", prerequisites: ["CET-636"]},
          {code: "CET-639", name: "Cálculo Aplicado II", summary: "Ementa legal aqui", prerequisites: ["CET-632"]},
        ],
        [
          {code: "CET-078", name: "Linguagem de Programação III", summary: "Ementa legal aqui", prerequisites: ["CET-641"]},
          {code: "CET-077", name: "Estrutura de Dados", summary: "Ementa legal aqui", prerequisites: ["CET-641"]},
          {code: "CET-074", name: "Álgebra Abstrata", summary: "Ementa legal aqui", prerequisites: ["CET-638"]},
          {code: "CET-065", name: "Lógica Digital II", summary: "Ementa legal aqui", prerequisites: ["CET-637","CET-642"]},
          {code: "CAE-015", name: "Fundamentos de Economia", summary: "Ementa legal aqui"},
          {code: "CET-075", name: "Cálculo Aplicado III", summary: "Ementa legal aqui", prerequisites: ["CET-639"]},
        ],
      ]));
    }
  }, []);

  return <AppRoutes />;
}

export default App;
