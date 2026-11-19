import { useEffect, useRef, useState } from "react";
import {
  ASSUMPTION_BOUNDS,
  calculateRevenue,
  DEFAULT_ASSUMPTIONS,
  parseSavedScenarios,
  PRESET_SCENARIOS,
  sanitizeScenarioName,
  SCENARIO_STORAGE_KEY,
  validateAssumptions,
} from "../utils/pricingModel.js";

const COHORT_LABEL = "DATOS SIMULADOS / COHORTE DE PRUEBA (n=60)";

const CURRENCY = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const NUMBER = new Intl.NumberFormat("en-US");

const CONTROLS = [
  {
    key: "sandboxAccounts",
    label: "Cuentas del entorno de pruebas de Nivel 1",
    min: 0,
    max: 200,
    step: 1,
  },
  {
    key: "conversionPercent",
    label: "Tasa de conversión de pruebas a clientes de paga",
    min: 5,
    max: 50,
    step: 1,
    suffix: "%",
  },
  {
    key: "tier2Profiles",
    label: "Perfiles mensuales promedio por distribuidor de Nivel 2",
    min: 100,
    max: 2000,
    step: 50,
  },
  {
    key: "enterpriseClients",
    label: "Clientes empresariales de Nivel 3",
    min: 0,
    max: 20,
    step: 1,
  },
  {
    key: "tier3Profiles",
    label: "Perfiles mensuales promedio por cliente de Nivel 3",
    min: 500,
    max: 10000,
    step: 100,
  },
];

function formatCurrency(value) {
  return `$${CURRENCY.format(Math.round(value))} MXN`;
}

function getScenarioDisplayName(scenario) {
  const presetNames = {
    "preset-conservative": "Lanzamiento conservador",
    "preset-month-six": "Mes 6 base ($249k MXN)",
    "preset-regional": "Escala regional",
  };
  return presetNames[scenario.id] || scenario.name;
}

function KpiCard({ label, monthly, annual, percent = false }) {
  const display = (value) =>
    percent ? `${value.toFixed(2)}%` : formatCurrency(value);

  return (
    <article className="kpi-card">
      <h3>{label}</h3>
      <p className="kpi-value">{display(monthly)}</p>
      <p className="kpi-period">Mensual</p>
      <p className="kpi-annual">{percent ? "Margen anualizado" : display(annual)}</p>
      <p className="kpi-period">Anual</p>
    </article>
  );
}

export default function PricingPage() {
  const [assumptions, setAssumptions] = useState({ ...DEFAULT_ASSUMPTIONS });
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioError, setScenarioError] = useState("");
  const [storageError, setStorageError] = useState("");
  const scenarioCounter = useRef(0);
  const revenue = calculateRevenue(assumptions);

  useEffect(() => {
    try {
      const serialized = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
      if (serialized) {
        const parsed = parseSavedScenarios(serialized);
        setSavedScenarios(parsed.scenarios);
        if (parsed.rejectedCount > 0) {
          window.localStorage.setItem(
            SCENARIO_STORAGE_KEY,
            JSON.stringify(parsed.scenarios)
          );
          setStorageError(
            `Se eliminaron de este navegador ${parsed.rejectedCount} escenario(s) no válido(s) o con datos identificables.`
          );
        }
      }
    } catch (error) {
      try {
        window.localStorage.removeItem(SCENARIO_STORAGE_KEY);
        setSavedScenarios([]);
        setStorageError(
          `Se borraron los escenarios guardados no válidos de este navegador. ${
            error instanceof Error ? error.message : "Los datos guardados no eran válidos."
          }`
        );
      } catch (cleanupError) {
        setStorageError(
          `No se pudieron validar ni eliminar los escenarios guardados. ${
            cleanupError instanceof Error
              ? cleanupError.message
              : "Borra manualmente el almacenamiento local de esta aplicación."
          }`
        );
      }
    }
  }, []);

  const updateAssumption = (key, value) => {
    const [min, max] = ASSUMPTION_BOUNDS[key];
    if (!Number.isFinite(value)) {
      return;
    }
    const boundedValue = Math.min(max, Math.max(min, Math.trunc(value)));
    setAssumptions((current) => ({ ...current, [key]: boundedValue }));
  };

  const storeScenarios = (nextScenarios) => {
    try {
      window.localStorage.setItem(
        SCENARIO_STORAGE_KEY,
        JSON.stringify(nextScenarios)
      );
      setSavedScenarios(nextScenarios);
      setStorageError("");
      return true;
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `No se pudieron guardar los escenarios: ${error.message}`
          : "No se pudieron guardar los escenarios en este navegador."
      );
      return false;
    }
  };

  const saveScenario = (event) => {
    event.preventDefault();
    const safeName = sanitizeScenarioName(scenarioName);
    if (!safeName.name) {
      setScenarioError(safeName.error);
      return;
    }
    const validAssumptions = validateAssumptions(assumptions);
    if (!validAssumptions) {
      setScenarioError("Los valores del simulador no son válidos. Restablece los controles e inténtalo de nuevo.");
      return;
    }

    scenarioCounter.current += 1;
    const nextScenarios = [
      ...savedScenarios,
      {
        id: `saved-${Date.now()}-${scenarioCounter.current}`,
        name: safeName.name,
        assumptions: validAssumptions,
      },
    ];
    if (storeScenarios(nextScenarios)) {
      setScenarioName("");
      setScenarioError("");
    }
  };

  const loadScenario = (scenario) => {
    const validAssumptions = validateAssumptions(scenario.assumptions);
    if (!validAssumptions) {
      setStorageError("Este escenario contiene valores no válidos y no se puede cargar.");
      return;
    }
    setAssumptions(validAssumptions);
    setScenarioError("");
  };

  const deleteScenario = (scenarioId) => {
    storeScenarios(savedScenarios.filter((scenario) => scenario.id !== scenarioId));
  };

  const scenariosForComparison = [
    ...PRESET_SCENARIOS,
    ...savedScenarios,
  ].map((scenario) => ({
    ...scenario,
    displayName: getScenarioDisplayName(scenario),
    revenue: calculateRevenue(scenario.assumptions),
  }));

  return (
    <main className="content-shell pricing-page">
      <section className="page-heading">
        <p className="eyebrow">Validador del Comercio · Precios</p>
        <h1>Precios: el número que dice la verdad</h1>
        <p className="intro">
          Dos segmentos de clientes, tres niveles claros y un modelo transparente
          de la economía detrás de los perfiles verificados de flujo de efectivo.
        </p>
      </section>

      <aside className="merchant-price-notice" aria-label="Nota para comerciantes">
        <strong>Nota para comerciantes:</strong> El registro por voz para tu puesto
        es 100% GRATIS ($0 MXN). Los planes siguientes son exclusivamente para
        distribuidores mayoristas y microaseguradoras.
      </aside>

      <section aria-labelledby="plans-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dos segmentos de clientes · tres niveles</p>
            <h2 id="plans-heading">Planes y precios</h2>
          </div>
          <p className="free-paid-key"><span>GRATIS</span> entorno de pruebas · <span>DE PAGA</span> comercial y empresarial</p>
        </div>
        <div className="tier-grid">
          <article className="tier-card">
            <p className="tier-label">Nivel 1 · GRATIS</p>
            <h3>Entorno de pruebas para desarrolladores</h3>
            <p className="tier-price">$0 MXN <span>/ mes</span></p>
            <p>Hasta 10 perfiles de prueba al mes, con perfiles históricos verificados de otra región.</p>
            <ul>
              <li>Se requiere RFC de empresa.</li>
              <li>Bloqueo si hay traslape de rutas.</li>
              <li>Solo JSON anonimizado.</li>
            </ul>
          </article>
          <article className="tier-card tier-card--featured">
            <p className="tier-label">Nivel 2 · PAGO POR PERFIL</p>
            <h3>Distribuidor comercial</h3>
            <p className="tier-price">$30 MXN <span>/ perfil validado</span></p>
            <p>Para distribuidores de productos de consumo y mayoristas que ofrecen <em>fiado</em>.</p>
            <ul>
              <li>Puente de webhook en vivo con el `Client #ID` del ERP.</li>
              <li>Doble ciclo con Llama-3.1-70B; SLA de precisión declarado del 95%.</li>
              <li>Recuperación automática por WhatsApp después de 90 segundos.</li>
              <li>Respuesta enmascarada: `approval_status`, `credit_cap_mxn`, `confidence_score`.</li>
            </ul>
          </article>
          <article className="tier-card">
            <p className="tier-label">Nivel 3 · EMPRESARIAL</p>
            <h3>Acuerdo de servicio empresarial (SLA)</h3>
            <p className="tier-price">$15,000 MXN <span>/ mes + $15 MXN por perfil</span></p>
            <p>Para microaseguradoras e instituciones financieras de alto volumen.</p>
            <ul>
              <li>Volumen ilimitado y cola prioritaria.</li>
              <li>Bitácoras de auditoría conforme a la LFPDPPP.</li>
              <li>Borrado automático del audio y la telemetría sin procesar a las 24 horas.</li>
            </ul>
          </article>
        </div>
        <p className="disclaimer">
          Los niveles de servicio y las integraciones describen la oferta
          propuesta; este simulador no implementa servicios reales de ERP,
          WhatsApp ni modelos de IA.
        </p>
      </section>

      <section className="simulator-section" aria-labelledby="simulator-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cambia un supuesto y observa el resultado</p>
            <h2 id="simulator-heading">Simulador de ingresos</h2>
          </div>
          <span className="simulation-badge">{COHORT_LABEL}</span>
        </div>

        <div className="simulator-layout">
          <div className="simulator-controls">
            {CONTROLS.map((control) => (
              <label className="slider-control" key={control.key}>
                <span className="slider-label">{control.label}</span>
                <span className="slider-value">
                  {NUMBER.format(assumptions[control.key])}
                  {control.suffix || ""}
                </span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={assumptions[control.key]}
                  onChange={(event) =>
                    updateAssumption(control.key, Number(event.target.value))
                  }
                  aria-label={control.label}
                />
                <span className="slider-bounds">
                  <span>{NUMBER.format(control.min)}{control.suffix || ""}</span>
                  <span>{NUMBER.format(control.max)}{control.suffix || ""}</span>
                </span>
              </label>
            ))}

            <aside className="cogs-note">
              <h3>Supuestos transparentes del costo por perfil</h3>
              <p>Costo base: $2.50 MXN por perfil</p>
              <ul>
                <li>$0.65 API de WhatsApp</li>
                <li>$0.50 Whisper</li>
                <li>$1.10 Llama-3.1-70B</li>
                <li>$0.25 almacenamiento y webhooks</li>
              </ul>
              <p>
                Más 15% por reintentos: $2.50 × 1.15 = <strong>$2.875 MXN de costo total por perfil</strong>.
              </p>
            </aside>
          </div>

          <div className="kpi-panel">
            <h3>Proyección mensual y anual</h3>
            <p className="profile-total">
              {NUMBER.format(revenue.totalProfiles)} perfiles en total al mes
            </p>
            <div className="kpi-grid">
              <KpiCard label="Ingresos brutos" monthly={revenue.monthlyRevenue} annual={revenue.annualRevenue} />
              <KpiCard label="Costo de ventas (COGS)" monthly={revenue.monthlyCogs} annual={revenue.annualCogs} />
              <KpiCard label="Utilidad bruta neta" monthly={revenue.monthlyGrossProfit} annual={revenue.annualGrossProfit} />
              <KpiCard label="Margen bruto" monthly={revenue.grossMarginPercent} annual={revenue.grossMarginPercent} percent />
            </div>
            <p className="calculation-note">
              Los perfiles del entorno de pruebas del Nivel 1 son gratis; las
              cuentas convertidas se consideran clientes del Nivel 2. La
              utilidad bruta es el ingreso menos el costo de ventas estimado.
            </p>
          </div>
        </div>
      </section>

      <section className="scenario-section" aria-labelledby="scenarios-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Solo en este navegador · sin cuentas ni datos personales</p>
            <h2 id="scenarios-heading">Escenarios guardados</h2>
          </div>
          <span className="simulation-badge">{COHORT_LABEL}</span>
        </div>
        <p className="scenario-privacy">
          Los escenarios solo contienen los cinco supuestos del simulador y un
          nombre genérico. Se rechazan nombres de personas, datos de contacto,
          identificadores de cuentas y datos de comerciantes. No se envía nada
          a un servidor.
        </p>
        <form className="scenario-form" onSubmit={saveScenario}>
          <label htmlFor="scenario-name">Nombre del escenario (máximo 40 caracteres)</label>
          <div className="scenario-form-row">
            <input
              id="scenario-name"
              type="text"
              maxLength={40}
              value={scenarioName}
              onChange={(event) => {
                setScenarioName(event.target.value);
                setScenarioError("");
              }}
              placeholder="Por ejemplo: Escala Regional"
              aria-describedby="scenario-name-help"
            />
            <button type="submit" className="primary-action">Guardar supuestos actuales</button>
          </div>
          <p id="scenario-name-help" className="field-help">
            Usa solo etiquetas genéricas: Escenario, Lanzamiento, Base, Mes,
            Regional, Escala, Conservador, Demo, Pronóstico, Crecimiento,
            Modelo o Prueba (solo se permiten meses del 1 al 12). No se permite
            HTML, caracteres especiales ni datos que identifiquen a una persona.
          </p>
          {scenarioError && <p className="error-message" role="alert">{scenarioError}</p>}
          {storageError && <p className="error-message" role="alert">{storageError}</p>}
        </form>

        <div className="scenario-list">
          {PRESET_SCENARIOS.map((scenario) => (
            <article className="scenario-row" key={scenario.id}>
              <div>
                <strong>{getScenarioDisplayName(scenario)}</strong>
                <span className="simulation-badge">{COHORT_LABEL}</span>
              </div>
              <button type="button" className="secondary-action" onClick={() => loadScenario(scenario)}>
                Cargar
              </button>
            </article>
          ))}
          {savedScenarios.map((scenario) => (
            <article className="scenario-row" key={scenario.id}>
              <div>
                <strong>{getScenarioDisplayName(scenario)}</strong>
                <span className="simulation-badge">{COHORT_LABEL}</span>
              </div>
              <div className="scenario-actions">
                <button type="button" className="secondary-action" onClick={() => loadScenario(scenario)}>
                  Cargar
                </button>
                <button type="button" className="delete-action" onClick={() => deleteScenario(scenario.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="comparison-section">
          <h3>Comparación lado a lado</h3>
          <div className="comparison-scroll" role="region" aria-label="Tabla comparativa de escenarios" tabIndex={0}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th scope="col">Escenario · datos simulados</th>
                  <th scope="col">Cuentas / conversión</th>
                  <th scope="col">Perfiles de Nivel 2</th>
                  <th scope="col">Empresas / perfiles</th>
                  <th scope="col">Perfiles / mes</th>
                  <th scope="col">Ingresos / mes</th>
                  <th scope="col">Utilidad bruta / mes</th>
                  <th scope="col">Margen</th>
                </tr>
              </thead>
              <tbody>
                {scenariosForComparison.map((scenario) => (
                  <tr key={scenario.id}>
                    <th scope="row">{scenario.displayName}</th>
                    <td>{scenario.assumptions.sandboxAccounts} / {scenario.assumptions.conversionPercent}%</td>
                    <td>{NUMBER.format(scenario.revenue.tier2Profiles)}</td>
                    <td>{scenario.assumptions.enterpriseClients} / {NUMBER.format(scenario.revenue.tier3Profiles)}</td>
                    <td>{NUMBER.format(scenario.revenue.totalProfiles)}</td>
                    <td>{formatCurrency(scenario.revenue.monthlyRevenue)}</td>
                    <td>{formatCurrency(scenario.revenue.monthlyGrossProfit)}</td>
                    <td>{scenario.revenue.grossMarginPercent.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
