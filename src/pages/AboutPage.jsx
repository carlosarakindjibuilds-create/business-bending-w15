import { Link } from "react-router-dom";
import { PUBLIC_SOCIAL_CHANNEL_URL } from "../config/publicChannel.js";

const COHORT_LABEL = "DATOS SIMULADOS / COHORTE DE PRUEBA (n=60)";

export default function AboutPage() {
  return (
    <main className="content-shell">
      <section className="page-heading">
        <p className="eyebrow">Validador del Comercio · Memo de valor</p>
        <h1>El Memo de Valor 10:1</h1>
        <p className="intro">
          Exploramos si un registro consentido del flujo de efectivo puede
          ayudar a revisar operaciones. No afirmamos que sustituya visitas,
          prediga impagos ni reduzca pérdidas; cualquier beneficio requiere
          validación con cada distribuidor.
        </p>
      </section>

      <section className="distribution-metrics" aria-labelledby="distribution-metrics-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Semana 15 · Estado inicial</p>
            <h2 id="distribution-metrics-heading">Métricas Honestas de Distribución</h2>
          </div>
        </div>
        <p className="metrics-honesty-note">
          Contadores de esta aplicación, no estadísticas verificadas de
          plataformas externas. No hay analítica ni conexión a Supabase
          configurada para atribución; no se han registrado eventos medidos.
        </p>
        <div className="distribution-metric-grid">
          <article className="distribution-metric-card">
            <h3>Alcance medido</h3>
            <p>0 reportes</p>
            <span>Sin fuente analítica conectada</span>
          </article>
          <article className="distribution-metric-card">
            <h3>Seguidores reportados</h3>
            <p>0 reportes</p>
            <span>Canal conectado; contador de seguidores no instrumentado</span>
          </article>
          <article className="distribution-metric-card">
            <h3>Clics atribuidos</h3>
            <p>0 registros</p>
            <span>Sin eventos de clic instrumentados</span>
          </article>
          <article className="distribution-metric-card">
            <h3>Capturas en Supabase</h3>
            <p>0 registros verificados</p>
            <span>Conexión y dashboard aún no confirmados</span>
          </article>
        </div>
        <div className="distribution-loop">
          <div>
            <p className="eyebrow">Ciclo de distribución</p>
            <p>
              Método demostrado en <Link to="/distribution">/distribution</Link>
              {" → "}
              {PUBLIC_SOCIAL_CHANNEL_URL ? (
                <a href={PUBLIC_SOCIAL_CHANNEL_URL} target="_blank" rel="noreferrer">
                  canal social público
                </a>
              ) : (
                <span>canal social: URL oficial pendiente</span>
              )}
              {" → "}
              <Link to="/waitlist">solicitud B2B en /waitlist</Link>
            </p>
          </div>
          <Link className="primary-action distribution-cta" to="/waitlist">
            Solicitar acceso B2B
          </Link>
        </div>
      </section>

      <p className="distribution-simulation-notice about-simulation-notice">
        {COHORT_LABEL}
      </p>
      <div className="memo-grid">
        <article className="memo-card">
          <h2>Lo que hace hoy nuestro usuario</h2>
          <p>
            La hipótesis de producto es que algunos comerciantes dan <em>fiado</em>
            {" "}sin un registro claro o reciben auditorías manuales de ruta.
            No hemos medido la prevalencia de estas situaciones ni probado
            respuestas de Buró de Crédito o Belvo para este grupo.
          </p>
        </article>
        <article className="memo-card">
          <h2>Lo que realmente le cuesta hoy</h2>
          <ul>
            <li>El costo de una visita manual debe verificarse con cada distribuidor; no está medido por este producto.</li>
            <li>No contamos con una cifra validada de pérdidas semanales por ruta.</li>
            <li>El impacto de una entrega sin liquidar depende de cada operación y no está medido.</li>
          </ul>
        </article>
        <article className="memo-card">
          <h2>Nuestro precio</h2>
          <ul>
            <li>La captura de voz gratuita para comerciantes es una propuesta de producto, no una integración activa de WhatsApp.</li>
            <li>El precio de $30 MXN por perfil validado (Nivel 2) es una tarifa propuesta.</li>
            <li>El precio de $15,000 MXN al mes + $15 MXN por perfil (Nivel 3) es una tarifa propuesta.</li>
          </ul>
        </article>
        <article className="memo-card memo-card--highlight">
          <h2>Hipótesis de valor 10:1 por validar</h2>
          <p>
            La relación 10:1 es una hipótesis de valor, no un ahorro medido ni
            una promesa. Debe validarse con costos documentados del comprador
            y sin atribuir resultados a una sola señal.
          </p>
        </article>
      </div>
      <p className="disclaimer">
        Las cifras de cohortes que aparezcan en las herramientas de demostración
        llevan la etiqueta de cohorte simulada. Los precios del memo son
        propuestas y cualquier ahorro requiere validación con cada cliente.
      </p>
    </main>
  );
}
