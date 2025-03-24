const results = document.getElementById("results");
const cant = document.getElementById("input");
const convert = document.getElementById("btn-convert");
const selectMoneda = document.getElementById("select-moneda");
const showGraph = document.getElementById("showGraph");

async function getTasas() {
  try {
    const res = await fetch("https://mindicador.cl/api/");
    const tasas = await res.json();
    return tasas;
  } catch {
    alert("Error consumiendo la API");
  }
}

async function renderTasas() {
  const opcionSeleccionada = selectMoneda.value;
  const tasas = await getTasas();

  const value = cant.value;
  let html = "";

  if (opcionSeleccionada === "Dolar") {
    dolarResult = value / tasas.dolar.valor;
    html += `<p>Resultado: ${dolarResult}</p>`;
  } else if (opcionSeleccionada === "Euros") {
    euroResult = value / tasas.euro.valor;
    html += `<p>Resultado: ${euroResult}</p>`;
  } else {
    html += `<p>Seleccione una moneda valida</p>`;
  }

  results.innerHTML = html;
}

convert.addEventListener("click", () => {
  renderTasas();
});

showGraph.addEventListener("click", () => {
  renderGraph();
});

async function getDataGraph() {
  try {
    const [resDollar, resEuro] = await Promise.all([
      fetch("https://mindicador.cl/api/dolar"),
      fetch("https://mindicador.cl/api/euro"),
    ]);

    const dataDollar = await resDollar.json();
    const dataEuro = await resEuro.json();

    const labels = dataDollar.serie
      .map((entry) => entry.fecha.slice(0, 10))
      .reverse();

    const dollarValues = dataDollar.serie.map((entry) => entry.valor).reverse();
    const euroValues = dataEuro.serie.map((entry) => entry.valor).reverse();

    return {
      labels: labels,
      datasets: [
        {
          label: "Valor del Dólar",
          data: dollarValues,
          borderColor: "blue",
          backgroundColor: "rgba(0, 0, 255, 0.2)",
        },
        {
          label: "Valor del Euro",
          data: euroValues,
          borderColor: "red",
          backgroundColor: "rgba(255, 0, 47, 0.2)",
        },
      ],
    };
  } catch (error) {
    alert("Error consumiendo la API");
    console.error(error);
  }
}

let chartInstance = null;

async function renderGraph() {
  const data = await getDataGraph();
  const config = {
    type: "line",
    data: data,
  };

  const graph = document.querySelector("#graph");
  graph.style.backgroundColor = "black";

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(graph, config);
}
